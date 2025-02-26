import { getCollection } from 'astro:content';
import { groupBySuccessive } from 'helpers/groupBySuccessive'

//
type DocFormat = 'html' | 'markdown'
export const availableFormats = [
    {format: 'html'}, 
    {format: 'markdown'}
] as const satisfies Array<{format: DocFormat}> 

export type Meta = {
  documentType: string
  productOrOrganization: string
  lang: string
  tag: string
  format: DocFormat
}

export type Nullable<T> = { [K in keyof T]: T[K] | null };

const allDocs = await getCollection('legalstamped');

/** */
export const all = allDocs.flatMap(e => {
  const [documentType, productOrOrganization, lang, tag] = e.id.split("/")
  return availableFormats.map(({ format }) => {
    return {
      ...e,
      meta: {
        documentType,
        productOrOrganization,
        lang,
        tag,
        format
      } satisfies Meta
    }
  })
})

const groupings = {
    docFirst: ['meta.documentType', 'meta.productOrOrganization', 'meta.lang'],
    langFirst: ['meta.lang', 'meta.productOrOrganization', 'meta.documentType'],
    productOrOrgFirst: ['meta.productOrOrganization', 'meta.documentType', 'meta.lang'],
} as const

export type Grouping = (typeof groupings)[keyof typeof groupings];
export type GroupingItem = (typeof groupings)[keyof typeof groupings][number];
export type FilterGroupingItem = GroupingItem | 'meta.format' | 'meta.tag';

export const docFirst = groupBySuccessive(all, groupings.docFirst)
export const langFirst = groupBySuccessive(all, groupings.langFirst)
export const productOrOrgFirst = groupBySuccessive(all, groupings.productOrOrgFirst)
