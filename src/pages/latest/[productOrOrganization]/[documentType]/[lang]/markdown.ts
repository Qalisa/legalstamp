import type { APIRoute } from "astro";
import { availableFormatsConfig } from "helpers/legalstamp.groupedBy";
import { markdown_GET } from "helpers/redirect";

export const prerender = false

export const GET : APIRoute = async (context) => {
    context.params['tag'] = availableFormatsConfig.markdown.name
    return markdown_GET(context)
}
