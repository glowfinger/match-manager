import { Colours } from '$lib/Constants';
import type { Match, MatchImage, MatchRole, Player } from '$lib/database/IndexedDB';
import { getMatchPositions } from '$lib/database/MatchPositionDBService';
import { getMatchRolesByType } from '$lib/database/MatchRoleDBService';
import { getMatchTags } from '$lib/database/MatchTagDBService';
import { getPlayersByKeys } from '$lib/database/PlayerDBService';
import { getYesSelectionsByMatchId } from '$lib/database/SelectionDBService';
import type { CanvasImage } from '$lib/types/Images';
import { KIT_BACKGROUND, KIT_VALUES } from '../constants/Colours';
import StarterPositons from '../constants/lineup/StarterPositons';
import { drawBadges } from '../drawers/BadgeDrawer';
import nameTagDrawer from '../drawers/NameTagDrawer';
import photoDrawer from '../drawers/PhotoDrawer';
import { drawSponsors, drawSponsorsVertical } from '../drawers/SponsorsDrawer';
import { drawSmallTitle, drawVersusTitle } from '../TextDrawer';
import canvasSplitter from './CanvasSplitter';
import finisherListPartialRenderer from './lineup/FinisherListPartialRenderer';
import finishersPartialRenderer from './lineup/FinishersPartialRenderer';
import InfoPartialRenderer from './lineup/InfoPartialRenderer';

const showShortName = false;

export default async function LineupRenderer(
	canvas: HTMLCanvasElement | OffscreenCanvas,
	match: Match,
	images: CanvasImage[] = [],
): Promise<Omit<MatchImage, 'id'>[]> {
	if (!canvas) {
		return [];
	}

	const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
	if (!ctx) {
		throw new Error('Failed to get 2D context');
	}

	canvas.width = 1080 * 4;
	canvas.height = 1350;

	const selections = await getYesSelectionsByMatchId(match.id);
	const positions = await getMatchPositions(match.id);
	const players = await getPlayersByKeys(selections.map((s) => s.playerKey));
	const debuts = (await getMatchTags(match.id, 'debut')).map((t) => t.playerKey);
	const leadershipRoles = await getMatchRolesByType(match.id, 'leadership');

	const finishersLoaded: Player[] = await getPlayersByKeys(
		selections
			.filter((s) => !positions.some((p) => p.playerKey === s.playerKey))
			.map((s) => s.playerKey),
	);

	// This ordering should be loaded from the database
	const finishers = finishersLoaded;

	if (match.detail) {
		ctx.fillStyle = KIT_BACKGROUND[match.detail?.kit ?? KIT_VALUES.MAIN];
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	} else {
		ctx.fillStyle = Colours.WHITE;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	const backgroundImage = images.find((image) => image.uploadType === 'BACKGROUND');
	if (backgroundImage) {
		ctx.drawImage(backgroundImage.photo, 0, 0);
	}

	const mainImage = images.find(
		(image) => image.uploadType === 'UPLOAD' && image.mediaType === 'MAIN',
	);

	if (mainImage) {
		const destination = { width: 1080, height: 1350, x: 0, y: 0 };
		await photoDrawer(
			ctx as CanvasRenderingContext2D,
			mainImage.photo,
			destination,
			{ width: mainImage.photo.width, height: mainImage.photo.height, x: 0, y: 0 },
			mainImage.settings.zoom,
			mainImage.settings.x,
			mainImage.settings.y,
		);
	}

	const backgroundCutoutImage = images.find((image) => image.uploadType === 'BACKGROUND_CUTOUT');
	if (backgroundCutoutImage) {
		ctx.drawImage(backgroundCutoutImage.photo, 0, 0);
	}

	await InfoPartialRenderer(ctx, match);

	drawSmallTitle(ctx, 'FORWARDS', 1080 + 60, 120);
	drawVersusTitle(ctx, `vs ${match.opponent?.club ?? ''}`, 1080 + 60, 180);
	drawSmallTitle(ctx, 'BACKS', 1080 + 1080 + 60, 120);
	drawVersusTitle(ctx, `vs ${match.opponent?.club ?? ''}`, 1080 + 1080 + 60, 180);

	// // // aysnc loop
	for (const i of StarterPositons) {
		const position = positions.find((s) => s.position === i.number);

		if (!position) {
			continue;
		}

		const player = players.find((p) => p.key === position?.playerKey);

		if (!player) {
			continue;
		}

		let x = i.x;
		const y = i.y;
		if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(i.number)) {
			x = x + 1080;
		}

		if (['9', '10', '11', '12', '13', '14', '15'].includes(i.number)) {
			x = x + 1080 + 1080;
		}

		drawPlayerNumber(ctx, i.number, x + 100, y + 100);

		const positionImage = images.find(
			(image) => image.uploadType === position.position && image.mediaType === 'POSITION',
		);
		if (positionImage) {
			ctx.drawImage(positionImage.photo, x + 10, y, 240, 240);
		}

		const name = generateName(player, debuts, showShortName, leadershipRoles);
		nameTagDrawer(ctx as CanvasRenderingContext2D, name, x - 20, y + 260 - 40);
	}

	await drawBadges(ctx, match, 60, 460, images);

	const offsetX = 1080 + 1080 + 1080;

	console.log(finishers, finishers.length);

	if (finishers.length > 0 && finishers.length <= 3) {
		await finishersPartialRenderer(ctx, match, offsetX, finishers, images);
	}

	await finisherListPartialRenderer(ctx, match, offsetX, finishers, images);

	// const layout = layouts[finishers.length] ?? [];
	// for (const [i, player] of finishers.entries()) {
	// 	const { x, y } = layout[i];
	// 	const name = generateName(player, debuts, showShortName, leadershipRoles);
	// 	nameTagDrawer(ctx as CanvasRenderingContext2D, name, x + offsetX, y);
	// }

	const legend = legendText(finishers, debuts);
	// const legend = '🍟 Home Grown';
	ctx.font = `30px regular`;
	ctx.textAlign = 'right';
	ctx.lineWidth = 6;
	ctx.fillStyle = Colours.WHITE;
	ctx.strokeStyle = Colours.NAVY;
	ctx.strokeText(legend, 1080 * 2 - 60, 1280);
	ctx.fillText(legend, 1080 * 2 - 60, 1280);
	ctx.strokeText(legend, 1080 * 3 - 60, 1280);
	ctx.fillText(legend, 1080 * 3 - 60, 1280);
	ctx.strokeText(legend, 1080 * 4 - 60, 1280);
	ctx.fillText(legend, 1080 * 4 - 60, 1280);

	// draw sponsors on each page
	for (const page of [1, 2, 3]) {
		await drawSponsors(ctx, 60 + (page - 1) * 1080, 1120);
	}

	await drawSponsorsVertical(ctx, 1080 * 4 - 60 - 160, 60, match, images);

	return (await canvasSplitter(canvas as OffscreenCanvas)).map(({ page, base64 }) => ({
		matchId: match.id,
		type: 'LINEUP',
		page,
		base64,
		createdAt: new Date().toISOString(),
	}));
}

