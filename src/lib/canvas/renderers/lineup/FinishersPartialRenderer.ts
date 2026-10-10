import StarterPositons from '$lib/canvas/constants/lineup/StarterPositons';
import headshotLoader from '$lib/canvas/images/HeadshotLoader';
import { drawSmallTitle, drawVersusTitle } from '$lib/canvas/TextDrawer';
import { Colours } from '$lib/Constants';
import type { Match, Player } from '$lib/database/IndexedDB';
import { getMatchPositions } from '$lib/database/MatchPositionDBService';
import { getMatchTags } from '$lib/database/MatchTagDBService';
import { getPlayersByKeys } from '$lib/database/PlayerDBService';
import { getYesSelectionsByMatchId } from '$lib/database/SelectionDBService';
import type { CanvasImage } from '$lib/types/Images';

const TITLE = 'FINISHERS';

const layouts: Record<number, { x: number; y: number }[]> = {
	1: [{ x: 410, y: 1080 }],
	2: [
		{ x: 1080, y: 1080 },
		{ x: 1080, y: 1080 },
	],
	3: [
		{ x: 60, y: 1080 },
		{ x: 410, y: 1080 },
		{ x: 760, y: 1080 },
	],
};

export default async function finishersPartialRenderer(
	ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
	match: Match,
	offsetX: number,
	players: Player[],
	images: CanvasImage[],
): Promise<void> {
	const x = offsetX + 60;
	drawSmallTitle(ctx, TITLE, x, 120);
	drawVersusTitle(ctx, `vs ${match.opponent?.club ?? ''}`, x, 180);

	const layout = layouts[players.length] ?? [];

	for (const [i, player] of players.entries()) {
		const { x, y } = layout[i];
	}
}

