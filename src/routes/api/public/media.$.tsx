import { createFileRoute } from "@tanstack/react-router";

/**
 * Media proxy for custom domains.
 *
 * Lovable CDN pointers are root-relative ("/__l5e/assets-v1/<id>/<file>") and
 * only resolve on lovable.app hosts. On a custom domain the same path 404s, so
 * the app falls back to this route, which redirects to the asset on the
 * project's stable Lovable host. Only well-formed asset ids and filenames are
 * accepted; everything else gets a 400/404.
 */
const LOVABLE_HOST = "https://giue56w4tryuiougfyd.lovable.app";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const FILE_RE = /^[A-Za-z0-9._-]{1,120}$/;

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = params._splat ?? "";
        const [assetId, ...rest] = splat.split("/");
        const file = rest.join("/");

        if (!UUID_RE.test(assetId ?? "") || !FILE_RE.test(file) || file.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const target = `${LOVABLE_HOST}/__l5e/assets-v1/${assetId}/${file}`;
        return new Response(null, {
          status: 302,
          headers: {
            Location: target,
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
