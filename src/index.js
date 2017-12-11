const path = require('path')
const chokidar = require('chokidar')
const fs = require('fs-extra')
const DiscordRPC = require('discord-rpc')
const uuid = require('uuid/v4')

const { USERPROFILE } = process.env
const JOURNAL_PATH = path.join(USERPROFILE, '\\Saved Games\\Frontier Developments\\Elite Dangerous')

const CLIENT_ID = '389390500735483906'
DiscordRPC.register(CLIENT_ID)
const rpc = new DiscordRPC.Client({ transport: 'ipc' })

rpc.on('ready', () => {
  let watcher = chokidar.watch(JOURNAL_PATH, {
    usePolling: true,
  })
  watcher.on('change', async () => {
    let data = await getLatestFile(JOURNAL_PATH)

    try {
      let currentSystem = getCurrentSystem(data)
      let wingData = getWingStatus(data)
      let docked = getDockedStatus(data)

      let details = {
        details: currentSystem.StarSystem,
        largeImageKey: 'ed_logo',
        largeImageText: 'Elite Dangerous',
        smallImageKey: `star_${currentSystem.StarClass.toLowerCase()}`,
        smallImageText: `Star Class: ${currentSystem.StarClass}`,
        instance: false,
      }

      if (wingData) {
        details.state = 'In Wing'
        details.partySize = wingData
        details.partyMax = 4
        details.partyId = uuid()
      } else {
        details.state = 'Flying Solo'
      }

      if (docked) details.details = `Docked at ${docked.StationName} (${docked.StationType})`

      rpc.setActivity(details)
    } catch (err) {
      console.error('No Data, perform a jump!')
    }
  })
})

rpc.login(CLIENT_ID)
  .catch(console.error)

const getLatestFile = async dirPath => {
  let files = await fs.readdir(dirPath)
  files = files
    .filter(x => x.match(/Journal\.[0-9]+\.[0-9]+\.log/))
    .reverse()

  let [pathLatest, pathOld] = files
  let data = await Promise.all([
    fs.readFile(path.join(dirPath, pathLatest), 'utf8'),
    fs.readFile(path.join(dirPath, pathOld), 'utf8'),
  ])
  data = data
    .reverse()
    .map(file => file.split('\n')
      .filter(x => x.length > 0)
      .map(JSON.parse))
  return [...data[0], ...data[1]]
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

/**
 * Gets current wing size (or returns false)
 * @param {any[]} data Journal Data
 * @returns {number|boolean}
 */
const getWingStatus = data => {
  let wingData = data
    .filter(x => ['WingJoin', 'WingAdd', 'WingLeave'].includes(x.event))
    .reverse()
  if (wingData.length === 0) return false

  let first = wingData.find(x => ['WingJoin', 'WingLeave'].includes(x.event))
  if (first.event === 'WingLeave') return false

  let count = 1
  for (let i of wingData) {
    if (i.event === 'WingAdd') count++
    else if (i.event === 'WingJoin') return count
  }
}

/**
 * @typedef {Object} DockedEvent
 * @property {string} event
 * @property {number} DistFromStarLS
 * @property {string} StarSystem
 * @property {string} StationName
 * @property {string[]} StationServices
 * @property {string} StationType
 * @property {string} timestamp
 */

/**
 * Gets if ship is docked or not
 * @param {any[]} data Journal Data
 * @returns {DockedEvent|boolean}
 */
const getDockedStatus = data => {
  let dockedData = data
    .filter(x => ['Docked', 'Undocked'].includes(x.event))
    .reverse()

  let current = dockedData[0]
  if (current.event === 'Undocked') return false
  current.StationType = fixCamelCase(current.StationType)
  return current
}

/**
 * @param {string} str Input String
 * @returns {string}
 */
const fixCamelCase = str => str.replace(/^[a-z]|[A-Z]/g, (v, i) => i === 0 ? v.toUpperCase() : ` ${v}`)