async function finishersPartialRendererA(
	ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
	match: Match,
	offsetX: number = 0,
): Promise<void> {
	const debuts = (await getMatchTags(match.id, 'debut')).map((t) => t.playerKey);
	const selections = await getYesSelectionsByMatchId(match.id);
	const positions = (await getMatchPositions(match.id)).map((p) => p.playerKey);

	const finishers = selections.filter(({ playerKey }) => !positions.includes(playerKey));
	const players = await getPlayersByKeys(finishers.map((s) => s.playerKey));

	// const x = offsetX + 60;
	// drawSmallTitle(ctx, TITLE, x, 120);
	// drawVersusTitle(ctx, `vs ${match.opponent?.club ?? ''}`, x, 180);

	const coords = StarterPositons.filter(
		(s) => s.number.includes('11') || s.number.includes('15') || s.number.includes('14'),
	).map((s) => ({ x: s.x + 1080 * 3, y: s.y + 460 }));

	const imagetypes = ['profile-left', 'profile-front', 'profile-right'];

	for (const [i, player] of players.entries()) {
		const { x, y } = coords[i];
		const imagetype = imagetypes[i];
		if (!player) {
			return;
		}
		const kitType = match.detail?.kit === 'SECONDARY' ? 'away' : 'home';
		// 	const url = player.images.find((i) => i.type === imagetype && i.kit === kitType)?.large;
		// 	if (url) {
		// 		const img = await getImageBitmap(url);
		// 		if (img && i === 1) {
		// 			const ratio = 600 / img.height;
		// 			const x_offset = (img.width * ratio) / 2;
		// 			ctx.drawImage(img, x - x_offset / 2, y - 500, img.width * ratio, img.height * ratio);
		// 		}
		// 	}
		// }
		// for (const [i, player] of players.entries()) {
		// 	const { x, y } = coords[i];
		// 	const imagetype = imagetypes[i];
		// 	if (!player) {
		// 		return;
		// 	}
		// 	const kitType = match.detail?.kit === 'SECONDARY' ? 'away' : 'home';
		// 	const url = player.images.find((i) => i.type === imagetype && i.kit === kitType)?.large;
		// 	if (url) {
		// 		const img = await getImageBitmap(url);
		// 		if (img && i !== 1) {
		// 			const ratio = 600 / img.height;
		// 			const x_offset = (img.width * ratio) / 2;
		// 			ctx.drawImage(img, x - x_offset / 2, y - 500, img.width * ratio, img.height * ratio);
		// 		}
		// 	}
		// }
		// 	const img = finisherImages.find((p) => p.key === player.key);
		// 	});
		// list.forEach((player, i) => {
		// 	const { x, y } = coords[i];
		// 	if (!player) {
		// 		return;
		// 	}
		// players.forEach(async (player, i) => {
		// 	const { x, y } = coords[i];
		// 	const imagetype = imagetypes[i];
		// 	if (!player) {
		// 		return;
		// 	}
		// 	const url = player.images.find((i) => i.type === imagetype)?.large;
		// 	if (url) {
		// 		const img = await getImageBitmap(url);
		// 		if (img && i === 1) {
		// 			const ratio = 700 / img.height;
		// 			const x_offset = (img.width * ratio) / 2;
		// 			ctx.drawImage(img, x - x_offset / 2, y - 500, img.width * ratio, img.height * ratio);
		// 		}
		// 	}
		// 	const img = finisherImages.find((p) => p.key === player.key);
		// });
		// list.forEach((player, i) => {
		// 	const { x, y } = coords[i];
		// 	if (!player) {
		// 		return;
		// 	}
		// 	const img = finisherImages.find((p) => p.key === player.key);
		// 	if (img && i !== 1) {
		// 		const ratio = 700 / img.photo.height;
		// 		const x_offset = (img.photo.width * ratio) / 2;
		// 		ctx.drawImage(
		// 			img.photo,
		// 			x - x_offset / 2,
		// 			y - 500,
		// 			img.photo.width * ratio,
		// 			img.photo.height * ratio,
		// 		);
	}

	coords.forEach((coord) => {
		// let { x, y } = coord;
		// y = y - 240;
		// ctx.fillStyle = 'white';
		// ctx.fillRect(x, y, 260, 40);
		// ctx.strokeStyle = Colours.NAVY;
		// ctx.lineWidth = 3;
		// ctx.strokeRect(x, y, 260, 40);
		// ctx.font = `24px semiBold`;
		// ctx.textAlign = 'center';
		// ctx.fillStyle = 'black';
		// ctx.fillText('TBC', x + 130, y + 30);
	});

	players.forEach((player, i) => {
		let { x, y } = [
			{ x: 3400, y: 1400 },
			{ x: 3920, y: 1400 },
		][i];

		y = y - 240;
		if (!player) {
			return;
		}
		ctx.fillStyle = 'white';
		ctx.fillRect(x, y, 260, 40);
		ctx.strokeStyle = Colours.NAVY;
		ctx.lineWidth = 3;
		ctx.strokeRect(x, y, 260, 40);
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
		// 	const role = roles.find((r) => r.key === player.key);
		// 	if (role) {
		// 		name += ` (${role.role})`;
		// 	}
		ctx.font = `24px semiBold`;
		ctx.textAlign = 'center';
		ctx.fillStyle = 'black';
		ctx.fillText(name, x + 130, y + 30);
		// });
		// const legend = '🍟 Home Grown';
		// // const legend = '🍟 Home Grown';
		// ctx.font = `24px regular`;
		// ctx.textAlign = 'left';
		// ctx.lineWidth = 4;
		// ctx.fillStyle = Colours.WHITE;
		// ctx.strokeStyle = Colours.NAVY;
		// ctx.strokeText(legend, 40, 1040);
		// ctx.fillText(legend, 40, 1040);
		// // Badges
		// badgeImages.forEach((img, i) => {
		// 	if (i === 0) {
		// 		ctx.drawImage(img, 900, 40, 140, 140);
		// 	}
	});

	const list = selections
		.filter(({ playerKey }) => !positions.some((p) => p.playerKey === playerKey))
		.map(({ playerKey }) => players.find((p) => p.key === playerKey))
		.filter((p) => p);

	list.forEach(async (player, i) => {
		const { x, y } = coords[i];
		if (!player) {
			return;
		}

		const image = await headshotLoader(match.detail?.kit ?? 'SECONDARY', player);
		if (image) {
			ctx.drawImage(image, x + 10, y, 240, 240);
		}

		// const img = finisherImages.find((p) => p.key === player.key);
		// if (img && i === 1) {
		// 	const ratio = 700 / img.photo.height;
		// 	const x_offset = (img.photo.width * ratio) / 2;
		// 	ctx.drawImage(
		// 		img.photo,
		// 		x - x_offset / 2,
		// 		y - 500,
		// 		img.photo.width * ratio,
		// 		img.photo.height * ratio,
		// 	);
		// }
	});

	list.forEach(async (player, i) => {
		const { x, y } = coords[i];

		if (!player) {
			return;
		}

		const image = await headshotLoader(match.detail?.kit ?? 'SECONDARY', player);

		if (image) {
			ctx.drawImage(image, x + 10, y, 240, 240);
		}

		// if (img && i !== 1) {
		// 	const ratio = 700 / img.photo.height;
		// 	const x_offset = (img.photo.width * ratio) / 2;

		// 	ctx.drawImage(
		// 		img.photo,
		// 		x - x_offset / 2,
		// 		y - 500,
		// 		img.photo.width * ratio,
		// 		img.photo.height * ratio,
		// 	);
		// }
	});

	list.forEach((player, i) => {
		const { x, y } = coords[i];

		if (!player) {
			return;
		}

		ctx.fillStyle = 'white';
		ctx.fillRect(x, y, 260, 40);

		ctx.strokeStyle = Colours.NAVY;
		ctx.lineWidth = 3;
		ctx.strokeRect(x, y, 260, 40);

		let name = '';
		// if (player.tags.homegrown) {
		// 	name = '🍟' + name;
		// }

		// if (debutants.includes(player.key)) {
		// 	name = '📣' + name;
		// }

		if (name.length > 0) {
			name = name + ' ' + player.bio.screen;
		} else {
			name = player.bio.screen;
		}

		// const role = roles.find((r) => r.key === player.key);

		// if (role) {
		// 	name += ` (${role.role})`;
		// }

		ctx.font = `24px semiBold`;
		ctx.textAlign = 'center';
		ctx.fillStyle = 'black';
		ctx.fillText(name, x + 130, y + 30);

		const legend = '🍟 Home Grown';
		// const legend = '🍟 Home Grown';
		ctx.font = `24px regular`;
		ctx.textAlign = 'left';
		ctx.lineWidth = 4;
		ctx.fillStyle = Colours.WHITE;
		ctx.strokeStyle = Colours.NAVY;
		ctx.strokeText(legend, 40, 1040);
		ctx.fillText(legend, 40, 1040);
	});
}
