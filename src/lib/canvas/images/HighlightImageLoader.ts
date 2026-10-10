import type { Match } from '$lib/database/IndexedDB';
import type { CanvasImage } from '$lib/types/Images';
import { sponsorImageLoader, teamBadgeLoader } from './ImageLoaderUtils';

export default async function highlightImageLoader(match: Match): Promise<CanvasImage[]> {
    const images: CanvasImage[] = [];

    images.push(...(await teamBadgeLoader(match)));
    images.push(...(await sponsorImageLoader(match)));
    return images;
}