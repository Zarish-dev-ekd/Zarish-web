import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategoryBySlug } from '@/lib/supabase';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Collection | ZARISH',
    };
  }

  return {
    title: `${category.name} Collection | ZARISH by Nehala Mufeed`,
    description: category.description || `Discover elegant modest ${category.name.toLowerCase()} by ZARISH.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  redirect(`/products?category=${encodeURIComponent(slug)}`);
}

