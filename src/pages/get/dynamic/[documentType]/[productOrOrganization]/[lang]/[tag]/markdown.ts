import type { APIRoute } from 'astro';
import { getEntry } from "astro:content";
import { availableFormatsConfig } from "helpers/legalstamp.groupedBy";

export const prerender = false

//
//
//

const HEADER_ORIGIN = 'Origin' as const
const HEADER_AUTHORIZATION = 'Authorization' as const
const BYPASS_KEYWORD = 'bypass' as const

//
//
//

export const injectBypass = (path: string) => `${path}?${BYPASS_KEYWORD}`
const shouldHandleBypassAttempts = import.meta.env.DEV
const allowedToBypass = (url: URL) => 
    shouldHandleBypassAttempts && url.searchParams.get(BYPASS_KEYWORD) != null

//
//
//

const allowAuthorizationOnToken = (() => {
    const { CORS_AUTH_BEARER_TOKEN } = import.meta.env
    return CORS_AUTH_BEARER_TOKEN == '' || CORS_AUTH_BEARER_TOKEN == null 
        ? null
        : CORS_AUTH_BEARER_TOKEN
})()

//
//
//


//
export const getMarkdownPage = () => {
    //
    const pathTo = availableFormatsConfig.markdown.name

    //
    return [
        `Markdown ${shouldHandleBypassAttempts ? '' : ' (CORS) '}#️⃣`, 
        shouldHandleBypassAttempts ? injectBypass(pathTo) : pathTo
    ] as const
}

//
//
//

//
export const GET: APIRoute = async ({ params, request: { headers }, url }) => {
    //
    const origin = headers.get(HEADER_ORIGIN) ?? ''
    const isCORSRequest = origin != ""
    const bypass = allowedToBypass(url)

    //
    const authorized = !allowAuthorizationOnToken ? false : (() => {
        const rawAuth = headers.get(HEADER_AUTHORIZATION)
        if (!rawAuth) return false
        const [method, token] = rawAuth?.split(' ')
        if (method != "Bearer") return false
        return allowAuthorizationOnToken == token
    })()

    //
    if ((!isCORSRequest && !bypass) && !authorized) {
        return corsRestricted()
    }

    //
    return authorized || originAllowed(origin) ? (async () => {
        const doc = await getDocument(params)
        return new Response(doc, { headers: corsHeaders()})  
    })() : forbidden()
    
}

export const OPTIONS: APIRoute = async ({ request: { headers } }) => {
    const origin = headers.get(HEADER_ORIGIN);

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
    "Access-Control-Allow-Headers": [
        ...allowAuthorizationOnToken ? [HEADER_AUTHORIZATION]: []
    ].join(', '),
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Origin": whOrigin ?? 'null',
    "Content-Type": availableFormatsConfig['markdown'].contentType,
})