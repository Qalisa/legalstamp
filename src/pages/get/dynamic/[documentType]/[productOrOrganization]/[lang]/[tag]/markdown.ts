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
    return !authorized || !originAllowed(origin) 
        ? forbidden(origin) 
        : (async () => {
            const doc = await getDocument(params)
            return new Response(doc, { 
                headers: basicHeaders({ whitelistedOrigin: isCORSRequest ? origin : undefined})
            })  
        })()
    
}

export const OPTIONS: APIRoute = async ({ request: { headers } }) => {
    const origin = headers.get(HEADER_ORIGIN) ?? '';

    //
    if (originAllowed(origin)) {
        return new Response(null, {
            headers: basicHeaders({ whitelistedOrigin: origin }),
        });
    }

    //
    return forbidden(origin);
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
const isDomainRootScopedPrefix = "*." as const
const isDomainRootScoped = (arg: string) => arg.startsWith(isDomainRootScopedPrefix)

//
const domainsWhitelist = (() => {
    //
    const allowedRaw = (import.meta.env.CORS_ALLOW_ORIGIN ?? '')
    
    // allow all, no whitelist
    if (allowedRaw === "*") return null

    //
    const args = allowedRaw.split(',').filter(Boolean);
    return {
        /** */
        allowedCatchalls: args
            .filter(isDomainRootScoped) // only with "*."
            .map(e => e.slice(isDomainRootScopedPrefix.length)) // remove "*."
            .filter(Boolean), // no empty values
        /** */
        allowedSingles: args
            .filter((e) => !isDomainRootScoped(e))
            .map(domain => {
                // already including scheme, nothing to do
                if (domain.startsWith('http://') || domain.startsWith('https://')) {
                    return domain
                }

                // requires https by default
                return "https://" + domain
            })
    }
})();


// no whitelist ? all allowed
const originAllowed = domainsWhitelist == null 
    ? () => true 
    : (origin: string | null) => {
        // no "Origin" ? not allowed
        if (origin == null || origin == '') return false

        // does "Origin" respect exact match of any singles whitelisted ?
        if(domainsWhitelist.allowedSingles.includes(origin)) return true
        
        // does the "Origin" hostname part (eg, without scheme and port) ends with any allowed catchall ?
        return domainsWhitelist.allowedCatchalls.some(domain => 
            new URL(origin).hostname.endsWith(domain)
        )
    }

//
const forbidden = (origin: string) => {
    //
    const message = "Requester not whitelisted. Should be either " + 
            (domainsWhitelist 
                ? [...domainsWhitelist.allowedSingles, ...domainsWhitelist.allowedCatchalls] 
                : []
            ).join(',')

    //
    console.log("CORS Access rejected", message, ". Origin: ", origin)

    //
    return new Response(message, { status: 403 })
}
const corsRestricted = () => new Response("Please use CORS to access this ressource.", { status: 403 })

//
const basicHeaders = ({ whitelistedOrigin } : { whitelistedOrigin?: string }) : HeadersInit => ({
    ...whitelistedOrigin != null ? {
        "Access-Control-Allow-Headers": [
            ...allowAuthorizationOnToken ? [HEADER_AUTHORIZATION]: []
        ].join(', '),
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Origin": whitelistedOrigin ?? '*',
    } : {},
    "Content-Type": availableFormatsConfig['markdown'].contentType,
})