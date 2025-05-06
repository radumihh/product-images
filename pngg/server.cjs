const Jimp = require('jimp');



async function changeProductBackground(inputPath, outputPath, newHexColor) {
    try {
        const image = await Jimp.read(inputPath);
        const { width, height } = image.bitmap;

        const bgColor = detectBackgroundColor(image);
        
        const colorVariation = 45;
        const edgeDetection = true;

        const newColor = Jimp.cssColorToHex(newHexColor);
        const visited = Array.from({ length: height }, () => 
            new Array(width).fill(false)
        );

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (!visited[y][x]) {
                    const pixel = image.getPixelColor(x, y);
                    if (isBackgroundPixel(pixel, bgColor, colorVariation, edgeDetection)) {
                        floodFill(x, y, pixel, newColor, image, visited, colorVariation);
                    }
                }
            }
        }

        await image.writeAsync(outputPath);
        console.log('Fundal schimbat cu succes!');
    } catch (err) {
        console.error('Eroare:', err);
    }
}

function detectBackgroundColor(image) {
    const samples = [];
    const { width, height } = image.bitmap;

    if (width > 0 && height > 0) {
        samples.push(image.getPixelColor(0, 0));
        samples.push(image.getPixelColor(width-1, 0));
        samples.push(image.getPixelColor(0, height-1));
        samples.push(image.getPixelColor(width-1, height-1));
    }

    if (samples.length === 0) {
        throw new Error('Nu s-au putut colecta eșantioane de fundal');
    }

    return samples.sort((a, b) => a - b)[Math.floor(samples.length/2)];
}

function isBackgroundPixel(pixel, bgColor, variation, edgeDetection) {
    const parsedBgColor = Number(bgColor);
    if (isNaN(parsedBgColor)) {
        throw new Error('Culoarea fundalului este invalidă');
    }

    const current = Jimp.intToRGBA(pixel);
    const target = Jimp.intToRGBA(parsedBgColor);
    
    const colorDiff = colorDistance(current, target);
    const hsl = rgbToHsl(current.r, current.g, current.b);
    
    return (
        colorDiff < variation || 
        (hsl.l > 0.7 && hsl.s < 0.25) || 
        (edgeDetection && isEdgePixel(current, target))
    );
}


function floodFill(x, y, targetColor, newColor, image, visited, variation) {
    const queue = [[x, y]];
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        
        if (cx < 0 || cx >= width || cy < 0 || cy >= height || visited[cy][cx]) continue;
        
        const currentColor = Jimp.intToRGBA(image.getPixelColor(cx, cy));
        if (colorDistance(currentColor, targetColor) < variation) {
            image.setPixelColor(newColor, cx, cy);
            visited[cy][cx] = true;
            
            queue.push([cx + 1, cy]);
            queue.push([cx - 1, cy]);
            queue.push([cx, cy + 1]);
            queue.push([cx, cy - 1]);
        }
    }
}

changeProductBackground('./input/1.jpg', 'output.jpg', '#ff0000');