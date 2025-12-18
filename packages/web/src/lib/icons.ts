import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

// Get a Lucide icon by name dynamically
export function getIconByName(name: string | undefined): LucideIcon | null {
  if (!name) return null;

  // The Icons object contains all exports including non-icon utilities
  // We check if it's a valid icon function
  const icon = (Icons as Record<string, unknown>)[name];

  if (typeof icon === 'function' || typeof icon === 'object') {
    return icon as LucideIcon;
  }

  return null;
}