export function drawPlayerNumber(
	ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
	number: string,
	x: number,
	y: number,
): void {
	ctx.font = `140px black`;
	ctx.textAlign = 'right';

	ctx.fillStyle = Colours.WHITE;
	ctx.fillText(number, x, y);

	ctx.lineWidth = 6;
	ctx.strokeStyle = Colours.NAVY;
	ctx.strokeText(number, x, y);
}

function generateName(
	player: Player,
	debuts: string[],
	shortName: boolean = false,
	leadershipRoles: MatchRole[],
): string {
	let name = '';

	if (player.tags.homegrown) {
		name = name + '🍟';
	}

	if (name.length > 0) {
		name = name + ' ';
	}

	if (debuts.includes(player.key)) {
		name = name + '📣';
	}

	if (name.length > 0) {
		name = name + ' ';
	}

	if (shortName) {
		name = name + player.bio.last;
	} else {
		name = name + player.bio.screen;
	}

	const leadershipRole = leadershipRoles.find((r) => r.playerKey === player.key);
	if (leadershipRole?.role === 'captain') {
		name += ` (C)`;
	} else if (leadershipRole?.role === 'vice-captain') {
		name += ` (VC)`;
	} else if (leadershipRole?.role === 'pack-leader') {
		name += ` (PL)`;
	}

	return name;
}

function legendText(players: Player[], debuts: string[]): string {
	const strings: string[] = [];

	if (players.some((p) => p.tags.homegrown)) {
		strings.push('🍟 Home Grown');
	}
	if (debuts.length > 0) {
		strings.push('📣 Debut');
	}
	return strings.join(' | ');
}
