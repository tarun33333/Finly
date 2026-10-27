import { Category } from '../types';

/**
 * Deduplicates categories by normalized name and type.
 * Prioritizes user-specific categories over system default ones.
 */
export function deduplicateCategories(categories: Category[] | undefined | null): Category[] {
  if (!categories || !Array.isArray(categories)) return [];

  const seen = new Set<string>();
  const result: Category[] = [];

  // Sort so user-owned categories come first if both are present
  const sorted = [...categories].sort((a, b) => {
    const aIsUser = a.userId ? 1 : 0;
    const bIsUser = b.userId ? 1 : 0;
    if (aIsUser !== bIsUser) return bIsUser - aIsUser;
    return a.name.localeCompare(b.name);
  });

  for (const cat of sorted) {
    const key = `${cat.type || 'expense'}:${cat.name.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(cat);
    }
  }

  return result;
}

