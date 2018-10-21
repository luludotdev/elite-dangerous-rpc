const path = require('path')

const CLIENT_ID = '503220133758631954'
const JOURNAL_PATH = path.join(
  process.env.USERPROFILE,
  '\\Saved Games\\Frontier Developments\\Elite Dangerous'
)

module.exports = { CLIENT_ID, JOURNAL_PATH }
