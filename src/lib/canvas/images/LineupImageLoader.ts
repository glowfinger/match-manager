import type { Match } from '$lib/database/IndexedDB';
import { getUploadsByMatchIdAndMediaType } from '$lib/database/match/ImageUploadDBService';
import type { CanvasImage } from '$lib/types/Images';
import { KIT_VALUES } from '../constants/Colours';
import { getImageBitmap } from '../ImageCache';
import { playerHeadshotLoader, sponsorImageLoader, teamBadgeLoader } from './ImageLoaderUtils';

const KIT_BACKGROUND_IMAGE = {
	[KIT_VALUES.MAIN]: '/img/backgrounds/seniors/senior-gold-4-panel-basic.png',
	[KIT_VALUES.SECONDARY]: '/img/backgrounds/seniors/senior-pink-4-panel-basic.png',
};

const KIT_BACKGROUND_IMAGE_CUTOUT = {
	[KIT_VALUES.MAIN]: '/img/backgrounds/seniors/senior-gold-4-panel-cutout.png',
	[KIT_VALUES.SECONDARY]: '/img/backgrounds/seniors/senior-pink-4-panel-cutout.png',
};

export default async function lineupImageLoader(match: Match): Promise<CanvasImage[]> {
	const images: CanvasImage[] = [];

	const uploads = await getUploadsByMatchIdAndMediaType(match.id, 'LINEUP');

	const mainUpload = uploads.find((upload) => upload.uploadType === 'main');
	if (mainUpload) {
		images.push({
			photo: await createImageBitmap(mainUpload.blob),
			uploadType: 'UPLOAD',
			mediaType: 'MAIN',
			settings: mainUpload.settings,
		});
	}

	if (match.detail) {
		const promises = [
			getImageBitmap(KIT_BACKGROUND_IMAGE[match.detail.kit]),
			getImageBitmap(KIT_BACKGROUND_IMAGE_CUTOUT[match.detail.kit]),
		];

		const [backgroundImage, backgroundCutoutImage] = await Promise.all(promises);

		const settings = {
			x: 0,
			y: 0,
			zoom: 1,
		};
		images.push({
			photo: backgroundImage,
			uploadType: 'BACKGROUND',
			mediaType: 'LINEUP',
			settings,
		});

		images.push({
			photo: backgroundCutoutImage,
			uploadType: 'BACKGROUND_CUTOUT',
			mediaType: 'LINEUP',
			settings,
		});
	}

	images.push(...(await teamBadgeLoader(match)));
	images.push(...(await playerHeadshotLoader(match)));
	images.push(...(await sponsorImageLoader(match)));
	return images;
}
