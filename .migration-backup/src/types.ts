/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  image?: string;
  display_order?: number; // Sorting order of categories
  created_at?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category_id?: string;
  external_url?: string;
  youtube_url?: string;
  featured: boolean;
  views: number;
  created_at: string;
  updated_at?: string;
  category?: Category; // Joined category
}

export interface AiTool {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  features?: string[];
  uses?: string[];
  category: string;
  image: string;
  url: string;
  badge?: string;
  views?: number;
  hidden?: boolean;
  display_order?: number;
  featured?: boolean;
}
