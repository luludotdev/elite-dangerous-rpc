/* eslint no-multi-spaces: off  */
const uuid = require('uuid/v4')
const chokidar = require('chokidar')
const { EventEmitter } = require('events')
const { JOURNAL_PATH } = require('./constants.js')
const { getLatestFile } = require('./file.js')
const parse = require('./parse.js')

class Watcher extends EventEmitter {
  constructor () {
    super()

    this._watcher = chokidar.watch(JOURNAL_PATH, { usePolling: true })

    this._watcher.on('change', async () => {
      const data = await getLatestFile(JOURNAL_PATH)

      try {
        const currentSystem = parse.currentSystem(data)
        const wingData      = parse.wingStatus(data)
        const docked        = parse.dockedStatus(data)
        const horizons      = parse.hasHorizons(data)
        const touchdown     = parse.touchdownStatus(data)
        const ship          = parse.currentShip(data)

        let details = {
          details: docked ? `Docked at ${docked.StationName} (${docked.StationType})` : currentSystem.StarSystem,
          state: touchdown === 'srv' ?
            'In SRV' :
            touchdown === 'touchdown' ?
              'Touched Down' :
              ship,

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
