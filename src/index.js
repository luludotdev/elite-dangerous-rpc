const path = require('path')
const chokidar = require('chokidar')
const fs = require('fs-extra')
const DiscordRPC = require('discord-rpc')

const { USERPROFILE } = process.env
const JOURNAL_PATH = path.join(USERPROFILE, '\\Saved Games\\Frontier Developments\\Elite Dangerous')

const CLIENT_ID = '389390500735483906'
DiscordRPC.register(CLIENT_ID)
const rpc = new DiscordRPC.Client({ transport: 'ipc' })

rpc.on('ready', () => {
  let watcher = chokidar.watch(JOURNAL_PATH)
  watcher.on('change', async () => {
    let data = await getLatestFile(JOURNAL_PATH)
    let currentSystem = getCurrentSystem(data)

    rpc.setActivity({
      details: currentSystem.StarSystem,
      state: 'Flying Solo',
      largeImageKey: 'ed_logo',
      largeImageText: 'Elite Dangerous',
      smallImageKey: `star_${currentSystem.StarClass.toLowerCase()}`,
      smallImageText: `Star Class: ${currentSystem.StarClass}`,
      instance: false,
    })
  })
})

rpc.login(CLIENT_ID)
  .catch(console.error)

const getLatestFile = async dirPath => {
  let files = await fs.readdir(dirPath)
  files = files.filter(x => x.match(/Journal\.[0-9]+\.[0-9]+\.log/))
  let filePath = path.join(dirPath, files.pop())
  let file = await fs.readFile(filePath, 'utf8')
  return file.split('\n')
    .filter(x => x.length > 0)
    .map(JSON.parse)
}

/**
 * @typedef {Object} SystemJump
 * @property {string} event
 * @property {string} JumpType
 * @property {string} StarClass
 * @property {string} StarSystem
 * @property {string} timestamp
 */

/**
 * Read last jump from Journal Files
 * @param {any[]} data Journal Data
 * @returns {SystemJump}
 */
const getCurrentSystem = data => {
  let jumps = data.filter(x => x.event === 'StartJump' && x.JumpType === 'Hyperspace')
  let lastJump = [...jumps].pop()
  return lastJump
}
