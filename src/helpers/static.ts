
import { getNestedValue } from 'helpers/groupBySuccessive';
import { all, docFormatsMeta, type Grouping, type GroupingItem, type Meta, type Nullable } from 'helpers/legalstamp.groupedBy';

//
function getNestedValueFrom(obj: Record<string, unknown>, keyPaths: GroupingItem[], containFilter: GroupingItem) : string | null {
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
                    documentType: getNestedValueFrom(e, taking, 'meta.documentType'),
                    format: null,
                    lang: getNestedValueFrom(e, taking, 'meta.lang'),
                    productOrOrganization: getNestedValueFrom(e, taking, 'meta.productOrOrganization'),
                    slug: taking.map(i => getNestedValue(e, i)).join('/'),
                    tag: null
                } 
            }).forEach(e => out.set(e.slug, e))
        }
    }

    // tags
    if (squeezeTagParam == false) {
        all.flatMap(e => {
            return {
                documentType: getNestedValue(e, 'meta.documentType'),
                format: null,
                lang: getNestedValue(e, 'meta.lang'),
                productOrOrganization: getNestedValue(e, 'meta.productOrOrganization'),
                slug: [...grouping, 'meta.tag'].map(i => getNestedValue(e, i)).join('/'),
                tag: getNestedValue(e, 'meta.tag')
            }
        }).forEach(e => out.set(e.slug, e))
    }

    // format
    all.flatMap(e => {
        return docFormatsMeta.map(({ format }) => {
            //
            const withMetaSlug = (squeezeTagParam 
                ? grouping : 
                [...grouping, 'meta.tag'])
            .map(i => getNestedValue(e, i)).join('/')

            //
            return {
                documentType: getNestedValue(e, 'meta.documentType'),
                format,
                lang: getNestedValue(e, 'meta.lang'),
                productOrOrganization: getNestedValue(e, 'meta.productOrOrganization'),
                slug: [withMetaSlug, format].join('/'),
                tag: squeezeTagParam ? null : getNestedValue(e, 'meta.tag')
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
