
import { getNestedValue } from 'helpers/groupBySuccessive';
import { all, availableFormatsKeys, type Grouping, type GroupingItem, type Meta, type Nullable } from 'helpers/legalstamp.groupedBy';

//
function getNestedValueFrom(obj: any, keyPaths: GroupingItem[], containFilter: GroupingItem) : string | null {
    const foundKeyPath = keyPaths.find(e => e == containFilter)
    return foundKeyPath ? getNestedValue(obj, foundKeyPath) : null
}

type Expected = { slug: string } & Nullable<Meta>

// TODO: remove duplcate paths ??
export function generateStaticPaths(grouping: Grouping, options?: {onlyTags: boolean}) {
    let out: Expected[] = []

    //
    if (options?.onlyTags != true) {
        for (let i = 0; i < grouping.length; i++) {
            const taking = grouping.slice(0, i + 1)
            out = out.concat(
                all.map(e => {
                    return {
                        slug: taking.map(i => getNestedValue(e, i)).join('/'),
                        documentType: getNestedValueFrom(e, taking, 'meta.documentType'),
                        productOrOrganization: getNestedValueFrom(e, taking, 'meta.productOrOrganization'),
                        lang: getNestedValueFrom(e, taking, 'meta.lang'),
                        tag: null,
                        format: null
                    } 
                })
            )
        }
    }

    // tags
    out = out.concat(
        all.flatMap(e => {
            return availableFormatsKeys.map(({ format }) => {
                //
                const withMetaSlug = [...grouping, 'meta.tag'].map(i => getNestedValue(e, i)).join('/')

                //
                return {
                    slug: withMetaSlug,
                    documentType: getNestedValue(e, 'meta.documentType'),
                    productOrOrganization: getNestedValue(e, 'meta.productOrOrganization'),
                    lang: getNestedValue(e, 'meta.lang'),
                    tag: getNestedValue(e, 'meta.tag'),
                    format
                }
            })
        })
    )

    // format
    out = out.concat(
        all.flatMap(e => {
            return availableFormatsKeys.map(({ format }) => {
                //
                const withMetaSlug = [...grouping, 'meta.tag'].map(i => getNestedValue(e, i)).join('/')

                //
                return {
                    slug: [withMetaSlug, format].join('/'),
                    documentType: getNestedValue(e, 'meta.documentType'),
                    productOrOrganization: getNestedValue(e, 'meta.productOrOrganization'),
                    lang: getNestedValue(e, 'meta.lang'),
                    tag: getNestedValue(e, 'meta.tag'),
                    format
                }
            })
        })
    )

  return out.map(({ slug, ...props }) => {
    return {
      params: { slug },
      props
    };
  });
}
