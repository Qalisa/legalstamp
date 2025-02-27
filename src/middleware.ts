import { defineMiddleware } from "astro:middleware";

// remove trailing slashes. Requires 'trailingSlash: "ignore"'
export const onRequest = defineMiddleware(({ request }, next) => {
    const url = new URL(request.url);
    // Exclude the root path
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      // Remove the trailing slash
      url.pathname = url.pathname.slice(0, -1);
      // Return a 301 redirect to the updated URL
      return Response.redirect(url.toString(), 301);
    }
    // If no trailing slash, let the request proceed
    return next();
  })