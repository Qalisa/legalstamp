import type { APIRoute } from "astro"
import { availableFormatsConfig, formatStubs } from "./legalstamp.groupedBy"

export const markdown_GET: APIRoute = async ({ params: { documentType, lang, productOrOrganization, tag }, rewrite, url }) => {
    //
    const outTo = [
        formatStubs.dynamic, 
        documentType, 
        productOrOrganization, 
        lang, 
        tag, 
        availableFormatsConfig.markdown.name
    ].filter(Boolean).join('/') + url.search
    
    //
    return rewrite(outTo) 
}