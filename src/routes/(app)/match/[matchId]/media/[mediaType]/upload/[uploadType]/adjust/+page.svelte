<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import canvasImageLoader from '$lib/canvas/images/CanvasImageLoader';
	import { blobToData } from '$lib/canvas/renderers/CanvasSplitter';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import CancelLink from '$lib/components/forms/CancelLink.svelte';
	import SubmitButton from '$lib/components/forms/SubmitButton.svelte';
	import HeadingMd from '$lib/components/typography/HeadingMd.svelte';
	import { Button } from '$lib/components/ui/button';
	import { MediaImageTypes, UPLOAD_TYPES } from '$lib/Constants';
	import {
		getUploadByMatchAndTypes,
		updateUploadSettingsById,
	} from '$lib/database/match/ImageUploadDBService';
	import { setMatchImage } from '$lib/database/match/MatchImageDBService';
	import type { CanvasImage } from '$lib/types/Images';

	import { toast } from 'svelte-sonner';
	import type { LayoutProps } from '../../../../../$types';
	import matchCanvasRenderer from '$lib/canvas/renderers/MatchCanvasRenderer';
	import canvasFontLoader from '$lib/canvas/images/CanvasFontLoader';

	let canvas: HTMLCanvasElement | undefined = $state();
	let canvasImages: CanvasImage[] = $state([]);
	let adjustIndex: number | undefined = $state();

	let props: LayoutProps = $props();
	let matchId = props.data.matchId;
	let matchTile = props.data.matchTile;
	let match = props.data.match;

	const mediaType = props.params.mediaType as string;
	const mediaLabel = MediaImageTypes.find(({ type }) => type === mediaType)?.label;
	if (!mediaLabel) {
		throw new Error('Media type is required');
	}
	const uploadType = props.params.uploadType as string;
	const uploadLabel = UPLOAD_TYPES.find(({ type }) => type === uploadType)?.label;
	if (!uploadLabel) {
		throw new Error('Upload type is required');
	}

	const breadcrumbs = [
		{ name: 'Home', href: '/' },
		{ name: matchTile, href: `/match/${matchId}` },
		{ name: 'Media', href: `/match/${matchId}/media` },
		{ name: mediaLabel, href: `/match/${matchId}/media/${mediaType}` },
		{ name: 'Adjust', href: `/match/${matchId}/media/${mediaType}/upload/${uploadType}/adjust` },
	];

	let settings = $state({
		zoom: 1,
		x: 0,
		y: 0,
	});

	// Touch/mouse gesture state
	let touchState = $state<{
		touches: Touch[] | null;
		initialZoom: number;
		initialX: number;
		initialY: number;
		initialDistance: number;
		initialCenter: { x: number; y: number } | null;
		isMouseDown: boolean;
		mouseStart: { x: number; y: number } | null;
	}>({
		touches: null,
		initialZoom: 1,
		initialX: 0,
		initialY: 0,
		initialDistance: 0,
		initialCenter: null,
		isMouseDown: false,
		mouseStart: null,
	});

	function getDistance(touch1: Touch, touch2: Touch): number {
		const dx = touch2.clientX - touch1.clientX;
		const dy = touch2.clientY - touch1.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function getCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
		return {
			x: (touch1.clientX + touch2.clientX) / 2,
			y: (touch1.clientY + touch2.clientY) / 2,
		};
	}

	function getCanvasPoint(clientX: number, clientY: number): { x: number; y: number } | null {
		if (!canvas) return null;
		const rect = canvas.getBoundingClientRect();
		return {
			x: clientX - rect.left,
			y: clientY - rect.top,
		};
	}

	function normalizeX(x: number): number {
		if (!canvas) return 0;
		const rect = canvas.getBoundingClientRect();
		// Normalize to -1 to 1 range based on canvas width
		const normalized = (x / rect.width) * 2 - 1;
		return Math.max(-1, Math.min(1, normalized));
	}

	function normalizeY(y: number): number {
		if (!canvas) return 0;
		const rect = canvas.getBoundingClientRect();
		// Normalize to -1 to 1 range based on canvas height
		const normalized = (y / rect.height) * 2 - 1;
		return Math.max(-1, Math.min(1, normalized));
	}

	function handleTouchStart(e: TouchEvent) {
		e.preventDefault();
		if (!canvas) return;

		const touches = Array.from(e.touches);
		touchState.touches = touches;

		if (touches.length === 1) {
			// Single touch - pan
			const point = getCanvasPoint(touches[0].clientX, touches[0].clientY);
			if (point) {
				touchState.initialX = settings.x;
				touchState.initialY = settings.y;
				touchState.initialCenter = point;
			}
		} else if (touches.length === 2) {
			// Two touches - pinch zoom
			const distance = getDistance(touches[0], touches[1]);
			touchState.initialZoom = settings.zoom;
			touchState.initialDistance = distance;
			touchState.initialX = settings.x;
			touchState.initialY = settings.y;
			touchState.initialCenter = getCenter(touches[0], touches[1]);
		}
	}

	function handleTouchMove(e: TouchEvent) {
		e.preventDefault();
		if (!canvas || !touchState.touches) return;

		const touches = Array.from(e.touches);
		touchState.touches = touches;

		if (touches.length === 1 && touchState.initialCenter) {
			// Single touch pan
			const currentPoint = getCanvasPoint(touches[0].clientX, touches[0].clientY);
			if (currentPoint) {
				const deltaX = normalizeX(currentPoint.x - touchState.initialCenter.x);
				const deltaY = normalizeY(currentPoint.y - touchState.initialCenter.y);
				settings.x = Math.max(-1, Math.min(1, touchState.initialX + deltaX));
				settings.y = Math.max(-1, Math.min(1, touchState.initialY + deltaY));
			}
		} else if (touches.length === 2 && touchState.initialDistance > 0) {
			// Pinch zoom
			const distance = getDistance(touches[0], touches[1]);
			const scale = distance / touchState.initialDistance;
			const newZoom = touchState.initialZoom * scale;
			settings.zoom = Math.max(1, Math.min(20, newZoom));

			// Also allow panning with two fingers
			const center = getCenter(touches[0], touches[1]);
			if (touchState.initialCenter) {
				const centerPoint = getCanvasPoint(center.x, center.y);
				if (centerPoint) {
					const deltaX = normalizeX(centerPoint.x - touchState.initialCenter.x);
					const deltaY = normalizeY(centerPoint.y - touchState.initialCenter.y);
					settings.x = Math.max(-1, Math.min(1, touchState.initialX + deltaX));
					settings.y = Math.max(-1, Math.min(1, touchState.initialY + deltaY));
				}
			}
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		e.preventDefault();
		const touches = Array.from(e.touches);
		if (touches.length === 0) {
			touchState.touches = null;
			touchState.initialCenter = null;
			touchState.initialDistance = 0;
		} else {
			touchState.touches = touches;
			// Reinitialize for remaining touches
			if (touches.length === 1) {
				const point = getCanvasPoint(touches[0].clientX, touches[0].clientY);
				if (point) {
					touchState.initialX = settings.x;
					touchState.initialY = settings.y;
					touchState.initialCenter = point;
					touchState.initialDistance = 0;
				}
			}
		}
	}

	function handleMouseDown(e: MouseEvent) {
		if (!canvas) return;
		e.preventDefault();
		const point = getCanvasPoint(e.clientX, e.clientY);
		if (point) {
			touchState.isMouseDown = true;
			touchState.mouseStart = point;
			touchState.initialX = settings.x;
			touchState.initialY = settings.y;
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (!canvas || !touchState.isMouseDown || !touchState.mouseStart) return;
		e.preventDefault();
		const currentPoint = getCanvasPoint(e.clientX, e.clientY);
		if (currentPoint) {
			const deltaX = normalizeX(currentPoint.x - touchState.mouseStart.x);
			const deltaY = normalizeY(currentPoint.y - touchState.mouseStart.y);
			settings.x = Math.max(-1, Math.min(1, touchState.initialX + deltaX));
			settings.y = Math.max(-1, Math.min(1, touchState.initialY + deltaY));
		}
	}

	function handleMouseUp() {
		touchState.isMouseDown = false;
		touchState.mouseStart = null;
	}

	onMount(async () => {
		if (!canvas) {
			return;
		}

		const upload = await getUploadByMatchAndTypes(matchId, mediaType, uploadType);
		if (!upload) {
			goto(`/match/${matchId}/media/${mediaType}/upload/${uploadType}`);
			throw new Error('Upload not found');
		}

		// Initialize settings from upload if available
		if (upload.settings) {
			settings = {
				zoom: upload.settings.zoom ?? 1,
				x: upload.settings.x ?? 0,
				y: upload.settings.y ?? 0,
			};
		}

		await canvasFontLoader();
		canvasImages = await canvasImageLoader(match, mediaType);
		adjustIndex = canvasImages.findIndex(
			(image: CanvasImage) =>
				image.uploadType.toUpperCase() === 'UPLOAD'.toUpperCase() &&
				image.mediaType.toUpperCase() === 'MAIN'.toUpperCase(),
		);

		matchCanvasRenderer(canvas as HTMLCanvasElement, match, mediaType, canvasImages);

		// Add touch and mouse event listeners
		canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
		canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
		canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
		canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
		canvas.addEventListener('mousedown', handleMouseDown);
		canvas.addEventListener('mousemove', handleMouseMove);
		canvas.addEventListener('mouseup', handleMouseUp);
		canvas.addEventListener('mouseleave', handleMouseUp);
	});

	onDestroy(() => {
		if (canvas) {
			canvas.removeEventListener('touchstart', handleTouchStart);
			canvas.removeEventListener('touchmove', handleTouchMove);
			canvas.removeEventListener('touchend', handleTouchEnd);
			canvas.removeEventListener('touchcancel', handleTouchEnd);
			canvas.removeEventListener('mousedown', handleMouseDown);
			canvas.removeEventListener('mousemove', handleMouseMove);
			canvas.removeEventListener('mouseup', handleMouseUp);
			canvas.removeEventListener('mouseleave', handleMouseUp);
		}
		canvas = undefined;
	});

	$effect(() => {
		if (!canvas || !match || !canvasImages  || !settings) {
			return;
		}


		if (adjustIndex === undefined || adjustIndex === -1 ) {
			return;
		}

		if (
			canvasImages[adjustIndex].settings.zoom !== settings.zoom ||
			canvasImages[adjustIndex].settings.x !== settings.x ||
			canvasImages[adjustIndex].settings.y !== settings.y
		) {
			canvasImages[adjustIndex].settings = { ...settings };

			matchCanvasRenderer(canvas as HTMLCanvasElement, match, mediaType, canvasImages);
		}

	});

	async function updateUploadSettings(e: SubmitEvent) {
		e.preventDefault();

		const upload = await getUploadByMatchAndTypes(matchId, mediaType, uploadType);
		if (!upload) {
			throw new Error('Upload not found');
		}

		await updateUploadSettingsById(upload.id, settings);

		if (!canvas) {
			return;
		}

		canvas.toBlob(async (blob) => {
			if (!blob) {
				return;
			}
			const base64 = await blobToData(blob);
			await setMatchImage({
				matchId,
				type: mediaType,
				page: 1,
				base64: base64 as string,
				createdAt: new Date().toISOString(),
			});

			toast.success('Settings updated');
			goto(`/match/${matchId}/media/${mediaType}`);
		});
	}

	function resetSettings() {
		settings = {
			zoom: 1,
			x: 0,
			y: 0,
		};
	}
</script>

<Breadcrumb {breadcrumbs} />
<HeadingMd>Adjust image</HeadingMd>

<canvas
	bind:this={canvas}
	width={1080}
	height={1350}
	class="w-full border border-slate-900 touch-pan-x touch-pan-y cursor-move"
	style="touch-action: none;"
></canvas>

<form onsubmit={updateUploadSettings} novalidate>
	<div class="mt-6">
		<label for="zoom" class="text-sm text-gray-500">Zoom</label>
		<input
			id="zoom"
			type="range"
			bind:value={settings.zoom}
			step=".1"
			min="1"
			max="20"
			class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
		/>
	</div>

	<div class="mt-6">
		<label for="horizontal" class="text-sm text-gray-500">Horizontal</label>
		<input
			id="horizontal"
			type="range"
			bind:value={settings.x}
			step="0.01"
			min="-1"
			max="1"
			class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
		/>
	</div>

	<div class="mt-6">
		<label for="vertical" class="text-sm text-gray-500">Vertical</label>
		<input
			id="vertical"
			type="range"
			bind:value={settings.y}
			step="0.01"
			min="-1"
			max="1"
			class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
		/>
	</div>
	<div class="mt-4 grid grid-cols-1 gap-2">
		<Button type="button" onclick={resetSettings}>Reset photo</Button>
		<SubmitButton>Save photo</SubmitButton>
		<CancelLink href={`/match/${matchId}/media/${mediaType}`}
			>Back to {mediaLabel.toLowerCase()} image</CancelLink
		>
	</div>
</form>
