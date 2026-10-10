import { Colours } from '$lib/Constants';
import type { Match, MatchImage } from '$lib/database/IndexedDB';
import type { CanvasImage } from '$lib/types/Images';
import { drawSponsorsVertical } from '../drawers/SponsorsDrawer';
import canvasSplitter from './CanvasSplitter';

export default async function highlightRenderer(
	canvas: OffscreenCanvas | HTMLCanvasElement,
	match: Match,
	images: CanvasImage[] = [],
): Promise<Omit<MatchImage, 'id'>[]> {

	const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
	if (!ctx) {
		throw new Error('Failed to get 2D context');
	}

	await drawSponsorsVertical(ctx, 1080 - 60 - 150, 1000, match, images);

	const badgeY = 120;

	const homeTeamImage = images.find((image) => image.uploadType === 'HOME');
	if (homeTeamImage) {
		const x = 350;
		const y = badgeY;
		ctx.fillStyle = Colours.WHITE;
		ctx.lineWidth = 4;
		ctx.strokeStyle = Colours.NAVY;
		ctx.fillRect(x, y, 170, 170);
		ctx.strokeRect(x, y, 170, 170);
		ctx.drawImage(homeTeamImage.photo, x + 10, y + 10);
	}

	const awayTeamImage = images.find((image) => image.uploadType === 'AWAY');
	if (awayTeamImage) {
		const x = 560;
		const y = badgeY;
		ctx.fillStyle = Colours.WHITE;
		ctx.lineWidth = 4;
		ctx.strokeStyle = Colours.NAVY;
		ctx.fillRect(x, y, 170, 170);
		ctx.strokeRect(x, y, 170, 170);
		ctx.drawImage(awayTeamImage.photo, x + 10, y + 10);
	}

	if (match.result !== undefined) {
		const { homeScore, awayScore } = match.result;

		const centerHeight = badgeY + 150;

		const homeString = homeScore.toString();
		const awayString = awayScore.toString();
		const title = 'Highlight of the Week'.toUpperCase();
		ctx.font = `60px semiBold`;
		ctx.textAlign = 'center';
		ctx.fillStyle = Colours.WHITE;
		ctx.strokeStyle = Colours.NAVY;
		ctx.lineWidth = 6;

		ctx.strokeText(title, 540, centerHeight - 180);
		ctx.fillText(title, 540, centerHeight - 180);

		ctx.font = `160px semiBold`;
		ctx.textAlign = 'center';

		ctx.fillStyle = Colours.WHITE;
		ctx.strokeStyle = Colours.NAVY;
		ctx.lineWidth = 8;

		ctx.textAlign = 'right';

		ctx.strokeText(homeString, 540 - 220, centerHeight);
		ctx.fillText(homeString, 540 - 220, centerHeight);

		ctx.textAlign = 'left';

		ctx.strokeText(awayString, 540 + 220, centerHeight);
		ctx.fillText(awayString, 540 + 220, centerHeight);
	}


	// ctx.fillStyle = Colours.NAVY;
	// ctx.fillRect(0, 0, canvas.width, canvas.height);

	// const img = await fetch(
	// 	'https://glowfinger.blob.core.windows.net/smg/background-removed/DSC02490.png',
	// )
	// 	.then((response) => response.blob())
	// 	.then(async (blob) => await createImageBitmap(blob));

	// // Scale image to fit within 500x500 while maintaining aspect ratio
	// const maxDimension = 700;
	// let imgWidth = img.width;
	// let imgHeight = img.height;

	// if (imgWidth > maxDimension || imgHeight > maxDimension) {
	// 	const scale = Math.min(maxDimension / imgWidth, maxDimension / imgHeight);
	// 	imgWidth *= scale;
	// 	imgHeight *= scale;
	// }

	// ctx.drawImage(img, -50, 1080 - imgHeight, imgWidth, imgHeight);

	// const img2 = await fetch(
	// 	'https://glowfinger.blob.core.windows.net/smg/background-removed/DSC02092.png',
	// )
	// 	.then((response) => response.blob())
	// 	.then(async (blob) => await createImageBitmap(blob));

	// // Scale image to fit within 500x500 while maintaining aspect ratio

	// let imgWidth2 = img2.width;
	// let imgHeight2 = img2.height;

	// if (imgWidth2 > maxDimension || imgHeight2 > maxDimension) {
	// 	const scale = Math.min(maxDimension / imgWidth2, maxDimension / imgHeight2);
	// 	imgWidth2 *= scale;
	// 	imgHeight2 *= scale;
	// }

	// ctx.drawImage(img2, 500, 1080 - imgHeight2, imgWidth2, imgHeight2);

	// drawTitle(ctx, 'TRY OF', 50, 120);
	// drawTitle(ctx, 'THE WEEK', 50, 260);


	return (await canvasSplitter(canvas as OffscreenCanvas)).map(({ page, base64 }) => ({
		matchId: match.id,
		type: 'HIGHLIGHT',
		page,
		base64,
		createdAt: new Date().toISOString(),
	}));
}
