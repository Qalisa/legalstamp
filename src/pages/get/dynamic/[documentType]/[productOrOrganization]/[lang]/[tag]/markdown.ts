import { getEntry } from "astro:content";
import { availableFormatsConfig } from "helpers/legalstamp.groupedBy";
import type { APIRoute } from 'astro';

export const prerender = false

//
//
//

export const injectBypass = (path: string) => `${path}?bypass`
const allowedToBypass = (url: URL) => import.meta.env.DEV && url.searchParams.get('bypass') != null

//
export const getMarkdownPage = () => {
    //
    const bypass = import.meta.env.DEV
    const pathTo = availableFormatsConfig.markdown.name

    //
    return [
        `Markdown #️⃣${bypass ? '' : ' (CORS)'}`, 
        bypass ? injectBypass(pathTo) : pathTo
    ] as const
}

//
//
//

//
export const GET: APIRoute = async ({ params, request: { headers }, url }) => {
    //
    const origin = headers.get('Origin') ?? ''
    const isCORSRequest = origin != ""
    const bypass = allowedToBypass(url)

    //
    if (!isCORSRequest && !bypass) {
        return corsRestricted()
    }

    return originAllowed(origin) 
        ? new Response(await getDocument(params), { headers: corsHeaders()}) 
        : forbidden()
    
}

export const OPTIONS: APIRoute = async ({ request: { headers } }) => {
    const origin = headers.get('Origin');

    //
    if (originAllowed(origin)) {
        return new Response(null, {
            headers: corsHeaders(origin!),
        });
    }

    //
    return forbidden();
}

//
//
//

//
const getDocument = async (params: Record<string, string | undefined>) => {
    //
    const { documentType, lang, productOrOrganization, tag } = params;
    const slug = [documentType, productOrOrganization, lang, tag].join('/')

    //
    const entry = await getEntry('legalstamped', slug)
    if (!entry) {
      throw new Error('Could not find document');
    } else if (entry.rendered?.html == '') {
        throw new Error('Document exist, but is empty');
    }
    
    return entry.body
}


//
const allowedOrigins = (() => {
    const allowedRaw = (import.meta.env.CORS_ALLOW_ORIGIN ?? '')
    if (allowedRaw == "*") return null
    return allowedRaw.split(',')
        .filter(Boolean)
        .map(domain => "https://" + domain);
})();


//
const originAllowed = (origin: string | null) => {
    if (origin == null) return false
    if (allowedOrigins == null) return true
    return allowedOrigins.includes(origin)
}

//
const forbidden = () => new Response("Requester not whitelisted. Should be either " + allowedOrigins?.join(','), { status: 403 }) 
const corsRestricted = () => new Response("Please use CORS to access this", { status: 403 })

//
const corsHeaders = (whOrigin?: string) : HeadersInit => ({
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Origin": whOrigin ?? 'null',
    "Content-Type": availableFormatsConfig['markdown'].contentType,
})