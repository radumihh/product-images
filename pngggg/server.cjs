const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs').promises;
const path = require('path');
const Jimp = require('jimp');

async function removeImageBackground(imgSource) {
    try {
        const blob = await removeBackground(imgSource);
        const buffer = Buffer.from(await blob.arrayBuffer());
        return buffer;
    } catch (error) {
        throw new Error('Error removing background: ' + error);
    }
}

async function main() {
    try {
        const imgSource = './input/5.jpg';
        const transparentBuffer = await removeImageBackground(imgSource);

        const tempPath = './temp/transparent.png';
        await fs.mkdir(path.dirname(tempPath), { recursive: true });
        await fs.writeFile(tempPath, transparentBuffer);

        const image = await Jimp.read(tempPath);

        const background = await new Jimp(image.bitmap.width, image.bitmap.height, '#f3fe0b');
        background.composite(image, 0, 0);

        await background.writeAsync('output.png');

        console.log('Background removed and replaced with #f3fe0b.');

        // Optionally delete the temp file
        await fs.unlink(tempPath);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
