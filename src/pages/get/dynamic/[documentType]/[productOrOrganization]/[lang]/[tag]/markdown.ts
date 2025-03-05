import type { APIRoute } from 'astro';
import { getEntry } from "astro:content";
import { availableFormatsConfig } from "config";
import { domainsWhitelist } from 'config/corsWhitelist';

export const prerender = false

type Log = {[key: string]: unknown}
const logCORS = (log: Log, msg: string) => console.log("CORS =>", log, "=>", msg)
 
//
//
//

const HEADER_AUTHORIZATION = 'Authorization' as const
const BYPASS_KEYWORD = 'bypass' as const

//
//
//

export const injectBypassShortcutTo = (path: string) => `${path}?${BYPASS_KEYWORD}`
const shouldHandleCORSBypassAttempts = import.meta.env.DEV
const doBypassCORSProtection = (url: URL, _: Log) => {
    //
    const urlBypass = url.searchParams.get(BYPASS_KEYWORD) != null
    
    //
    _.bypass = {
        handled: shouldHandleCORSBypassAttempts,
        urlBypass
    }

    //
    return shouldHandleCORSBypassAttempts && urlBypass
}


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
const getOrigin = (headers: Headers, _?: Log) => {
    const origin = headers.get('Origin')
    const referer = headers.get('Referer')
    const host = headers.get('Host')

    //
    if (_)
        _.origin = {
            host,
            origin,
            referer
        }
    
    // we'll also be using "Host" so that server-to-server, which often do not add "Origin" header can still be secured by CORS
    // assume HTTPS
    // TODO: detect SSL to set scheme ?
    return origin ?? "https://" + host; 
}

//
//
//


//
export const getMarkdownPage = () => {
    //
    const pathTo = availableFormatsConfig.markdown.name

    //
    return [
        `Markdown ${shouldHandleCORSBypassAttempts ? '' : ' (CORS) '}#️⃣`, 
        shouldHandleCORSBypassAttempts ? injectBypassShortcutTo(pathTo) : pathTo
    ] as const
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

// no whitelist ? all allowed
const _originAllowed = domainsWhitelist == null 
    ? () => [true, "OK, no whitelist"]
    : (origin: string | null) => {
        // no "Origin" ? not allowed
        if (origin == null || origin == '') return [false, "NOK, origin empty"]

        // does "Origin" respect exact match of any singles whitelisted ?
        if(domainsWhitelist!.allowedSingles.includes(origin)) return [true, "OK, origin in singles whitelist"]
        
        //
        let originUrl = null
        try {
            originUrl = new URL(origin)
        } catch {
            return [false, "NOK, origin '" + origin + "' is no URL"]
        }

        // does the "Origin" hostname part (eg, without scheme and port) ends with any allowed catchall ?
        const inCatchallWhitelist = domainsWhitelist!.allowedCatchalls.some(domain => 
            originUrl.hostname.endsWith(domain)
        )
        return [inCatchallWhitelist, inCatchallWhitelist ? "OK, origin in catchall whitelist" : "NOK, origin not in whitelist (singles / catchall)"]
    }

//
const originAllowed = (origin: string | null, _?: Log) => {
    const [allowed, log] = _originAllowed(origin)
    
    //
    if (_)
        _.originAllow = {
            allowed,
            log
        }

    //
    return allowed
}

//
const forbidden = () => {
    //
    const message = "Requester not whitelisted. Should be either " + 
            (domainsWhitelist 
                ? [...domainsWhitelist.allowedSingles, ...domainsWhitelist.allowedCatchalls] 
                : []
            ).join(',')

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

//
//
//

//
export const GET: APIRoute = async ({ params, request: { headers }, url }) => {
    const log: Log = {}
    
    //
    const origin = getOrigin(headers, log) ?? ''
    const isCORSRequest = origin != ""
    const bypassCORS = doBypassCORSProtection(url, log)

    //
    if (!bypassCORS && !isCORSRequest) {
        logCORS(log, "CORS restricted")
        return corsRestricted()
    }

    //
    const [authorized, authLog ] = (() => {
        //
        if (bypassCORS) return [true, "OK, bypass"]
        if (allowAuthorizationOnToken == null) return [false, "NOK, no token configured on server"]

        //
        const rawAuth = headers.get(HEADER_AUTHORIZATION)
        if (!rawAuth) return [false, "NOK, No Authorization header in req"]

        //
        const [method, token] = rawAuth?.split(' ')
        if (method != "Bearer") return [false, "NOK, No Bearer auth method on req"] // Requires Bearer auth

        //
        const match = allowAuthorizationOnToken == token
        return [match, match ? "OK, Token match" : "NOK, Token Missmatch"]
    })()

    //
    log.authCheck = {
        authLog,
        authorized
    }

    //
    return !authorized && !originAllowed(origin, log)
        ? (() => {
            //
            logCORS(log, "Forbidden")

            //
            return forbidden()
        })()
        : (async () => {
            //
            logCORS(log, "OK")

            //
            const doc = await getDocument(params)

            //
            return new Response(doc, { 
                headers: basicHeaders({ whitelistedOrigin: isCORSRequest ? origin : undefined})
            })  
        })()
    
}

//
export const OPTIONS: APIRoute = async ({ request: { headers } }) => {
    const origin = getOrigin(headers) ?? '';

    //
    if (originAllowed(origin)) {
        return new Response(null, {
            headers: basicHeaders({ whitelistedOrigin: origin }),
        });
    }

    //
    return forbidden();
}
