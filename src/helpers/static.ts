
import { getNestedValue } from 'helpers/groupBySuccessive';
import { all, ssgDocFormats, type Grouping, type GroupingItem, type Meta, type Nullable } from 'helpers/legalstamp.groupedBy';

//
function getNestedValueFrom(obj: any, keyPaths: GroupingItem[], containFilter: GroupingItem) : string | null {
    const foundKeyPath = keyPaths.find(e => e == containFilter)
    return foundKeyPath ? getNestedValue(obj, foundKeyPath) : null
}

type Expected = { slug: string } & Nullable<Meta>

// TODO: remove duplcate paths ??
export function generateStaticPaths(grouping: Grouping, { onlyTags, squeezeTagParam } = {
    /** If true, will not create paths for intermediary groupings */
    onlyTags: false, 
    /** If true, will remove indexing of tags */
    squeezeTagParam: false
}) {
    const out = new Map<string, Expected>()

    //
    if (onlyTags == false) {
        for (let i = 0; i < grouping.length; i++) {
            const taking = grouping.slice(0, i + 1)
            all.map(e => {
                return {
                    slug: taking.map(i => getNestedValue(e, i)).join('/'),
                    documentType: getNestedValueFrom(e, taking, 'meta.documentType'),
                    productOrOrganization: getNestedValueFrom(e, taking, 'meta.productOrOrganization'),
                    lang: getNestedValueFrom(e, taking, 'meta.lang'),
                    tag: null,
                    format: null
                } 
            }).forEach(e => out.set(e.slug, e))
        }
    }

    // tags
    if (squeezeTagParam == false) {
        all.flatMap(e => {
            return {
                slug: [...grouping, 'meta.tag'].map(i => getNestedValue(e, i)).join('/'),
                documentType: getNestedValue(e, 'meta.documentType'),
                productOrOrganization: getNestedValue(e, 'meta.productOrOrganization'),
                lang: getNestedValue(e, 'meta.lang'),
                tag: getNestedValue(e, 'meta.tag'),
                format: null
            }
        }).forEach(e => out.set(e.slug, e))
    }

    // format
    all.flatMap(e => {
        return ssgDocFormats.map(({ format }) => {
            //
            const withMetaSlug = (squeezeTagParam 
                ? grouping : 
                [...grouping, 'meta.tag'])
            .map(i => getNestedValue(e, i)).join('/')

            //
            return {
                slug: [withMetaSlug, format].join('/'),
                documentType: getNestedValue(e, 'meta.documentType'),
                productOrOrganization: getNestedValue(e, 'meta.productOrOrganization'),
                lang: getNestedValue(e, 'meta.lang'),
                tag: squeezeTagParam ? null : getNestedValue(e, 'meta.tag'),
                format
            }
        })
    }).forEach(e => out.set(e.slug, e))

  //
  //
  //

  return out.values().map(({ slug, ...props }) => {
    return {
      params: { slug },
      props
    };
  }).toArray();
}
