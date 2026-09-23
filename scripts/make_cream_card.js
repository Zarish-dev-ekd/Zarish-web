const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateCards() {
  const width = 1200;
  const height = 1200;

  // Exact reference colors from Image 2:
  // Background: #F6EDDC (warm luxury ivory / cream linen)
  // Logo text: #683C16 / #6F4316 (signature ZARISH warm saddle chocolate brown)
  // Accent frame: warm muted gold / champagne bronze #C9A86A / #D6BC8A

  const logoBuffer = fs.readFileSync('public/logo-zarish.png');
  const logoMeta = await sharp(logoBuffer).metadata();
  
  // Resize logo for 1200x1200 canvas
  const targetLogoWidth = 840;
  const targetLogoHeight = Math.round((logoMeta.height / logoMeta.width) * targetLogoWidth);

  const resizedLogo = await sharp(logoBuffer)
    .resize(targetLogoWidth, targetLogoHeight)
    .png()
    .toBuffer();

  // Version 1: Clean, pure, high-luxury aesthetic matching Image 2 exactly
  // With delicate double inset border, subtle warm gradient depth, and corner accents
  const v1Svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Subtle luxury radial light falloff for tactile depth -->
      <radialGradient id="creamGlow" cx="50%" cy="48%" r="68%">
        <stop offset="0%" stop-color="#FCF8F2" />
        <stop offset="55%" stop-color="#F7EEDD" />
        <stop offset="85%" stop-color="#F2E5D0" />
        <stop offset="100%" stop-color="#EBDBBE" />
      </radialGradient>
      <!-- Subtle paper texture noise -->
      <filter id="paperTexture" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0.035 0" result="subtleGrain"/>
        <feComposite in2="SourceGraphic" in="subtleGrain" operator="in"/>
      </filter>
    </defs>

    <!-- Base Warm Cream Background -->
    <rect width="${width}" height="${height}" fill="url(#creamGlow)" />
    
    <!-- Outer Inset Border (Delicate Champagne Gold / Bronze) -->
    <rect x="48" y="48" width="${width - 96}" height="${height - 96}" 
          fill="none" stroke="#C8A774" stroke-width="1.5" opacity="0.65" rx="8" />

    <!-- Inner Micro-Hairline Border -->
    <rect x="62" y="62" width="${width - 124}" height="${height - 124}" 
          fill="none" stroke="#683C16" stroke-width="0.75" opacity="0.22" rx="5" />

    <!-- Corner Diamond Accents -->
    <g fill="#C8A774" opacity="0.75">
      <!-- Top Left -->
      <polygon points="48,44 52,48 48,52 44,48" />
      <!-- Top Right -->
      <polygon points="${width - 48},44 ${width - 44},48 ${width - 48},52 ${width - 52},48" />
      <!-- Bottom Left -->
      <polygon points="48,${height - 52} 52,${height - 48} 48,${height - 44} 44,${height - 48}" />
      <!-- Bottom Right -->
      <polygon points="${width - 48},${height - 52} ${width - 44},${height - 48} ${width - 48},${height - 44} ${width - 52},${height - 48}" />
    </g>

    <!-- TM mark top right of ZARISH -->
    <text x="${Math.round((width + targetLogoWidth) / 2) + 6}" 
          y="${Math.round((height - targetLogoHeight) / 2) - 35 + 28}" 
          font-family="'Playfair Display', Georgia, serif" 
          font-size="20" 
          font-weight="bold" 
          fill="#683C16" 
          opacity="0.85">TM</text>

    <!-- Delicate Tagline: 'beauty in modesty' in elegant serif italics with flourish lines -->
    <g transform="translate(0, ${Math.round((height + targetLogoHeight) / 2) + 42})">
      <!-- Left hairline flourish -->
      <line x1="${(width / 2) - 240}" y1="0" x2="${(width / 2) - 140}" y2="0" stroke="#C8A774" stroke-width="1" opacity="0.6" />
      <circle cx="${(width / 2) - 140}" cy="0" r="2.5" fill="#683C16" opacity="0.5" />
      
      <!-- Tagline text -->
      <text x="50%" y="7" text-anchor="middle" 
            font-family="'Playfair Display', Georgia, 'Times New Roman', serif" 
            font-style="italic" 
            font-size="29" 
            letter-spacing="5" 
            fill="#683C16" 
            opacity="0.88">
        beauty in modesty
      </text>

      <!-- Right hairline flourish -->
      <circle cx="${(width / 2) + 140}" cy="0" r="2.5" fill="#683C16" opacity="0.5" />
      <line x1="${(width / 2) + 140}" y1="0" x2="${(width / 2) + 240}" y2="0" stroke="#C8A774" stroke-width="1" opacity="0.6" />
    </g>
  </svg>
  `;

  const bgBuffer1 = await sharp(Buffer.from(v1Svg)).png().toBuffer();

  const logoTop1 = Math.round((height - targetLogoHeight) / 2) - 35;
  const logoLeft1 = Math.round((width - targetLogoWidth) / 2);

  await sharp(bgBuffer1)
    .composite([
      { input: resizedLogo, top: logoTop1, left: logoLeft1 }
    ])
    .webp({ quality: 95 })
    .toFile('public/zarish-brand-card.webp');

  console.log('✅ Generated public/zarish-brand-card.webp successfully!');

  // Also create a pure minimalist version without the tagline if client wants pure Image 2 style
  const v2Svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="creamGlow2" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#FCF9F3" />
        <stop offset="60%" stop-color="#F6EDDC" />
        <stop offset="100%" stop-color="#EEDFCA" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#creamGlow2)" />
    <!-- Ultra subtle framing -->
    <rect x="44" y="44" width="${width - 88}" height="${height - 88}" 
          fill="none" stroke="#D3BE9B" stroke-width="1.2" opacity="0.55" rx="6" />
    <rect x="56" y="56" width="${width - 112}" height="${height - 112}" 
          fill="none" stroke="#C4AA7E" stroke-width="0.6" opacity="0.3" rx="4" />
  </svg>
  `;
  const bgBuffer2 = await sharp(Buffer.from(v2Svg)).png().toBuffer();
  const logoTop2 = Math.round((height - targetLogoHeight) / 2);
  const logoLeft2 = Math.round((width - targetLogoWidth) / 2);

  await sharp(bgBuffer2)
    .composite([
      { input: resizedLogo, top: logoTop2, left: logoLeft2 }
    ])
    .webp({ quality: 95 })
    .toFile('public/zarish-brand-card-minimal.webp');

  console.log('✅ Generated public/zarish-brand-card-minimal.webp successfully!');
}

generateCards().catch(console.error);
