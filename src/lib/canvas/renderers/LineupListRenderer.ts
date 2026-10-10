import { Colours } from '$lib/Constants';
import type { Match, MatchImage, Player } from '$lib/database/IndexedDB';
import { getMatchPositions } from '$lib/database/MatchPositionDBService';
import { getMatchRolesByType } from '$lib/database/MatchRoleDBService';
import { getMatchTags } from '$lib/database/MatchTagDBService';
import { getPlayersByKeys } from '$lib/database/PlayerDBService';
import { getYesSelectionsByMatchId } from '$lib/database/SelectionDBService';
import type { CanvasImage } from '$lib/types/Images';
import { KIT_BACKGROUND, KIT_VALUES } from '../constants/Colours';
import { drawSponsors } from '../drawers/SponsorsDrawer';
import { getImageBitmap } from '../ImageCache';
import canvasSplitter from './CanvasSplitter';

export default async function LineupListRenderer(
	canvas: HTMLCanvasElement | OffscreenCanvas,
	match: Match,
	images: CanvasImage[] = [],
): Promise<Omit<MatchImage, 'id'>[]> {
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) {
		throw new Error('Failed to get 2D context');
	}

	const selections = await getYesSelectionsByMatchId(match.id);
	const positions = (await getMatchPositions(match.id)).toSorted((a, b) =>
		a.position.localeCompare(b.position),
	);
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
		ctx.fillStyle = KIT_BACKGROUND[KIT_VALUES.MAIN];
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	let y = 160;

	{
		const img = await getImageBitmap('/img/backgrounds/seniors/senior-gold-1-panel-basic.png');
		ctx.drawImage(img, 0, 0);
	}

	if (match.team) {
		const title = [match.team.squad, 'LINEUP'].join(' ').trim();
		const size = 140;
		ctx.font = `${size}px black`;
		ctx.textAlign = 'left';
		ctx.fillStyle = Colours.WHITE;
		ctx.lineWidth = 16;
		ctx.strokeStyle = Colours.NAVY;
		ctx.strokeText(title, 60, y);
		ctx.fillText(title, 60, y);
		y += 20;
	}

	if (match.detail) {
		// Match type
		const size = 60;
		const margin = 20;

		ctx.font = `${size}px black`;
		ctx.textAlign = 'left';
		ctx.lineWidth = 12;
		ctx.fillStyle = Colours.GOLD;
		ctx.strokeStyle = Colours.NAVY;

		const lines = match.detail.type.split('\n');

		lines.forEach((line, index) => {
			ctx.strokeText(line, 60, y + index * size + size);
			ctx.fillText(line, 60, y + index * size + size);
			y += 16;
		});

		y += size + lines.length * size + margin;
	}
	const awayTeam = match.detail?.venue === 'HOME' ? match.opponent : match.team;
	if (awayTeam) {
		const x1 = 60;
		const y1 = y - 100;
		const lineHeight = 54;

		const lines = [['vs', awayTeam.club, awayTeam.squad].join(' ')];
		ctx.font = `${lineHeight}px regular`;
		ctx.textAlign = 'left';
		ctx.lineWidth = 8;
		ctx.fillStyle = Colours.WHITE;
		ctx.strokeStyle = Colours.NAVY;
		lines.forEach((line, index) => {
			ctx.strokeText(line, x1, y1 + 95 + index * 40);
			ctx.fillText(line, x1, y1 + 95 + index * 40);
		});
	}

	const X_START = 50;
	const Y_START = 10;

	for (const [i, position] of positions.entries()) {
		console.log(position);
		const x = X_START;
		const y = 400;

		ctx.fillStyle = Colours.WHITE;
		ctx.strokeStyle = Colours.NAVY;
		ctx.strokeText(position.position, x, y);
		ctx.fillText(position.position, x, y);
	}

	// await drawBadge(ctx, match, 60, y - 40);

	await drawSponsors(ctx, 60, 1120);

	const legend = legendText(finishers, debuts);
	// const legend = '🍟 Home Grown';
	ctx.font = `30px regular`;
	ctx.textAlign = 'right';
	ctx.lineWidth = 6;
	ctx.fillStyle = Colours.WHITE;
	ctx.strokeStyle = Colours.NAVY;
	ctx.strokeText(legend, 1080 - 60, 1280);
	ctx.fillText(legend, 1080 - 60, 1280);

	return (await canvasSplitter(canvas)).map(({ page, base64 }) => ({
		matchId: match.id,
		type: 'LINEUP_LIST',
		page,
		base64,
		createdAt: new Date().toISOString(),
	}));
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
