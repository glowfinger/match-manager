import type { Match } from '$lib/database/IndexedDB';
import { getUploadsByMatchIdAndMediaType } from '$lib/database/match/ImageUploadDBService';
import type { CanvasImage } from '$lib/types/Images';
import { KIT_VALUES } from '../constants/Colours';
import { getImageBitmap } from '../ImageCache';
import { sponsorImageLoader, teamImageLoader } from './ImageLoaderUtils';

const RESULT_BACKGROUND_IMAGE = {
	[KIT_VALUES.MAIN]: '/img/backgrounds/seniors/optist-ngw.png',
	[KIT_VALUES.SECONDARY]: '/img/backgrounds/seniors/optist-png.png',
};

export default async function resultImageLoader(match: Match) {
	const images: CanvasImage[] = [];

	const homeTeam = match.detail?.venue === 'HOME' ? match.team : match.opponent;
	const awayTeam = match.detail?.venue === 'HOME' ? match.opponent : match.team;

	if (homeTeam) {
		images.push(await teamImageLoader(homeTeam, 'HOME'));
	}

	if (awayTeam) {
		images.push(await teamImageLoader(awayTeam, 'AWAY'));
	}

	const uploads = await getUploadsByMatchIdAndMediaType(match.id, 'RESULT');

	const mainUpload = uploads.find((upload) => upload.uploadType === 'main');

	if (mainUpload) {
		images.push({
			photo: await createImageBitmap(mainUpload.blob),
			uploadType: 'UPLOAD',
			mediaType: 'MAIN',
			settings: mainUpload.settings,
		});
	}

	const backgroundImage = await getImageBitmap(
		RESULT_BACKGROUND_IMAGE[match.detail?.kit ?? KIT_VALUES.MAIN],
	);
	images.push({
		photo: backgroundImage,
		uploadType: 'BACKGROUND',
		mediaType: 'RESULT',
		settings: {
			x: 0,
			y: 0,
			zoom: 1,
		},
	});
	images.push(...(await sponsorImageLoader(match)));
	return images;
}
