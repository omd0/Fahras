/**
 * Cookie utilities for guest bookmark management
 * Stores only project IDs as JSON array in cookie
 */

const COOKIE_NAME = 'guest_bookmarks';
const MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Set cookie with proper settings
 */
function setCookie(name: string, value: string, maxAge: number): void {
  const isProduction = window.location.protocol === 'https:';
  const secureFlag = isProduction ? '; Secure' : '';
  document.cookie = `${name}=${value}; Max-Age=${maxAge}; SameSite=Lax; Path=/${secureFlag}`;
}

/**
 * Delete cookie
 */
function deleteCookie(name: string): void {
  document.cookie = `${name}=; Max-Age=0; Path=/`;
}

/**
 * Read bookmark IDs from cookie
 * Returns array of project IDs
 */
export function getGuestBookmarks(): number[] {
  try {
    const cookieValue = getCookie(COOKIE_NAME);
    if (!cookieValue) {
      return [];
    }
    const ids = JSON.parse(cookieValue);
    if (Array.isArray(ids)) {
      return ids.map(id => Number(id)).filter(id => !isNaN(id));
    }
    return [];
  } catch (error) {
    console.error('Error reading guest bookmarks from cookie:', error);
    return [];
  }
}

/**
 * Add project ID to cookie
 */
export function addGuestBookmark(projectId: number): void {
  try {
    const currentBookmarks = getGuestBookmarks();
    if (!currentBookmarks.includes(projectId)) {
      const updatedBookmarks = [...currentBookmarks, projectId];
      setCookie(COOKIE_NAME, JSON.stringify(updatedBookmarks), MAX_AGE);
    }
  } catch (error) {
    console.error('Error adding guest bookmark to cookie:', error);
  }
}

/**
 * Remove project ID from cookie
 */
export function removeGuestBookmark(projectId: number): void {
  try {
    const currentBookmarks = getGuestBookmarks();
    const updatedBookmarks = currentBookmarks.filter(id => id !== projectId);
    if (updatedBookmarks.length === 0) {
      deleteCookie(COOKIE_NAME);
    } else {
      setCookie(COOKIE_NAME, JSON.stringify(updatedBookmarks), MAX_AGE);
    }
  } catch (error) {
    console.error('Error removing guest bookmark from cookie:', error);
  }
}

/**
 * Check if project is bookmarked in cookie
 */
export function isGuestBookmarked(projectId: number): boolean {
  const bookmarks = getGuestBookmarks();
  return bookmarks.includes(projectId);
}

/**
 * Clear all guest bookmarks
 */
export function clearGuestBookmarks(): void {
  deleteCookie(COOKIE_NAME);
}
