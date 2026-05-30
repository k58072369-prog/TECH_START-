/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Article, Category } from '../types';

// Read config with safe fallbacks matching user provided credentials
const supabaseUrl = 
  (typeof process !== 'undefined' ? process?.env?.NEXT_PUBLIC_SUPABASE_URL : '') || 
  ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 
  'https://bqmnjscfnnpvtadlkhbx.supabase.co';

const supabaseAnonKey = 
  (typeof process !== 'undefined' ? process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : '') || 
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || 
  'sb_publishable_UhbCyFEANmVpkLb2z6o_Mw_9ogE0ZYD';

// Create Supabase Client safely
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Database Operations ---

// Fetch all categories with caching
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase categories fetch error:', error);
      return getFallbackCategories();
    }
    
    if (data && typeof window !== 'undefined') {
      localStorage.setItem('tech_start_cached_categories', JSON.stringify(data));
    }
    return data || [];
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return getFallbackCategories();
  }
}

// Fetch all articles with caching
export async function getArticles(options?: {
  categoryId?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Article[]> {
  try {
    let query = supabase
      .from('articles')
      .select(`
        *,
        categories (
          id,
          name,
          image
        )
      `)
      .order('created_at', { ascending: false });

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.featuredOnly) {
      query = query.eq('featured', true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase articles fetch error:', error);
      return getFallbackArticles(options);
    }
    
    // Map categories join to category object and parse youtube_url safely
    const finalArticles = (data || []).map((art: any) => {
      const youtubeMatch = art.content ? art.content.match(/<!-- YOUTUBE_VIDEO_URL:\s*(https?:\/\/[^\s>]+)\s*-->/) : null;
      return {
        ...art,
        youtube_url: youtubeMatch ? youtubeMatch[1] : undefined,
        category: art.categories || null
      };
    });

    if (finalArticles.length > 0 && !options && typeof window !== 'undefined') {
      localStorage.setItem('tech_start_cached_articles', JSON.stringify(finalArticles));
    }
    return finalArticles;
  } catch (err) {
    console.error('Failed to fetch articles:', err);
    return getFallbackArticles(options);
  }
}

// Fetch article by slug with caching
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories (
          id,
          name,
          image
        )
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.warn('Supabase article content error:', error);
      const fallback = getFallbackArticles().find(c => c.slug === slug);
      return fallback || null;
    }

    if (!data) {
      const fallback = getFallbackArticles().find(c => c.slug === slug);
      return fallback || null;
    }

    const youtubeMatch = data.content ? data.content.match(/<!-- YOUTUBE_VIDEO_URL:\s*(https?:\/\/[^\s>]+)\s*-->/) : null;
    return {
      ...data,
      youtube_url: youtubeMatch ? youtubeMatch[1] : undefined,
      category: data.categories || null
    };
  } catch (err) {
    console.error('Failed to fetch article by slug:', err);
    return null;
  }
}

// Increment article view counter
export async function incrementArticleViews(id: string, currentViews: number): Promise<void> {
  try {
    await supabase
      .from('articles')
      .update({ views: currentViews + 1 })
      .eq('id', id);
  } catch (err) {
    console.error('Failed to increment views:', err);
  }
}

// Write/Create article (Admin)
export async function saveArticle(article: Omit<Article, 'id' | 'created_at' | 'views'> & { id?: string; youtube_url?: string }): Promise<Article | null> {
  try {
    let contentToSave = article.content || '';
    // Strip any existing YOUTUBE_VIDEO_URL comments
    contentToSave = contentToSave.replace(/\n*\s*<!-- YOUTUBE_VIDEO_URL:.*?-->/g, '');
    if (article.youtube_url) {
      contentToSave += `\n\n<!-- YOUTUBE_VIDEO_URL: ${article.youtube_url} -->`;
    }

    if (article.id) {
      const { data, error } = await supabase
        .from('articles')
        .update({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: contentToSave,
          cover_image: article.cover_image,
          category_id: article.category_id,
          external_url: article.external_url,
          featured: article.featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Parse back on return
      return {
        ...data,
        youtube_url: article.youtube_url
      };
    } else {
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: contentToSave,
          cover_image: article.cover_image,
          category_id: article.category_id,
          external_url: article.external_url,
          featured: article.featured,
          views: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Parse back on return
      return {
        ...data,
        youtube_url: article.youtube_url
      };
    }
  } catch (err) {
    console.error('Failed to save article to Supabase:', err);
    return null;
  }
}

// Delete Article
export async function deleteArticle(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    return !error;
  } catch (err) {
    console.error('Failed to delete article:', err);
    return false;
  }
}

// Save Category (Admin)
export async function saveCategory(category: { id?: string; name: string; image?: string }): Promise<Category | null> {
  try {
    if (category.id) {
      const { data, error } = await supabase
        .from('categories')
        .update({ name: category.name, image: category.image })
        .eq('id', category.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: category.name, image: category.image })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  } catch (err) {
    console.error('Failed to save category:', err);
    return null;
  }
}

// Delete Category
export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    return !error;
  } catch (err) {
    console.error('Failed to delete category:', err);
    return false;
  }
}


// --- Storage Operations (article-images Bucket) ---

export async function uploadArticleImage(file: File): Promise<string | null> {
  try {
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data, error } = await supabase.storage
      .from('article-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage upload error:', error);
      // Let's create an elegant local ObjectURL fallback if storage isn't activated
      // so mock storage functions correctly on user end for local previews
      return URL.createObjectURL(file);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('article-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload image:', err);
    return URL.createObjectURL(file);
  }
}

export async function deleteArticleImage(path: string): Promise<boolean> {
  try {
    // Extract file path if it's a full URL
    let relativePath = path;
    if (path.includes('/article-images/')) {
      relativePath = path.split('/article-images/').pop() || path;
    }
    const { error } = await supabase.storage
      .from('article-images')
      .remove([relativePath]);
    return !error;
  } catch (err) {
    console.error('Failed to delete image:', err);
    return false;
  }
}


// --- Fallback Mock Data in case Supabase is Offline or Tables not created ---

export function getFallbackCategories(): Category[] {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('tech_start_cached_categories');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [];
      }
    }
  }
  return [];
}

export function getFallbackArticles(options?: { categoryId?: string; featuredOnly?: boolean; limit?: number }): Article[] {
  let list: Article[] = [];
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('tech_start_cached_articles');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          list = parsed;
        }
      } catch (e) {
        list = [];
      }
    }
  }
  
  if (options?.categoryId) {
    list = list.filter(a => a.category_id === options.categoryId);
  }
  if (options?.featuredOnly) {
    list = list.filter(a => a.featured);
  }
  if (options?.limit) {
    list = list.slice(0, options.limit);
  }
  return list;
}
