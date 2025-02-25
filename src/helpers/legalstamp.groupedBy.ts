import { getCollection, } from 'astro:content';
import { groupBySuccessive } from 'helpers/groupBySuccessive'

const allDocs = await getCollection('legalstamped');
const rich = allDocs.map(e => {
  const [documentType, productOrOrganization, lang, tag] = e.id.split("/")
  return {
    ...e,
    meta: {
      documentType,
      productOrOrganization,
      lang,
      tag
    }
  }
})

const groupings = {
    docFirst: ['meta.documentType', 'meta.productOrOrganization', 'meta.lang'],
    langFirst: ['meta.lang', 'meta.productOrOrganization', 'meta.documentType'],
    productOrOrgFirst: ['meta.productOrOrganization', 'meta.documentType', 'meta.lang']
}


export const docFirst = groupBySuccessive(rich, groupings.docFirst)
export const langFirst = groupBySuccessive(rich, groupings.langFirst)
export const productOrOrgFirst = groupBySuccessive(rich, groupings.productOrOrgFirst)
