//
const isDomainRootScopedPrefix = "*."
const isDomainRootScoped = (arg) => arg.startsWith(isDomainRootScopedPrefix)

//
export const domainsWhitelist = (() => {
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