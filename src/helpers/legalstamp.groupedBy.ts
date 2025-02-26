import { getCollection, } from 'astro:content';
import { groupBySuccessive } from 'helpers/groupBySuccessive'

export type Meta = {
  documentType: string
  productOrOrganization: string
  lang: string
  tag: string
}

export type Nullable<T> = { [K in keyof T]: T[K] | null };

const allDocs = await getCollection('legalstamped');
export const all = allDocs.map(e => {
  const [documentType, productOrOrganization, lang, tag] = e.id.split("/")
  return {
    ...e,
    meta: {
      documentType,
      productOrOrganization,
      lang,
      tag
    } satisfies Meta
  }
})

const groupings = {
    docFirst: ['meta.documentType', 'meta.productOrOrganization', 'meta.lang'],
    langFirst: ['meta.lang', 'meta.productOrOrganization', 'meta.documentType'],
    productOrOrgFirst: ['meta.productOrOrganization', 'meta.documentType', 'meta.lang']
}


export const docFirst = groupBySuccessive(all, groupings.docFirst)
export const langFirst = groupBySuccessive(all, groupings.langFirst)
export const productOrOrgFirst = groupBySuccessive(all, groupings.productOrOrgFirst)
