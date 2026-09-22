import fs from 'fs';
import path from 'path';
import { createClient } from '@/utils/supabase/server';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'policies.json');

export interface RefundPolicyData {
  eyebrow?: string;
  title: string;
  last_updated?: string;
  highlight_box?: {
    title: string;
    main_rule: string;
    detail: string;
  };
  section1?: {
    heading: string;
    intro: string;
    points: string[];
  };
  section2?: {
    heading: string;
    intro: string;
    points: string[];
  };
  section3?: {
    heading: string;
    intro: string;
    approval_text: string;
    bank_credit_text: string;
  };
  section4?: {
    heading: string;
    intro: string;
    whatsapp: string;
    email: string;
    hours: string;
  };
  custom_content?: string;
}

export function readAllPoliciesFromFile(): Record<string, any> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading policies.json:', err);
  }
  return {};
}

export function writeAllPoliciesToFile(data: Record<string, any>): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing policies.json:', err);
  }
}

export async function getPolicy(slug: string): Promise<any> {
  // 1. Try Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('store_policies')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data?.content) {
      return data.content;
    }
  } catch {
    // Ignore error, fallback to local file
  }

  // 2. Fallback to local file
  const all = readAllPoliciesFromFile();
  if (all[slug]) {
    return all[slug];
  }

  return null;
}

export async function savePolicy(slug: string, content: any): Promise<{ success: boolean; source: string; dbError?: string }> {
  // 1. Save to local JSON file
  const all = readAllPoliciesFromFile();
  all[slug] = content;
  writeAllPoliciesToFile(all);

  // 2. Attempt Supabase save
  let dbSuccess = false;
  let dbError = undefined;

  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('store_policies')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from('store_policies')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (!error) dbSuccess = true;
      else dbError = error.message;
    } else {
      const { error } = await supabase
        .from('store_policies')
        .insert([{ slug, content, updated_at: new Date().toISOString() }]);
      if (!error) dbSuccess = true;
      else dbError = error.message;
    }
  } catch (err: any) {
    dbError = err?.message;
  }

  return {
    success: true,
    source: dbSuccess ? 'supabase' : 'file',
    dbError,
  };
}
