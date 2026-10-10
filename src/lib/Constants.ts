import { KIT_VALUES } from './canvas/constants/Colours';

export const Colours = {
	NAVY: '#111C4E',
	GOLD: '#fcb437',
	PINK: '#f0c8d9',
	WHITE: '#ffffff',
	BLACK: '#0a0a0a',
};

export const UploadImageTypes = {
	MAIN: 'main',
};

export type MediaImageType = {
	type: string;
	label: string;
};

export const MediaImageTypes: MediaImageType[] = [
	{
		type: 'MATCH',
		label: 'Match',
	},
	{
		type: 'CANCELLED',
		label: 'Cancelled',
	},
	{
		type: 'RESCHEDULED',
		label: 'Rescheduled',
	},
	{
		type: 'RESULT',
		label: 'Result',
	},
	{
		type: 'TEAM',
		label: 'Team',
	},
	{
		type: 'LINEUP',
		label: 'Lineup',
	},
	{
		type: 'LINEUP_LIST',
		label: 'Lineup List',
	},
	{
		type: 'HIGHLIGHT',
		label: 'Highlight',
	},
];

export type Sponsor = {
	key: string;
	name: string;
	logo: string;
	handle: string;
	sections: string[];
	level: string;
};

export const SPONSORS: Sponsor[] = [
	{
		key: 'furniture-village',
		name: 'Furniture Village',
		logo: 'https://glowfinger.blob.core.windows.net/smg/sponsors/furniture-village.png',
		handle: '@furniturevillage',
		sections: ['1XV', '2XV'],
		level: '1',
	},
	{
		key: 'formation-lighting',
		name: 'Formation Lighting',
		logo: 'https://glowfinger.blob.core.windows.net/smg/sponsors/formation-lighting.png',
		handle: ' @formation_lighting',
		sections: ['1XV', '2XV'],
		level: '2',
	},
];

export type UploadType = {
	type: string;
	label: string;
};

export const UPLOAD_TYPES: UploadType[] = [
	{
		type: 'main',
		label: 'Main',
	},
];

export const SOCIAL_TAGS = ['#UTC'];

// TODO can this can from a database table or alternive data source?
export const MEDIA_IMAGES = [
	{
		mediaTypes: ['MATCH'],
		imageType: 'background',
		url: '/img/backgrounds/seniors/match-navy.png',
		version: 'full',
		kit: KIT_VALUES.MAIN,
	},
	{
		mediaTypes: ['MATCH'],
		imageType: 'background',
		url: '/img/backgrounds/seniors/match-navy-cutout.png',
		version: 'cutout',
		kit: KIT_VALUES.MAIN,
	},
	{
		mediaTypes: ['MATCH'],
		imageType: 'background',
		url: '/img/backgrounds/seniors/match-pink.png',
		version: 'full',
		kit: KIT_VALUES.SECONDARY,
	},
	{
		mediaTypes: ['MATCH'],
		imageType: 'background',
		url: '/img/backgrounds/seniors/match-pink-cutout.png',
		version: 'cutout',
		kit: KIT_VALUES.SECONDARY,
	},
];
