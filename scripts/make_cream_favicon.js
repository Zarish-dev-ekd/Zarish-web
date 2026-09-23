const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function makeCreamFavicon() {
  const size = 512;
  const appDir = path.join(__dirname, '..', 'src', 'app');
  const publicDir = path.join(__dirname, '..', 'public');

  // Exact reference:
  // Background: #F6EDDC (warm luxury ivory / cream linen)
  // Text: #683C16 (signature chocolate bronze brown)
  // Accent ring: #D2BC95 (soft champagne gold)
  const iconSvg = `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="creamGrad" cx="50%" cy="46%" r="65%">
        <stop offset="0%" stop-color="#FCF8F1" />
        <stop offset="60%" stop-color="#F6EDDC" />
        <stop offset="100%" stop-color="#EDE0CB" />
      </radialGradient>
    </defs>
    <!-- Background rounded square with slight radius (looks great on browser tabs, Android & iOS) -->
    <rect width="${size}" height="${size}" rx="112" fill="url(#creamGrad)" />
    
    <!-- Delicate luxury hairline frame -->
    <rect x="24" y="24" width="${size - 48}" height="${size - 48}" rx="92" 
          fill="none" stroke="#D2BC95" stroke-width="3" opacity="0.6" />
    <rect x="34" y="34" width="${size - 68}" height="${size - 68}" rx="84" 
          fill="none" stroke="#683C16" stroke-width="1" opacity="0.2" />

    <!-- Elegant Serif 'Z' with fine serifs -->
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" 
          font-family="'Playfair Display', 'Cinzel', Georgia, serif" 
          font-weight="600" 
          font-style="italic"
          font-size="310" 
          fill="#683C16">Z</text>
  </svg>
  `;

  const iconBuffer = await sharp(Buffer.from(iconSvg)).png().toBuffer();

  // Save app icon & apple icon
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(appDir, 'icon.png'));
  await sharp(iconBuffer).resize(180, 180).png().toFile(path.join(appDir, 'apple-icon.png'));
  await sharp(iconBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));

  // Also update theme_color in manifest.json to #F6EDDC so mobile browser address bars match the cream tone!
  const manifestPath = path.join(publicDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.theme_color = '#F6EDDC';
    manifest.background_color = '#F6EDDC';
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✓ manifest.json updated with cream theme color');
  }

  console.log('✅ Cream icons (512, 180, 192) generated successfully!');
}

makeCreamFavicon().catch(console.error);
