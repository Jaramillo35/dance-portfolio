import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = './src/assets/dance1';
const outputDir = './src/assets/dance1-optimized';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizePhotos() {
  try {
    const files = fs.readdirSync(inputDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} images to optimize...`);

    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);
      
      console.log(`Optimizing ${file}...`);
      
      await sharp(inputPath)
        .resize(1200, 1200, { // Max dimensions
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 85, // High quality
          progressive: true,
          mozjpeg: true
        })
        .toFile(outputPath);
    }

    console.log('✅ Photo optimization complete!');
    console.log(`📁 Optimized photos saved to: ${outputDir}`);
    console.log('💡 Replace the original dance1 folder with dance1-optimized for production');
    
  } catch (error) {
    console.error('Error optimizing photos:', error);
  }
}

optimizePhotos();
