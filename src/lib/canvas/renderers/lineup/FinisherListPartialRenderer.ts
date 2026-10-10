import headshotLoader from '$lib/canvas/images/HeadshotLoader';
import { drawSmallTitle, drawVersusTitle } from '$lib/canvas/TextDrawer';
import { Colours } from '$lib/Constants';
import type { Match, Player } from '$lib/database/IndexedDB';
import { getMatchRolesByType } from '$lib/database/MatchRoleDBService';
import { getMatchTags } from '$lib/database/MatchTagDBService';
import type { CanvasImage } from '$lib/types/Images';

const TITLE = 'FINISHERS';

const ROW_Y1 = 0;
const ROW_Y2 = ROW_Y1 + 300;
const ROW_Y3 = ROW_Y2 + 300;

const PAGE_WIDTH = 0;

const COLUMN_X1 = PAGE_WIDTH + 60;
const COLUMN_X2 = PAGE_WIDTH + 160 + 60 + 15;
const COLUMN_X3 = PAGE_WIDTH + 320 + 90;
const COLUMN_X4 = PAGE_WIDTH + 480 + 90 + 15;
const COLUMN_X5 = PAGE_WIDTH + 640 + 60 + 60;

const COORDS = [
	{ x: COLUMN_X2, y: ROW_Y1 },
	{ x: COLUMN_X4, y: ROW_Y1 },
	{ x: COLUMN_X4, y: ROW_Y2 },
	{ x: COLUMN_X2, y: ROW_Y2 },
	{ x: COLUMN_X4, y: ROW_Y3 },
	{ x: COLUMN_X2, y: ROW_Y3 },
];

export default async function finisherListPartialRenderer(
	ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
	match: Match,
	offsetX: number,
	players: Player[],
	images: CanvasImage[],
): Promise<void> {
	console.log('fired');

	const debuts = (await getMatchTags(match.id, 'debut')).map((t) => t.playerKey);
	const leadershipRoles = await getMatchRolesByType(match.id, 'leadership');

	const x = 1080 + 1080 + 1080 + 60;
	drawSmallTitle(ctx, TITLE, x, 120);
	drawVersusTitle(ctx, `vs ${match.opponent?.club ?? ''}`, x, 180);

	const coords = getCoords(players.length);
	for (const [i, coord] of coords.entries()) {
		const player = players[i];
		if (!player) {
			continue;
		}

		const x = coord.x + 1080 * 3;

		const y = coord.y + 300;

		const image = await headshotLoader(match.detail?.kit ?? 'MAIN', player);
		if (image) {
			ctx.drawImage(image, x + 10, y, 240, 240);
		}

		ctx.fillStyle = 'white';
		ctx.fillRect(x, y + 260 - 40, 260, 40);

		ctx.strokeStyle = Colours.NAVY;
		ctx.lineWidth = 3;
		ctx.strokeRect(x, y + 260 - 40, 260, 40);

		ctx.font = `24px semiBold`;
		ctx.textAlign = 'center';
		ctx.fillStyle = 'black';

		let name = '';

		if (player.tags.homegrown) {
			name = '🍟' + name;
		}

		if (debuts.includes(player.key)) {
			name = '📣' + name;
		}

		if (name.length > 0) {
			name = name + ' ' + player.bio.screen;
		} else {
			name = player.bio.screen;
		}

		// TODO unnest the ifs

		const leadershipRole = leadershipRoles.find((r) => r.playerKey === player.key);
		if (leadershipRole?.role === 'captain') {
			name += ` (C)`;
		} else if (leadershipRole?.role === 'vice-captain') {
			name += ` (VC)`;
		} else if (leadershipRole?.role === 'pack-leader') {
			name += ` (PL)`;
		}

		ctx.fillText(name, x + 130, y + 260 - 10);
	}
}

function getCoords(length: number) {
	if (length === 2) {
		return [COORDS[0], COORDS[2]];
	}

	if (length === 3) {
		const OFFSET_Y = -140;
		return [
			{ x: COLUMN_X4, y: ROW_Y2 },
			{ x: COLUMN_X2, y: ROW_Y2 },
			{ x: COLUMN_X3, y: ROW_Y3 },
		].map(({ x, y }) => {
			return { x: x, y: y + OFFSET_Y };
		});
	}

	return COORDS;
}
