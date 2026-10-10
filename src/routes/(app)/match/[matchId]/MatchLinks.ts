import ArticleIcon from '$lib/components/icons/ArticleIcon.svelte';
import ArticlePersonIcon from '$lib/components/icons/ArticlePersonIcon.svelte';
import AwardStarIcon from '$lib/components/icons/AwardStarIcon.svelte';
import CalendarIcon from '$lib/components/icons/CalendarIcon.svelte';
import DeleteIcon from '$lib/components/icons/DeleteIcon.svelte';
import FortIcon from '$lib/components/icons/FortIcon.svelte';
import PhotoAlbumIcon from '$lib/components/icons/PhotoAlbumIcon.svelte';
import SettingsIcon from '$lib/components/icons/SettingsIcon.svelte';
import SocialLeaderboardIcon from '$lib/components/icons/SocialLeaderboardIcon.svelte';
import SportsScoreIcon from '$lib/components/icons/SportsScoreIcon.svelte';
import StadiumIcon from '$lib/components/icons/StadiumIcon.svelte';
import StarShineIcon from '$lib/components/icons/StarShineIcon.svelte';
import SwordIcon from '$lib/components/icons/SwordIcon.svelte';
import type { Component } from 'svelte';

type LinkList = {
	label: string;
	href: string;
	icon: Component;
};

export type MediaImageLink = LinkList & {
	type: string;
};

const INFO_LINKS: LinkList[] = [
	{ label: 'Team', href: `/match/[matchId]/team`, icon: FortIcon },
	{ label: 'Opposition', href: `/match/[matchId]/opposition`, icon: SwordIcon },
	{ label: 'Details', href: `/match/[matchId]/details`, icon: StadiumIcon },
	{ label: 'Schedule', href: `/match/[matchId]/schedule`, icon: CalendarIcon },
];

const MANAGE_LINKS: LinkList[] = [
	{ label: 'Squad', href: `/match/[matchId]/squad`, icon: ArticlePersonIcon },
	{ label: 'Lineup', href: `/match/[matchId]/lineup`, icon: ArticleIcon },
	{ label: 'Leadership', href: `/match/[matchId]/roles/leadership`, icon: SocialLeaderboardIcon },
	{ label: 'Debuts', href: `/match/[matchId]/debuts`, icon: StarShineIcon },
	{ label: 'Result', href: `/match/[matchId]/result`, icon: SportsScoreIcon },
	{ label: 'Awards', href: `/match/[matchId]/roles/awards`, icon: AwardStarIcon },
	{ label: 'Media', href: `/match/[matchId]/media`, icon: PhotoAlbumIcon },
	{ label: 'Admin', href: `/match/[matchId]/admin`, icon: SettingsIcon },
];

export const DATABASE_LINKS: LinkList[] = [
	{ label: 'Players', href: `/players`, icon: ArticlePersonIcon },
	{ label: 'Clubs', href: `/clubs`, icon: FortIcon },
	{ label: 'Admin', href: `/admin`, icon: SettingsIcon },
];

export const MATCH_MEDIA_IMAGE_LINKS: MediaImageLink[] = [
	{
		type: 'MATCH',
		label: 'Match',
		href: `/match/[matchId]/media/MATCH`,
		icon: PhotoAlbumIcon,
	},
	{ type: 'LINEUP', label: 'Lineup', href: `/match/[matchId]/media/LINEUP`, icon: ArticleIcon },
	{
		type: 'LINEUP_LIST',
		label: 'Lineup list',
		href: `/match/[matchId]/media/LINEUP_LIST`,
		icon: ArticleIcon,
	},
	{ type: 'RESULT', label: 'Result', href: `/match/[matchId]/media/RESULT`, icon: SportsScoreIcon },
	{
		type: 'HIGHLIGHT',
		label: 'Highlight',
		href: `/match/[matchId]/media/HIGHLIGHT`,
		icon: StarShineIcon,
	},
];

export const ADMIN_LINKS: LinkList[] = [
	{ label: 'Remove', href: `/match/[matchId]/admin/remove`, icon: DeleteIcon },
];

export function matchIdMapper(
	matchId: number,
	link: LinkList | MediaImageLink,
): LinkList | MediaImageLink {
	return {
		...link,
		href: link.href.replace('[matchId]', matchId.toString()),
	};
}

export { INFO_LINKS, MANAGE_LINKS };
