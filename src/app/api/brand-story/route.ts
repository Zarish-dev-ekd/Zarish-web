import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'brand-story.json');

const DEFAULT_STORY = {
  id: 'brand-story-default',
  heading: 'Dear Zarish Family,',
  eyebrow: 'A NOTE FROM OUR FOUNDER',
  paragraphs: [
    'Zarish started as a small dream my husband and I shared. While building it, we were also learning to be parents, and our little girl was growing alongside us. There were days we wished we could give her more of our time, but she quietly waited, adjusted, and grew with us. Looking back, I realise she didn’t just grow up alongside Zarish—she grew up with it.',
    'I’m forever grateful to my husband for being my strength through every high and low, believing in me when I doubted myself, and always encouraging me to keep going. And to our Zarish family, thank you for being part of this journey. Every order, kind message, share, recommendation, and every person who believed in us has meant more than you know.',
    'We started Zarish with a dream, and today, we carry it with gratitude. Every order reminds us that something we built with love has found a place in someone else’s life. As we continue to grow, we’re grateful to have you with us. Thank you for being a part of our Zarish story.',
  ],
  sign_off: 'With love,',
  founder_name: 'Nehala Mufeed',
  founder_role: 'Founder, Zarish',
  image_url: '/zarish-brand-card.webp',
  image_alt: 'ZARISH by Nehala Mufeed',
  cta_text: 'Shop now',
  cta_url: '/products',
  is_active: true,
  updated_at: new Date().toISOString(),
};

function readFallback() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading brand-story.json:', e);
  }
  return DEFAULT_STORY;
}

function writeFallback(data: any) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing brand-story.json:', e);
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('brand_story')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({ success: true, story: data, source: 'supabase' });
    }

    const fallback = readFallback();
    return NextResponse.json({
      success: true,
      story: fallback,
      source: 'fallback',
      dbError: error ? error.message : null,
    });
  } catch (err: any) {
    const fallback = readFallback();
    return NextResponse.json({
      success: true,
      story: fallback,
      source: 'fallback',
      error: err?.message,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = {
      ...DEFAULT_STORY,
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Always update fallback file
    writeFallback(payload);

    let supabaseSuccess = false;
    let dbError = null;

    try {
      const supabase = await createClient();
      const { data: existing } = await supabase.from('brand_story').select('id').limit(1).maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from('brand_story')
          .update(payload)
          .eq('id', existing.id);
        if (!error) supabaseSuccess = true;
        else dbError = error.message;
      } else {
        const { error } = await supabase.from('brand_story').insert([payload]);
        if (!error) supabaseSuccess = true;
        else dbError = error.message;
      }
    } catch (e: any) {
      dbError = e?.message;
    }

    return NextResponse.json({
      success: true,
      story: payload,
      supabaseSuccess,
      dbError,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update brand story' },
      { status: 500 }
    );
  }
}
