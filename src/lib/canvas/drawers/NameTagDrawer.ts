import { Colours } from '$lib/Constants';

const BOX_WIDTH = 280;

export default function nameTagDrawer(
	ctx: CanvasRenderingContext2D,
	name: string,
	x: number,
	y: number,
): void {
	ctx.fillStyle = 'white';
	ctx.fillRect(x, y, BOX_WIDTH, 40);
	ctx.strokeStyle = Colours.NAVY;
	ctx.lineWidth = 3;
	ctx.strokeRect(x, y, BOX_WIDTH, 40);
	ctx.font = `24px semiBold`;
	ctx.textAlign = 'center';
	ctx.fillStyle = 'black';
	ctx.fillText(name, x + BOX_WIDTH / 2, y + 30);
}
