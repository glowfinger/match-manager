<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { setMatchImage } from '$lib/database/match/MatchImageDBService';
	import canvasImageLoader from '$lib/canvas/images/CanvasImageLoader';
	import type { CanvasImage } from '$lib/types/Images';
	import type { LayoutProps } from '../../../$types';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import HeadingLg from '$lib/components/typography/HeadingLg.svelte';
	import HeadingMd from '$lib/components/typography/HeadingMd.svelte';
	import DrawIcon from '$lib/components/icons/DrawIcon.svelte';
	import LinkCard from '$lib/components/cards/LinkCard.svelte';
	import matchCanvasRenderer from '$lib/canvas/renderers/MatchCanvasRenderer';
	import { goto } from '$app/navigation';
	import { MediaImageTypes } from '$lib/Constants';
	import { page } from '$app/state';
	import type { MatchImage } from '$lib/database/IndexedDB';
	import { getFonts } from '$lib/database/FontDBService';
	import canvasFontLoader from '$lib/canvas/images/CanvasFontLoader';

	let canvas: HTMLCanvasElement | undefined = $state();
	let canvasImages: CanvasImage[] = $state([]);

	let props: LayoutProps = $props();
	let matchId = props.data.matchId;
	let matchTile = props.data.matchTile;
	let match = props.data.match;
	let mediaType = props.params.mediaType as string;
	let pageNo = $derived(parseInt(page.url.searchParams.get('page') ?? '1'));
	let WIDTH = $state(1080);
	let HEIGHT = $state(1350);
	let image: Omit<MatchImage, 'id'> | undefined = $state();

	const mediaLabel = MediaImageTypes.find((m) => m.type === mediaType)?.label;
	if (!mediaLabel) {
		throw new Error('Media type is required');
	}

	const breadcrumbs = [
		{ name: 'Home', href: '/' },
		{ name: matchTile, href: `/match/${matchId}` },
		{ name: 'Media', href: `/match/${matchId}/media` },
		{ name: mediaLabel, href: `/match/${matchId}/media/${mediaType}` },
		{ name: 'Render', href: `/match/${matchId}/media/${mediaType}/render` },
	];

	onMount(async () => {
		if (!match) {
			return;
		}

		if (!canvas) {
			return;
		}

		await canvasFontLoader();
		canvasImages = await canvasImageLoader(match, mediaType);
		const images = await matchCanvasRenderer(canvas, match, mediaType, canvasImages);
		await Promise.all(images.map(async (image) => await setMatchImage(image)));

		if (pageNo) {
			image = images[pageNo - 1];
		}

		// goto(`/match/${matchId}/media/${mediaType}`);
	});

	onDestroy(() => {
		canvas = undefined;
	});

	const LINKS = [
		{ label: 'Upload', href: `/match/${matchId}/media/${mediaType}/upload/main`, icon: DrawIcon },
		{
			label: 'Adjust',
			href: `/match/${matchId}/media/${mediaType}/upload/main/adjust`,
			icon: DrawIcon,
		},
		{ label: 'Render', href: `/match/${matchId}/media/${mediaType}/render`, icon: DrawIcon },
		{ label: 'Caption', href: `/match/${matchId}/media/${mediaType}/caption`, icon: DrawIcon },
	];
</script>

<Breadcrumb {breadcrumbs} />
<HeadingLg>Render</HeadingLg>

{#if pageNo}
	<HeadingMd>Page {pageNo}</HeadingMd>
{/if}

<div class=" overflow-x-scroll">
	<canvas bind:this={canvas} width={WIDTH} height={HEIGHT} class="w-full border border-slate-900"
	></canvas>
</div>

{#if image}
	<img
		src={image.base64}
		alt={image.type}
		class="transform transition-transform duration-300 hover:scale-105 hover:opacity-75"
	/>
{/if}
