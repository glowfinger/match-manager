import type { Match, MatchImage } from '$lib/database/IndexedDB';
import type { CanvasImage } from '$lib/types/Images';
import canvasSplitter from './CanvasSplitter';
import highlightRenderer from './HighlightRenderer';
import LineupListRenderer from './LineupListRenderer';
import LineupRenderer from './LineupRenderer';
import matchRenderer from './MatchRenderer';
import resultRender from './ResultRenderer';

export default async function matchCanvasRenderer(
	canvas: OffscreenCanvas | HTMLCanvasElement,
	match: Match,
	mediaType: string,
	canvasImages: CanvasImage[] = [],
): Promise<Omit<MatchImage, 'id'>[]> {
	if (!canvas) {
		return [];
	}

	const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
	if (!ctx) {
		return [];
	}

	if (mediaType === 'MATCH') {
		canvas.width = 1080;
		canvas.height = 1350;
		await matchRenderer(canvas, match, canvasImages);
	}

	if (mediaType === 'LINEUP') {
		canvas.width = 1080 * 4;
		canvas.height = 1350;
		await LineupRenderer(canvas, match, canvasImages);
	}

	if (mediaType === 'LINEUP_LIST') {
		canvas.width = 1080;
		canvas.height = 1350;
		await LineupListRenderer(canvas, match, canvasImages);
	}

	if (mediaType === 'RESULT') {
		canvas.width = 1080;
		canvas.height = 1350;
		await resultRender(canvas, match, canvasImages);
	}

	if (mediaType === 'HIGHLIGHT') {
		canvas.width = 1080;
		canvas.height = 1350;
		await highlightRenderer(canvas, match, canvasImages);
	}
	return (await canvasSplitter(canvas as OffscreenCanvas)).map(({ page, base64 }) => ({
		matchId: match.id,
		type: mediaType,
		page,
		base64,
		createdAt: new Date().toISOString(),
	}));
}
