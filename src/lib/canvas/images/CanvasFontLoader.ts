import { getFonts } from "$lib/database/FontDBService";

export default async function canvasFontLoader(): Promise<void> {
	const fonts = await getFonts();

	for await (const font of fonts) {
		await new FontFace(font.type, font.blob).load().then(addFont);
	}
}

function addFont(f: FontFace) {
	document.fonts.add(f);
}