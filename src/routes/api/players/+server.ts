import { PRIVATE_GOOGLE_API_SHEET_ID } from '$env/static/private';
import credentials from '$lib/server/Credentials';
import { json } from '@sveltejs/kit';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SPREADSHEET_ID = PRIVATE_GOOGLE_API_SHEET_ID;

export async function GET() {
	return json(await load());
}

async function load() {
	const auth = new google.auth.GoogleAuth({ credentials: credentials, scopes: SCOPES });

	const client = await auth.getClient();

	const sheets = google.sheets({ version: 'v4', auth: client as any });

	const [playerResponse, images, tagResponse, unavailableIds, homegrownIds] = await Promise.all([
		sheets.spreadsheets.values
			.get({ spreadsheetId: SPREADSHEET_ID, range: 'Form responses 1' })
			.then(handleResponse),
		sheets.spreadsheets.values
			.get({ spreadsheetId: SPREADSHEET_ID, range: 'images' })
			.then(handleResponse)
			.then((values) => {
				return values.map(imageMapper);
			}),
		sheets.spreadsheets.values
			.get({ spreadsheetId: SPREADSHEET_ID, range: 'tags' })
			.then(handleResponse)
			.then((values) => {
				return values.map(tagMapper);
			}),
		sheets.spreadsheets.values
			.get({ spreadsheetId: SPREADSHEET_ID, range: 'unavailable' })
			.then(handleListResponse),
		sheets.spreadsheets.values
			.get({ spreadsheetId: SPREADSHEET_ID, range: 'homegrown' })
			.then(handleResponse)
			.then(homegrownIdsMapper),
	]);


	const players: any[] = playerResponse
		.map(rowToPlayer)
		.map((player) => {
			return { ...player, unavailable: unavailableIds.includes(player.key) };
		})
		.filter((player) => !unavailableIds.includes(player.key))
		.sort((a, b) => {
			const result = a.bio.first.localeCompare(b.bio.first);
			return result !== 0 ? result : a.bio.last.localeCompare(b.bio.last);
		})
		.map((player) => {
			player.images = images.filter((image) => image.playerKey === player.key);
			return player;
		})

		.map((player) => {
			const playerTags = tagResponse.find((tag) => {
				return tag.playerKey === player.key;
			});

			if (playerTags) {
				player.tags = { homegrown: playerTags.homegrown };
			} else {
				player.tags = { homegrown: false };
			}

			if (homegrownIds.includes(player.key)) {
				player.tags.homegrown = true;
			}

			return player;
		});
	return { players };
}

const CREATED_AT_COLUMN = 0;
const FIRSTNAME_COLUMN = 1;
const LASTNAME_COLUMN = 2;
const DOB_COLUMN = 4;
const OTHER_POSITION_COLUMN = 5;
const MAIN_POSITION_COLUMN = 6;

function rowToPlayer(data: string[]) {
	const row = data.map((d) => d.trim());
	return {
		key: getPlayerKey(row),
		bio: getPlayerBio(row),
		social: { instagram: row[3] },
		positions: getPlayerPosition(row),
	};
}

function getPlayerBio(row: string[]) {
	return {
		first: row[FIRSTNAME_COLUMN],
		last: row[LASTNAME_COLUMN],
		screen: `${row[FIRSTNAME_COLUMN].substring(0, 1)}. ${row[LASTNAME_COLUMN]}`,
		age: getPlayerAge(row),
	};
}

function getPlayerPosition(row: string[]) {
	return {
		main: row[MAIN_POSITION_COLUMN],
		other: row[OTHER_POSITION_COLUMN].split(',').map((p) => p.trim()),
	};
}

function getPlayerKey(row: string[]) {
	const regex = /[^a-zA-Z0-9]/g;

	const values = [row[FIRSTNAME_COLUMN], row[LASTNAME_COLUMN], row[CREATED_AT_COLUMN]].map((s) =>
		s.replace(regex, ''),
	);
	return values.join('-').normalize().toLowerCase();
}

function getPlayerAge(row: string[]) {
	const parts = row[DOB_COLUMN].split('/');

	const dob = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
	const diff = Date.now() - dob.getTime();
	const age = new Date(diff);
	return Math.abs(age.getUTCFullYear() - 1970);
}

function imageMapper(row: string[]) {
	const image = row[3] ? row[3].trim() : '';

	return {
		playerKey: row[0].trim(),
		type: row[1].trim(),
		kit: row[2] ? row[2].trim() : '',
		url: image,
		thumbnail: `https://glowfinger.blob.core.windows.net/match/profile/thumbnails/${image}.png`,
		headshot: `https://glowfinger.blob.core.windows.net/match/profile/headshot/${image}.png`,
		large: `https://glowfinger.blob.core.windows.net/match/profile/large/${image}.png`,
	};
}

function tagMapper(row: string[]) {
	return {
		playerKey: row[0].trim(),
		homegrown: row[1] ? row[1].trim().toUpperCase() === 'Y' : false,
	};
}

function handleResponse(response: any) {
	if (!response.data.values) {
		return [];
	}
	response.data.values.shift();
	return response.data.values;
}

function handleListResponse(response: { data: { values: string[][] } } | any) {
	if (!response.data.values) {
		return [];
	}
	const values = response.data.values;

	return values.map((value: string[]) => value[0].trim());
}

function homegrownIdsMapper(values: string[][]): string[] {
	return values.map((value: string[]) => getPlayerKey(value));
}