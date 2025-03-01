import { getCollection } from 'astro:content';
import { groupBySuccessive } from 'helpers/groupBySuccessive'

//
//
//

export const TAG__LATEST = "latest" as const

export const formatStubs = {
  dynamic: 'get/dynamic',
  static: 'get/static'
} as const

//
export const availableFormatsConfig = {
  enhanced: {
    name: 'enhanced',
  },
  html: {
    name: 'html',
  },
  markdown: {
    /** would only work on SSR */
    contentType: "text/markdown; charset=UTF-8",
    name: 'markdown',
  }
} as const

export const defaultDocFormatConfig = availableFormatsConfig.enhanced

type DocFormat = keyof typeof availableFormatsConfig

//
export const docFormatsMeta = [
    {format: availableFormatsConfig.html.name}, 
    // {format: availableFormatsConfig.markdown.name},
    {format: availableFormatsConfig.enhanced.name}
] as const satisfies Array<{format: DocFormat}>

//
//
//

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
  return docFormatsMeta.map(({ format }) => {
    return {
      ...e,
      meta: {
        documentType,
        format,
        lang,
        productOrOrganization,
        tag
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
