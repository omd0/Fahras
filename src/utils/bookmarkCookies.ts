'use client';

const COOKIE_NAME = 'guest_bookmarks';
const MAX_AGE = 365 * 24 * 60 * 60;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof window === 'undefined') return;
  const isProduction = window.location.protocol === 'https:';
  const secureFlag = isProduction ? '; Secure' : '';
  document.cookie = `${name}=${value}; Max-Age=${maxAge}; SameSite=Lax; Path=/${secureFlag}`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=0; Path=/`;
}

export function getGuestBookmarks(): number[] {
  try {
    const cookieValue = getCookie(COOKIE_NAME);
    if (!cookieValue) return [];
    const ids = JSON.parse(cookieValue);
    if (Array.isArray(ids)) {
      return ids.map((id) => Number(id)).filter((id) => !isNaN(id));
    }
    return [];
  } catch {
    return [];
  }
}

export function addGuestBookmark(projectId: number): void {
  try {
    const currentBookmarks = getGuestBookmarks();
    if (!currentBookmarks.includes(projectId)) {
      const updatedBookmarks = [...currentBookmarks, projectId];
      setCookie(COOKIE_NAME, JSON.stringify(updatedBookmarks), MAX_AGE);
    }
  } catch {
    /* empty */
  }
}

export function removeGuestBookmark(projectId: number): void {
  try {
    const currentBookmarks = getGuestBookmarks();
    const updatedBookmarks = currentBookmarks.filter((id) => id !== projectId);
    if (updatedBookmarks.length === 0) {
      deleteCookie(COOKIE_NAME);
    } else {
      setCookie(COOKIE_NAME, JSON.stringify(updatedBookmarks), MAX_AGE);
    }
  } catch {
    /* empty */
  }
}

export function isGuestBookmarked(projectId: number): boolean {
  const bookmarks = getGuestBookmarks();
  return bookmarks.includes(projectId);
}

export function clearGuestBookmarks(): void {
  deleteCookie(COOKIE_NAME);
}
