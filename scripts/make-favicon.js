const sharp = require('sharp');
const path = require('path');

const src = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\be652bbf-c6ea-4ea3-870d-e7a74ca4e426\\zarish_favicon_icon_1790146543345.jpg';
const appDir = path.join(__dirname, '..', 'src', 'app');
const publicDir = path.join(__dirname, '..', 'public');

async function main() {
  // icon.png – 512x512 for Next.js PWA / app icon
  await sharp(src).resize(512, 512).png().toFile(path.join(appDir, 'icon.png'));
  console.log('✓ icon.png (512x512)');

  // apple-icon.png – 180x180 for Apple touch icon
  await sharp(src).resize(180, 180).png().toFile(path.join(appDir, 'apple-icon.png'));
  console.log('✓ apple-icon.png (180x180)');

  // Public manifest icons
  await sharp(src).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(src).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ icon-192.png, icon-512.png in /public');

  // OG image – 1200x630 – logo on warm cream background
  const logoPath = path.join(publicDir, 'logo-zarish.png');
  const logoMeta = await sharp(logoPath).metadata();
  const ogW = 1200, ogH = 630;
  const logoMaxW = 700;
  const logoMaxH = 220;

  let lw = logoMeta.width, lh = logoMeta.height;
  const ratio = Math.min(logoMaxW / lw, logoMaxH / lh);
  lw = Math.round(lw * ratio);
  lh = Math.round(lh * ratio);

  const resizedLogo = await sharp(logoPath).resize(lw, lh).png().toBuffer();

  const left = Math.round((ogW - lw) / 2);
  const top = Math.round((ogH - lh) / 2);

  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ogW}" height="${ogH}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FAF6F0"/>
        <stop offset="100%" stop-color="#EDE0CC"/>
      </linearGradient>
    </defs>
    <rect width="${ogW}" height="${ogH}" fill="url(#g)"/>
    <rect x="40" y="40" width="${ogW - 80}" height="${ogH - 80}" fill="none" stroke="#C9A96E" stroke-width="2" opacity="0.6"/>
    <rect x="52" y="52" width="${ogW - 104}" height="${ogH - 104}" fill="none" stroke="#C9A96E" stroke-width="1" opacity="0.3"/>
  </svg>`;

  await sharp(Buffer.from(bgSvg))
    .composite([{ input: resizedLogo, left, top }])
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'og-image.jpg'));
  console.log('✓ og-image.jpg (1200x630)');

  console.log('\n✅ All favicon and SEO assets created!');
}

main().catch(e => { console.error(e); process.exit(1); });
