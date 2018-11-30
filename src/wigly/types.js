/**
 * @typedef {Object} ComponentContext
 */

/**
 * @typedef {Object} VDOMProps
 * @property {*} key
 * @property {Function} oncreate
 * @property {Function} ondestroy
 * @property {Function} ondestroy
 */

/**
 * @typedef {Object} LowerVDOM
 * @property {HTMLElement} element
 * @property {VDOMProps} props
 * @property {Array<LowerVDOM>} children
 */

/**
 * @typedef {Object} UpperVDOM
 * @property {HTMLElement} element
 * @property {VDOMProps} props
 * @property {Array<UpperVDOM>} children
 * @property {HTMLElement} internal
 */

/**
 * @typedef {Object} ComponentSpec
 * @property {string|Function} f
 * @property {Object} props
 * @property {Array<*>} children
 */
