const uuid = require('uuid/v4')
const chokidar = require('chokidar')
const { EventEmitter } = require('events')
const { JOURNAL_PATH } = require('./constants.js')
const { getLatestFile } = require('./file.js')
const { getCurrentSystem, getWingStatus, getDockedStatus, getHorizons, getTouchdownStatus } = require('./parse.js')

class Watcher extends EventEmitter {
  constructor () {
    super()

    this._watcher = chokidar.watch(JOURNAL_PATH, { usePolling: true })

    this._watcher.on('change', async () => {
      const data = await getLatestFile(JOURNAL_PATH)

      try {
        const currentSystem = getCurrentSystem(data)
        const wingData = getWingStatus(data)
        const docked = getDockedStatus(data)
        const horizons = getHorizons(data)
        const touchdown = getTouchdownStatus(data)

        let details = {
          details: docked ? `Docked at ${docked.StationName} (${docked.StationType})` : currentSystem.StarSystem,
          state: touchdown === 'fighter' ?
            'In Fighter' :
            touchdown === 'srv' ?
              'In SRV' :
              touchdown === 'touchdown' ?
                'Touched Down' :
                'Flying Solo',

          largeImageKey: horizons ? 'ed_logo_h' : 'ed_logo',
          largeImageText: horizons ? 'Elite Dangerous: Horizons' : 'Elite Dangerous',

          // Broken, might revisit
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

        this.emit('details', details)
      } catch (err) {
        console.error(err)
      }
    })
  }
}

module.exports = { Watcher }
