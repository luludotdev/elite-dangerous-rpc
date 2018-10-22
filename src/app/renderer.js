/* eslint-env browser */

const { ipcRenderer } = require('electron')

const getLogo = horizons => horizons ?
  'https://cdn.discordapp.com/app-assets/503220133758631954/503280110783299588.png' :
  'https://cdn.discordapp.com/app-assets/503220133758631954/503274245820776448.png'

const logoDOM = document.getElementById('logo')
const systemDOM = document.getElementById('system')
const stateDOM = document.getElementById('state')

ipcRenderer.on('details', (_, details) => {
  console.log(details) // eslint-disable-line

  const logo = getLogo(details.largeImageKey === 'ed_logo_h')
  const system = details.details

  const state = details.partyId === undefined ?
    details.state :
    `${details.state} (${details.partySize} of ${details.partyMax})`

  logoDOM.src = logo
  systemDOM.innerHTML = system
  stateDOM.innerHTML = state
})
