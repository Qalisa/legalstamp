import type { APIRoute } from "astro";
import { TAG__LATEST } from "helpers/legalstamp.groupedBy";
import { markdown_GET } from "helpers/redirect";

export const prerender = false

export const GET : APIRoute = async (context) => {
    context.params['tag'] = TAG__LATEST
    return markdown_GET(context)
}
