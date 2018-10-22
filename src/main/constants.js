const path = require('path')

const CLIENT_ID = '503220133758631954'
const JOURNAL_PATH = path.join(
  process.env.USERPROFILE,
  '\\Saved Games\\Frontier Developments\\Elite Dangerous'
)

const ships = [
  { id: 'adder', name: 'Adder' },
  { id: 'anaconda', name: 'Anaconda' },
  { id: 'asp', name: 'Asp Explorer' },
  { id: 'asp_scout', name: 'Asp Scout' },
  { id: 'belugaliner', name: 'Beluga Liner' },
  { id: 'cobramkiii', name: 'Cobra MkIII' },
  { id: 'cobramkiv', name: 'Cobra MkIV' },
  { id: 'diamondbackxl', name: 'Diamondback Explorer' },
  { id: 'diamondback', name: 'Diamondback Scout' },
  { id: 'dolphin', name: 'Dolphin' },
  { id: 'eagle', name: 'Eagle' },
  { id: 'federation_dropship_mkii', name: 'Federal Assault Ship' },
  { id: 'federation_corvette', name: 'Federal Corvette' },
  { id: 'federation_dropship', name: 'Federal Dropship' },
  { id: 'federation_gunship', name: 'Federal Gunship' },
  { id: 'ferdelance', name: 'Fer-de-Lance' },
  { id: 'hauler', name: 'Hauler' },
  { id: 'empire_trader', name: 'Imperial Clipper' },
  { id: 'empire_courier', name: 'Imperial Courier' },
  { id: 'cutter', name: 'Imperial Cutter' },
  { id: 'empire_eagle', name: 'Imperial Eagle' },
  { id: 'orca', name: 'Orca' },
  { id: 'python', name: 'Python' },
  { id: 'sidewinder', name: 'Sidewinder' },
  { id: 'type6', name: 'Type-6 Transporter' },
  { id: 'viper', name: 'Viper MkIII' },
  { id: 'viper_mkiv', name: 'Viper MkIV' },
  { id: 'vulture', name: 'Vulture' },
  { id: 'type9_military', name: 'Type-10 Defender' },
  { id: 'type9', name: 'Type-9 Heavy' },
  { id: 'typex', name: 'Alliance Chieftain' },
  { id: 'independant_trader', name: 'Keelback' },
  { id: 'type7', name: 'Type-7 Transporter' },
  { id: 'typex_2', name: 'Alliance Crusader' },
  { id: 'typex_3', name: 'Alliance Challenger' },
  { id: 'krait_mkii', name: 'Krait MkII' },
  { id: 'empire_fighter', name: 'Imperial Fighter' },
  { id: 'federation_fighter', name: 'F63 Condor' },
  { id: 'independent_fighter', name: 'Taipan' },
  { id: 'gdn_hybrid_fighter_v1', name: 'XG7 Trident', fighter: true },
  { id: 'gdn_hybrid_fighter_v2', name: 'XG8 Javelin', fighter: true },
  { id: 'gdn_hybrid_fighter_v3', name: 'XG9 Lance', fighter: true },
  { id: 'testbuggy', name: 'SRV', srv: true },
]

module.exports = { CLIENT_ID, JOURNAL_PATH, ships }
