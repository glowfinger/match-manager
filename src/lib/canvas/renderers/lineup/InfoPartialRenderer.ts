import { Colours } from '$lib/Constants';
import { convertTime, matchDate } from '$lib/helpers/dateTime/ConvertTime';

export default async function InfoPartialRenderer(
	ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
	match: Match,
): Promise<void> {
	let y = 160;

	if (match.team) {
		const title = ['LINEUP'].join(' ').trim();
		const size = 140;
		ctx.font = `${size}px black`;
		ctx.textAlign = 'left';
		ctx.fillStyle = Colours.WHITE;
		ctx.lineWidth = 16;
		ctx.strokeStyle = Colours.NAVY;
		ctx.strokeText(title, 60, y);
		ctx.fillText(title, 60, y);
		y += 20;
	}

	if (match.detail) {
		// Match type
		const size = 60;
		const margin = 20;

		ctx.font = `${size}px black`;
		ctx.textAlign = 'left';
		ctx.lineWidth = 12;
		ctx.fillStyle = Colours.GOLD;
		ctx.strokeStyle = Colours.NAVY;

		const lines = match.detail.type.split('\n');

		lines.forEach((line, index) => {
			ctx.strokeText(line, 60, y + index * size + size);
			ctx.fillText(line, 60, y + index * size + size);
			y += 16;
		});

		y += size + lines.length * size + margin;
	}

	y += 620;
	// Date
	if (match.schedule) {
		const size = 48;
		const margin = 20;
		const date = matchDate(match.schedule?.matchOn ?? '');
		ctx.font = `${size}px black`;
		ctx.textAlign = 'left';
		ctx.lineWidth = 6;
		ctx.fillStyle = Colours.WHITE;
		ctx.strokeStyle = Colours.NAVY;
		ctx.strokeText(date, 60, y);
		ctx.fillText(date, 60, y);
		y += margin;
	}

	// Timings;
	if (match.schedule) {
		const times = `Meet: ${convertTime(match.schedule?.meetAt ?? '')} - KO: ${convertTime(match.schedule?.kickOffAt ?? '')}`;
		const size = 36;
		const margin = 20;
		ctx.font = `${size}px regular`;
		ctx.textAlign = 'left';
		ctx.lineWidth = 6;
		ctx.fillStyle = Colours.WHITE;
		ctx.strokeStyle = Colours.NAVY;
		ctx.strokeText(times, 60, y + size);
		ctx.fillText(times, 60, y + size);
		y += size + margin;
	}

	// Address
	if (match.detail) {
		const size = 36;
		const margin = 20;
		const lines = match.detail.address.split('\n');
		ctx.font = `${size}px regular`;
		ctx.textAlign = 'left';
		ctx.lineWidth = 6;
		ctx.fillStyle = Colours.WHITE;
		ctx.strokeStyle = Colours.NAVY;
		lines.forEach((line, index) => {
			ctx.strokeText(line, 60, y + index * size + size);
			ctx.fillText(line, 60, y + index * size + size);
			y += 16;
		});
		y += size + margin;
	}

	// Footnote
	// ctx.font = `30px regular`;
	// ctx.textAlign = 'left';
	// ctx.lineWidth = 6;
	// ctx.fillStyle = Colours.GOLD;
	// ctx.strokeStyle = Colours.NAVY;
	// ctx.strokeText(footnote, 60, 880);
	// ctx.fillText(footnote, 60, 880);

	// Badges
	// badgeImages.reverse().forEach((img, i) => {
	//   const x = 880 - i * 140;
	//   const y = 60;

	//   ctx.drawImage(img, x, y, 140, 140);
	// });
}
