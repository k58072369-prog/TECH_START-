/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, useContext } from 'react';

export interface RouteState {
  path: string;
  slug?: string; // used for article/category slug
}

interface RouterContextType {
  route: RouteState;
  navigate: (path: string) => void;
}

export function parseLocation(): RouteState {
  const path = window.location.pathname;
  
  if (path === '/' || path === '') {
    return { path: 'home' };
  }
  
  if (path === '/admin') {
    return { path: 'admin' };
  }
  
  if (path.startsWith('/article/')) {
    const slug = path.split('/article/')[1];
    return { path: 'article', slug };
  }
  
  if (path.startsWith('/category/')) {
    const slug = path.split('/category/')[1];
    return { path: 'category', slug };
  }

  if (path.startsWith('/tool/')) {
    const slug = path.split('/tool/')[1];
    return { path: 'tool', slug };
  }
  
  return { path: '404' };
}

// Convert route state back to string path
export function routeToUrl(state: RouteState): string {
  if (state.path === 'home') return '/';
  if (state.path === 'admin') return '/admin';
  if (state.path === 'article') return `/article/${state.slug}`;
  if (state.path === 'category') return `/category/${state.slug}`;
  if (state.path === 'tool') return `/tool/${state.slug}`;
  return '/404';
}
