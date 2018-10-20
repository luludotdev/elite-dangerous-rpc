const path = require('path')
const chokidar = require('chokidar')
const { Client } = require('discord-rpc')
const uuid = require('uuid/v4')
const { getLatestFile } = require('./file.js')
const { getCurrentSystem, getWingStatus, getDockedStatus, getHorizons, getTouchdownStatus } = require('./parse.js')

const { USERPROFILE } = process.env
const JOURNAL_PATH = path.join(USERPROFILE, '\\Saved Games\\Frontier Developments\\Elite Dangerous')

const CLIENT_ID = '503220133758631954'
const rpc = new Client({ transport: 'ipc' })

rpc.on('ready', () => {
  const watcher = chokidar.watch(JOURNAL_PATH, { usePolling: true })
  watcher.on('change', async () => {
    const data = await getLatestFile(JOURNAL_PATH)

    try {
      const currentSystem = getCurrentSystem(data)
      const wingData = getWingStatus(data)
      const docked = getDockedStatus(data)
      const horizons = getHorizons(data)
      const touchdown = getTouchdownStatus(data)

      let details = {
        details: docked ? `Docked at ${docked.StationName} (${docked.StationType})` : currentSystem.StarSystem,
        state: touchdown === 'srv' ?
          'Piloting an SRV' :
          touchdown === 'touchdown' ?
            'Touched Down' :
            'Flying Solo',

        largeImageKey: horizons ? 'ed_logo_h' : 'ed_logo',
        largeImageText: horizons ? 'Elite Dangerous: Horizons' : 'Elite Dangerous',

        // smallImageKey: `star_${currentSystem.StarClass.toLowerCase()}`,
        // smallImageText: `Star Class: ${currentSystem.StarClass}`,
      }

      // Override state in wing
      if (wingData) {
        details.state = 'In Wing'
        details.partySize = wingData
        details.partyMax = 4
        details.partyId = uuid()
      }

      rpc.setActivity(details)
    } catch (err) {
      console.error(err)
    }
  })
})

rpc.login({ clientId: CLIENT_ID })
  .catch(console.error)
