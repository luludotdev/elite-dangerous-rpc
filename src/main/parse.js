const { fixCamelCase } = require('./helpers.js')
const { ships } = require('./constants.js')

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
const currentSystem = data => {
  const events = [...data]
    .filter(x => x.event === 'StartJump' ? x.JumpType === 'Hyperspace' : x.event === 'FSDJump')
    .reverse()

  const starts = events.filter(x => x.event === 'StartJump')
  const [latest] = events

  return latest.event === 'StartJump' ? starts[1] : starts[0]
}

/**
 * Gets current wing size (or returns false)
 * @param {any[]} data Journal Data
 * @returns {number|boolean}
 */
const wingStatus = data => {
  const wingData = [...data]
    .filter(x => ['WingJoin', 'WingAdd', 'WingLeave'].includes(x.event))
    .reverse()

  if (wingData.length === 0) return false

  const first = wingData.find(x => ['WingJoin', 'WingLeave'].includes(x.event))
  if (first.event === 'WingLeave') return false

  let count = 1
  for (const i of wingData) {
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
const dockedStatus = data => {
  const [current] = [...data]
    .filter(x => ['Docked', 'Undocked'].includes(x.event))
    .reverse()

  if (current === undefined) return false
  if (current.event === 'Undocked') return false

  current.StationType = fixCamelCase(current.StationType)
  return current
}

/**
 * Gets if the player owns Horizons
 * @param {any[]} data Journal Data
 * @returns {boolean}
 */
const hasHorizons = data => {
  const [loadGame] = [...data]
    .filter(x => ['LoadGame'].includes(x.event))
    .reverse()

  return loadGame ? loadGame.Horizons : false
}

/**
 * Gets if the player owns Horizons
 * @param {any[]} data Journal Data
 * @returns {('flying'|'touchdown'|'srv'|'fighter')}
 */
const touchdownStatus = data => {
  const events = ['Docked', 'Undocked', 'Touchdown', 'Liftoff', 'LaunchSRV', 'DockSRV', 'LaunchFighter', 'DockFighter']

  const [latest] = [...data]
    .filter(x => events.includes(x.event))
    .filter(x => x.PlayerControlled === undefined ? true : x.PlayerControlled === true)
    .reverse()

  if (latest.event === 'Docked') return 'touchdown'
  if (latest.event === 'Undocked') return 'flying'
  if (latest.event === 'Touchdown') return 'touchdown'
  if (latest.event === 'Liftoff') return 'flying'
  if (latest.event === 'LaunchSRV') return 'srv'
  if (latest.event === 'DockSRV') return 'touchdown'
  if (latest.event === 'LaunchFighter') return 'fighter'
  if (latest.event === 'DockFighter') return 'flying'

  return 'flying'
}

/**
 * Gets the current Ship
 * @param {any[]} data Journal Data
 * @returns {string}
 */
const currentShip = data => {
  const events = ['Loadout', 'DockFighter']

  const found = [...data]
    .filter(x => events.includes(x.event))
    .filter(x => x.PlayerControlled === undefined ? true : x.PlayerControlled === true)
    .reverse()

  const fighters = ships.filter(x => x.fighter === true)
  const [loadout] = found[0].event !== 'DockFighter' ?
    found.filter(x => x.event === 'Loadout') :
    found.filter(x => x.event === 'Loadout')
      .filter(ship => !fighters.map(x => x.id).includes(ship.Ship.toLowerCase()))

  const ship = ships.find(x => x.id === loadout.Ship.toLowerCase())
  if (ship === undefined) return 'Flying Solo'

  return ship.name
}

module.exports = {
  currentSystem,
  wingStatus,
  dockedStatus,
  hasHorizons,
  touchdownStatus,
  currentShip,
}
