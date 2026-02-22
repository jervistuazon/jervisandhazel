const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'photos');
const files = fs.readdirSync(dir).filter(f => f.match(/\.(jpg|jpeg|png|heic)$/i));

async function run() {
    let count = 1;
    for (const file of files) {
        // Skip existing webp
        if (file.endsWith('.webp')) continue;

        const inputPath = path.join(dir, file);
        const outputPath = path.join(dir, `photo-${count}.webp`);
        console.log(`Converting ${file} to photo-${count}.webp...`);
        try {
            await sharp(inputPath)
                .webp({ quality: 80 })
                .toFile(outputPath);
            count++;
        } catch (err) {
            console.error(`Failed on ${file}:`, err.message);
        }
    }
    console.log(`Done converting!`);
}

run();
