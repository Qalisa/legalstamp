export const TAG__LATEST = "latest"

export const formatStubs = /** @type {const} */ ({
  dynamic: 'get/dynamic',
  static: 'get/static'
})

export const availableFormatsConfig = /** @type {const} */ ({
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
})

export const defaultDocFormatConfig = /** @type {const} */ availableFormatsConfig.enhanced
