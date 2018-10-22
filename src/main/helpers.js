/**
 * @param {string} str Input String
 * @returns {string}
 */
const fixCamelCase = str => str.replace(/^[a-z]|[A-Z]/g, (v, i) => i === 0 ? v.toUpperCase() : ` ${v}`)

module.exports = { fixCamelCase }
