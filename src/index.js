const path = require('path')
const chokidar = require('chokidar')
const fs = require('fs-extra')

const { USERPROFILE } = process.env
const JOURNAL_PATH = path.join(USERPROFILE, '\\Saved Games\\Frontier Developments\\Elite Dangerous')

let watcher = chokidar.watch(JOURNAL_PATH)
watcher.on('change', async () => {
  let data = await getLatestFile(JOURNAL_PATH)
  console.log(data)
})

const getLatestFile = async dirPath => {
  let files = await fs.readdir(dirPath)
  files = files.filter(x => x.match(/Journal\.[0-9]+\.[0-9]+\.log/))
  let filePath = path.join(dirPath, files.pop())
  let file = await fs.readFile(filePath, 'utf8')
  return file.split('\n')
    .filter(x => x.length > 0)
    .map(JSON.parse)
}
