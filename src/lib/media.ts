import type { SyntheticEvent } from "react";

export interface MediaPointer {
  asset_id: string;
  url: string;
  original_filename?: string;
}

/**
 * CDN pointers carry a root-relative URL ("/__l5e/assets-v1/..."). That path is
 * served on lovable.app hosts but not on custom domains, so on a custom domain
 * the relative URL 404s. We keep the fast relative URL as the primary source
 * and fall back to our own /api/public/media proxy (which redirects to the
 * working Lovable host) when the primary fails to load.
 */
export function mediaFallbackUrl(pointer: MediaPointer): string {
  const file = pointer.url.split("/").pop() || pointer.original_filename || "file";
  return `/api/public/media/${pointer.asset_id}/${file}`;
}

/** Swap an <img> or <video> source to the proxy URL when the CDN path 404s. */
export function onMediaError(pointer: MediaPointer) {
  return (e: SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    const el = e.currentTarget;
    if (el.dataset["fallbackApplied"]) return;
    el.dataset["fallbackApplied"] = "1";
    if (el instanceof HTMLVideoElement) {
      const sources = el.querySelectorAll("source");
      sources.forEach((s) => {
        s.src = mediaFallbackUrl({ ...pointer, url: s.src });
      });
      el.load();
      void el.play().catch(() => {});
    } else {
      el.src = mediaFallbackUrl(pointer);
    }
  };
}
