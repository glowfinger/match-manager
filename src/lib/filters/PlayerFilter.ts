import type { Player } from '$lib/database/IndexedDB';
import Fuse from 'fuse.js';

const SEARCH_KEYS = ['key', 'bio.first', 'bio.last', 'bio.screen', 'positions.main'];
const SEARCH_THRESHOLD = 0.2;

export default function filterPlayers(players: Player[], search: string): Player[] {
	if (search.length === 0) {
		return players;
	}

	const fuse = new Fuse(players, {
		useExtendedSearch: true,
		keys: SEARCH_KEYS,
		threshold: SEARCH_THRESHOLD,
		location: 0,
		distance: 100,
		includeMatches: true,
		includeScore: true,
		ignoreDiacritics: true,
	});

	const results = fuse.search(search);
	return results.map((result) => result.item);
}
