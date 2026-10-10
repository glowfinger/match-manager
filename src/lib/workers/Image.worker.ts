// import LineupAlternative from '$lib/constants/lineup/LineupAlternative';
import { getFonts } from '$lib/database/FontDBService';
import type { MatchImage } from '$lib/database/IndexedDB';
import { deleteMatchImagesByType, setMatchImage } from '$lib/database/match/MatchImageDBService';
import { getMatch } from '$lib/database/MatchService';
import {
	hasAndFetchAndCacheImageFile,
	hasImageFile,
} from '$lib/database/services/ImageFileDbService';

onmessage = async ({ data }: MessageEvent) => {
	console.time('ImageWorker');
	console.timeLog('ImageWorker');

	await preloadFonts();

	console.timeLog('ImageWorker');
	postMessage({ task: 'FONTS_LOADED', type: data.type });

	await deleteMatchImagesByType(data.matchId, data.type);
	console.timeLog('ImageWorker');
	// let images: Omit<MatchImage, 'id'>[] = [];
	// if (data.type === 'MATCH') {
	// 	// const cachedImages = await preloadMatchImages(data.matchId);
	// 	// console.log(cachedImages);
	// 	// images = await matchRenderer(new OffscreenCanvas(1080, 1350), data.matchId, data.type);
	// 	console.timeLog('ImageWorker');
	// }
	// if (data.type === 'CANCELLED') {
	// 	images = await cancelledRender(data.matchId, data.type);
	// }
	// if (data.type === 'RESULT') {
	// 	// images = await resultRender(data.matchId, data.type);
	// }
	// if (data.type === 'LINEUP') {
	// 	// await preloadImages(LineupAlternative);
	// 	images = await LineupRederer(data.matchId, data.type);
	// 	postMessage({ task: 'IMAGES_GENERATED', type: data.type });
	// }
	// if (data.type === 'LINEUP_LIST') {
	// 	images = await LineupListRenderer(data.matchId, data.type);
	// 	postMessage({ task: 'IMAGES_GENERATED', type: data.type });
	// }
	// if (data.type === 'highlight') {
	// 	images = await HighlightRenderer(data.matchId, data.type);
	// }
	// if (!images.length) {
	// 	postMessage({ task: 'NO_IMAGES_GENERATED', type: data.type });
	// 	return;
	// }
	console.timeLog('ImageWorker');
	await saveImages(images);
	console.timeLog('ImageWorker');
	postMessage({ task: 'IMAGES_GENERATED', type: data.type });
	console.timeLog('ImageWorker');
	console.timeEnd('ImageWorker');
};

async function saveImages(images: Omit<MatchImage, 'id'>[]) {
	for await (const image of images) {
		await setMatchImage(image);
	}
}

function addFont(f: FontFace) {
	// @ts-expect-error: Property 'fonts' does not exist on type 'Global'.
	self.fonts.add(f);
}

async function preloadFonts() {
	const fonts = await getFonts();

	for await (const font of fonts) {
		await new FontFace(font.type, font.blob).load().then(addFont);
	}
}

async function preloadMatchImages(matchId: number) {
	const image = [];

	const match = await getMatch(matchId);

	if (match.team?.badge) {
		image.push(match.team.badge);
	}

	if (match.opponent?.badge) {
		image.push(match.opponent.badge);
	}

	// check if the image is already in the database
	// if not, fetch it and add it to the database
	// return data how many images are not in the database
	// how many images are failed to fetch

	const cachedImages = await Promise.all(
		image.map(async (image) => {
			return {
				url: image,
				cached: await hasImageFile(image),
				success: await hasAndFetchAndCacheImageFile(image),
			};
		}),
	);

	return cachedImages;
}
