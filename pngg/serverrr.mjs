import fs from 'fs';
import sharp from 'sharp';
import { removeBackground } from '@imgly/background-removal-node';

const inputPath = './input/1.jpg';
const outputPath = './output/1.png';

async function removeBg() {
  try {
    // Convert the image to a standard format first using sharp
    const processedBuffer = await sharp(inputPath)
      .png() 
      .toBuffer();

      console.log(processedBuffer)
    
    const result = await removeBackground(processedBuffer, {
      publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-node@1.4.5/dist/',
      output: {
        format: 'image/png',
        type: 'buffer'
      }
    });

    fs.writeFileSync(outputPath, result);
    console.log(`✅ Background removed successfully and saved to ${outputPath}`);
  } catch (error) {
    console.error('❌ Error removing background:', error);
  }
}

removeBg();