import { Colours } from '$lib/Constants';
import type { Match, MatchImage } from '$lib/database/IndexedDB';
import { getMatchRolesByType } from '$lib/database/MatchRoleDBService';
import { getPlayersByKeys } from '$lib/database/PlayerDBService';
import type { CanvasImage } from '$lib/types/Images';
import { KIT_VALUES } from '../constants/Colours';
import photoDrawer from '../drawers/PhotoDrawer';

import { drawSponsorsVertical } from '../drawers/SponsorsDrawer';
import { getImageBitmap } from '../ImageCache';
import canvasSplitter from './CanvasSplitter';
import { backgrounds } from './MatchRenderer';

export default async function resultRender(
	canvas: OffscreenCanvas | HTMLCanvasElement,
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

	ctx.fillStyle = backgrounds[match.detail?.kit ?? KIT_VALUES.MAIN];
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const backgroundImage = images.find((image) => image.uploadType === 'BACKGROUND');

	if (backgroundImage) {
		ctx.drawImage(
			backgroundImage.photo,
			0,
			675,
			canvas.width,
			675,
			0,
			675,
			canvas.width,
			canvas.height,
		);
	}

	const mainImage = images.find(getMainImage);

	if (mainImage) {
		const destination = { width: 1080, height: 675, x: 0, y: 0 };

		const source = { width: mainImage.photo.width, height: mainImage.photo.height, x: 0, y: 0 };

		await photoDrawer(
			ctx as CanvasRenderingContext2D,
			mainImage.photo,
			destination,
			source,
			mainImage.settings.zoom,
			mainImage.settings.x,
			mainImage.settings.y,
		);
	}

	const img = await getImageBitmap('/img/photos/boag-motm.png');
	ctx.drawImage(img, 0, 0);
	if (match.detail?.venue === 'HOME') {
		{
			const TITLE = [match.team?.club ?? '', match.team?.squad ?? ''].join(' ').trim();
			ctx.font = `80px black`;
			ctx.textAlign = 'left';
			ctx.fillStyle = Colours.GOLD;
			ctx.lineWidth = 8;
			ctx.strokeStyle = Colours.NAVY;
			ctx.strokeText(TITLE, 60, 100);
			ctx.fillText(TITLE, 60, 100);
		}

		{
			const TITLE = ['vs', match.opponent?.club ?? '', match.opponent?.squad ?? '']
				.join(' ')
				.trim();
			ctx.font = `60px regular`;
			ctx.textAlign = 'left';
			ctx.fillStyle = Colours.WHITE;
			ctx.lineWidth = 8;
			ctx.strokeStyle = Colours.NAVY;
			ctx.strokeText(TITLE, 60, 180);
			ctx.fillText(TITLE, 60, 180);
		}
	} else {
		{
			const TITLE = [match.opponent?.club ?? '', match.opponent?.squad ?? '', 'vs']
				.join(' ')
				.trim();
			ctx.font = `60px regular`;
			ctx.textAlign = 'left';
			ctx.fillStyle = Colours.WHITE;
			ctx.lineWidth = 8;
			ctx.strokeStyle = Colours.NAVY;
			ctx.strokeText(TITLE, 60, 100);
			ctx.fillText(TITLE, 60, 100);
		}
		{
			const TITLE = [match.team?.club ?? '', match.team?.squad ?? ''].join(' ').trim();
			ctx.font = `80px black`;
			ctx.textAlign = 'left';
			ctx.fillStyle = Colours.GOLD;
			ctx.lineWidth = 8;
			ctx.strokeStyle = Colours.NAVY;
			ctx.strokeText(TITLE, 60, 210);
			ctx.fillText(TITLE, 60, 210);
		}
	}

	const badgeY = 610;

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
		const title = 'Final Score';
		ctx.font = `60px semiBold`;
		ctx.textAlign = 'center';
		ctx.fillStyle = Colours.WHITE;
		ctx.strokeStyle = Colours.NAVY;
		ctx.lineWidth = 10;

		ctx.strokeText(title, 540, centerHeight - 170);
		ctx.fillText(title, 540, centerHeight - 170);

		ctx.font = `160px semiBold`;
		ctx.textAlign = 'center';

		ctx.fillStyle = Colours.WHITE;
		ctx.lineWidth = 10;
		ctx.strokeStyle = Colours.NAVY;

		ctx.textAlign = 'right';

		ctx.strokeText(homeString, 540 - 220, centerHeight);
		ctx.fillText(homeString, 540 - 220, centerHeight);

		ctx.textAlign = 'left';

		ctx.strokeText(awayString, 540 + 220, centerHeight);
		ctx.fillText(awayString, 540 + 220, centerHeight);
	}


	const awards = await getMatchRolesByType(match.id, 'awards');
	const players = await getPlayersByKeys(awards.map((s) => s.playerKey));

	const forwardsAwards = awards.find((s) => s.role === 'forwards-motm');
	const backsAwards = awards.find((s) => s.role === 'backs-motm');
	const motmAwards = awards.find((s) => s.role === 'motm');

	if (forwardsAwards && backsAwards) {
		const img = await getImageBitmap('/img/photos/1xv-worth1.png');
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

		const forwardsPlayer = players.find((s) => s.key === forwardsAwards.playerKey);

		const nameY = 1220;

		if (forwardsPlayer) {
			ctx.textAlign = 'left';
			ctx.font = `70px semiBold`;
			ctx.fillStyle = Colours.WHITE;
			ctx.strokeStyle = Colours.NAVY;
			ctx.lineWidth = 10;
			ctx.strokeText(forwardsPlayer.bio.screen, 60, nameY);
			ctx.fillText(forwardsPlayer.bio.screen, 60, nameY);

			const awardText = 'Forwards MOTM';
			ctx.textAlign = 'left';
			ctx.font = `50px black`;
			ctx.fillStyle = Colours.GOLD;
			ctx.strokeStyle = Colours.NAVY;
			ctx.lineWidth = 8;
			ctx.strokeText(awardText, 60, nameY + 60);
			ctx.fillText(awardText, 60, nameY + 60);
		}

		const backsPlayer = players.find((s) => s.key === backsAwards.playerKey);
		if (backsPlayer) {
			ctx.textAlign = 'right';
			ctx.font = `70px semiBold`;
			ctx.fillStyle = Colours.WHITE;
			ctx.strokeStyle = Colours.NAVY;
			ctx.lineWidth = 10;
			ctx.strokeText(backsPlayer.bio.screen, 1080 - 60, nameY);
			ctx.fillText(backsPlayer.bio.screen, 1080 - 60, nameY);

			const awardText = 'Backs MOTM';
			ctx.textAlign = 'right';
			ctx.font = `50px black`;
			ctx.fillStyle = Colours.GOLD;
			ctx.strokeStyle = Colours.NAVY;
			ctx.lineWidth = 8;
			ctx.strokeText(awardText, 1080 - 60, nameY + 60);
			ctx.fillText(awardText, 1080 - 60, nameY + 60);
		}
	}

	if (motmAwards) {
		const nameY = 1160;
		const player = players.find((s) => s.key === motmAwards.playerKey);

		if (player) {
			ctx.textAlign = 'center';
			ctx.font = `54px black`;
			ctx.fillStyle = Colours.WHITE;
			ctx.strokeStyle = Colours.NAVY;

			ctx.strokeText(player.bio.screen, 540, nameY + 60);
			ctx.fillText(player.bio.screen, 540, nameY + 60);

			const awardText = 'MOTM';
			ctx.textAlign = 'center';
			ctx.font = `48px semiBold`;
			ctx.fillStyle = Colours.GOLD;
			ctx.strokeStyle = Colours.NAVY;
			ctx.lineWidth = 8;
			ctx.strokeText(awardText, 540, nameY + 120);
			ctx.fillText(awardText, 540, nameY + 120);
		}
	}
	await drawSponsorsVertical(ctx, 1080 - 60 - 150, 60, match, images);

	return (await canvasSplitter(canvas as OffscreenCanvas)).map(({ page, base64 }) => ({
		matchId: match.id,
		type: 'RESULT',
		page,
		base64,
		createdAt: new Date().toISOString(),
	}));
}

function getMainImage(image: CanvasImage): unknown {
	return image.uploadType === 'UPLOAD' && image.mediaType === 'MAIN';
}