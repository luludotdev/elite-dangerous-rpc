const { join } = require('path')
const fs = require('fs')
const { promisify } = require('util')
const fse = { readDir: promisify(fs.readdir), readFile: promisify(fs.readFile) }

const getLatestFile = async dirPath => {
  const files = (await fse.readDir(dirPath))
    .filter(x => x.match(/Journal\.[0-9]+\.[0-9]+\.log/))
    .reverse()

  const [pathLatest, pathOld] = files
  const data = await Promise.all([
    fse.readFile(join(dirPath, pathLatest), 'utf8'),
    fse.readFile(join(dirPath, pathOld), 'utf8'),
  ])

  const [old, latest] = data
    .reverse()
    .map(file =>
      file.split('\n')
        .filter(x => x.length > 0)
        .map(JSON.parse)
    )
  return [...old, ...latest]
}

module.exports = { getLatestFile }
