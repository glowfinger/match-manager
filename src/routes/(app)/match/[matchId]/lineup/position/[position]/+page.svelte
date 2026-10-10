<script lang="ts">
	import { goto } from '$app/navigation';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import CardList from '$lib/components/CardList.svelte';
	import { isMainPosition, isOtherPosition, SHIRT_NUMBERS } from '$lib/counts/PlayerCounts';
	import { getPlayers } from '$lib/database/PlayerDBService';
	import {
		deleteMatchPlayer,
		deleteMatchPositions,
		getMatchPositions,
		setPosition,
	} from '$lib/database/MatchPositionDBService';
	import { getSelections } from '$lib/database/SelectionDBService';
	import { isAvailable } from '$lib/filters/SelectionFilter';
	import type { MatchPosition, Player, Selection } from '$lib/database/IndexedDB';
	import { onMount } from 'svelte';
	import HeadingLg from '$lib/components/typography/HeadingLg.svelte';
	import HeadingMd from '$lib/components/typography/HeadingMd.svelte';
	import { toast } from 'svelte-sonner';
	import type { LayoutProps } from '../../../$types';
	import PlayerCard from '$lib/components/cards/player/PlayerCard.svelte';
	import PositionActions from '$lib/components/cards/player/PositionActions.svelte';
	import { isPosition } from '$lib/helpers/SelectionPredicate';
	import { error } from '@sveltejs/kit';

	let props: LayoutProps = $props();
	let matchId = props.data.matchId;
	let matchTile = props.data.matchTile;
	let match = props.data.match;

	let position = props.params.position as string;

	if (!position || !isPosition(position)) {
		throw error(404, 'Position not found: ' + position);
	}

	let players: Player[] = $state([]);
	let selections: Selection[] = $state([]);
	let mains: Player[] = $state([]);
	let secondary: Player[] = $state([]);
	let not: Player[] = $state([]);
	let matchPositions: MatchPosition[] = $state([]);

	onMount(async () => {
		const allPlayer = await getPlayers();

		selections = (await getSelections(matchId)).filter(isAvailable);
		players = allPlayer.filter((player) =>
			selections.some((selection) => selection.playerKey === player.key),
		);

		matchPositions = await getMatchPositions(matchId);
		console.log(matchPositions);

		const key = SHIRT_NUMBERS.get(position) as string;
		mains = players.filter((player) => isMainPosition(player, key));
		secondary = players.filter((player) => isOtherPosition(player, key));
		not = players.filter((player) => !isMainPosition(player, key) && !isOtherPosition(player, key));
	});

	const breadcrumbs = [
		{ name: 'Home', href: '/' },
		{ name: matchTile, href: `/match/${matchId}` },
		{ name: 'Manage lineup', href: `/match/${matchId}/lineup` },
		{ name: 'Position', href: `/match/${matchId}/lineup/position` },
	];

	const key = SHIRT_NUMBERS.get(position);

	async function handleStart(playerKey: string) {
		if (hasStart(playerKey)) {
			await deleteMatchPositions(matchId, position, 'start');
			matchPositions = await getMatchPositions(matchId);
		} else {
			await deleteMatchPositions(matchId, position, 'start');
			await deleteMatchPlayer(matchId, playerKey, 'start');
			await setPosition(playerKey, matchId, position, 'start');
			matchPositions = await getMatchPositions(matchId);
		}

		toast.success('Selected');
		goto(`/match/${matchId}/lineup`);
	}

	function hasStart(playerKey: string): boolean {
		return matchPositions.some(
			(matchPosition) =>
				matchPosition.matchId === matchId &&
				matchPosition.playerKey === playerKey &&
				matchPosition.position === position &&
				matchPosition.type === 'start',
		);
	}
</script>

<Breadcrumb {breadcrumbs} />
<HeadingLg>{key}</HeadingLg>

{#if !match}
	<p>Match not found</p>
{:else}
	<HeadingMd>Main</HeadingMd>
	<CardList>
		{#each mains as player}
			<PlayerCard {player}>
				<PositionActions
					{player}
					handleStart={() => handleStart(player.key)}
					{matchPositions}
					{matchId}
					{position}
				/>
			</PlayerCard>
		{/each}
	</CardList>

	<HeadingMd>Secondary</HeadingMd>
	<CardList>
		{#each secondary as player}
			<PlayerCard {player}>
				<PositionActions
					{player}
					handleStart={() => handleStart(player.key)}
					{matchPositions}
					{matchId}
					{position}
				/>
			</PlayerCard>
		{/each}
	</CardList>
	<HeadingMd>Unfavoured</HeadingMd>
	<CardList>
		{#each not as player}
			<PlayerCard {player}>
				<PositionActions
					{player}
					handleStart={() => handleStart(player.key)}
					{matchPositions}
					{matchId}
					{position}
				/>
			</PlayerCard>
		{/each}
	</CardList>
	<HeadingMd>Selected</HeadingMd>
	<CardList>
		{#each not as player}
			<PlayerCard {player}>
				<PositionActions
					{player}
					handleStart={() => handleStart(player.key)}
					{matchPositions}
					{matchId}
					{position}
				/>
			</PlayerCard>
		{/each}
	</CardList>
{/if}
