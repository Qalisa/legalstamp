import type { APIRoute } from 'astro';
import { getEntry } from "astro:content";
import { availableFormatsConfig } from "config";

export const prerender = false

//
//
//

const HEADER_AUTHORIZATION = 'Authorization' as const
const BYPASS_KEYWORD = 'bypass' as const

//
const shouldHandleAuthBypassAttempts = import.meta.env.DEV

/** return bearer token if valid; else, null */
const isAuthTokenValid = (() => {
    const { LEGALSTAMP_AUTH_TOKEN } = import.meta.env
    return typeof LEGALSTAMP_AUTH_TOKEN === "string" && LEGALSTAMP_AUTH_TOKEN != "" ? LEGALSTAMP_AUTH_TOKEN : null
})()

//
//
//

//
export const injectBypassShortcutTo = (path: string) => `${path}?${BYPASS_KEYWORD}`


//
const shouldBypassAuth = (url: URL) => {
    const urlIncludesBypassKeyword = () => url.searchParams.get(BYPASS_KEYWORD) != null
    return isAuthTokenValid && shouldHandleAuthBypassAttempts && urlIncludesBypassKeyword()
}


//
//
//


//
//
//

//
export const getMarkdownPage = () => {
    //
    const pathTo = availableFormatsConfig.markdown.name

    //
    return [
        `Markdown ${shouldHandleAuthBypassAttempts ? '' : ' (Restricted) '}#️⃣`, 
        shouldHandleAuthBypassAttempts ? injectBypassShortcutTo(pathTo) : pathTo
    ] as const
}

//
//
//

//
const _getDocument = async (params: Parameters<APIRoute>["0"]["params"]) => {
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
    
    //
    return entry.body;
}

//
const getDocument = async (...params: Parameters<typeof _getDocument>) => {
    const doc = await _getDocument(...params)
    return new Response(doc, { 
        headers: {
            "Content-Type": availableFormatsConfig['markdown'].contentType
        },
    })  
}

//
const forbidden = () => new Response(undefined, { status: 403 })

//
//
//

//
const _getBearerToken = (headers: Headers): string | null => {
    const authHeader = headers.get(HEADER_AUTHORIZATION)
    if (!authHeader) return null
    
    const [method, token] = authHeader.split(' ')
    if (method !== 'Bearer') return null
    
    return token
}

const checkBearerToken = (headers: Headers) => {
    if (!isAuthTokenValid) return false;
    return _getBearerToken(headers) === isAuthTokenValid;
}

//
//
//

//
export const GET: APIRoute = async ({ params, request: { headers }, url }) => {  
    if (shouldBypassAuth(url) || checkBearerToken(headers)) {
        return getDocument(params);
    }
    return forbidden();
}