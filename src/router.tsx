import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => (<div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center"><h1 className="font-display text-2xl font-bold">Page not found</h1><a href="/" className="text-primary underline">Go to qmam.site home</a></div>),
  });

  return router;
};
