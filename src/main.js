const { format } = require('url')
const { join } = require('path')
const { BrowserWindow, Menu, app, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const isDev = require('electron-is-dev')
const { Client } = require('discord-rpc')
const { Watcher } = require('./main/watcher.js')
const { CLIENT_ID: clientId } = require('./main/constants.js')

/**
 * @type {BrowserWindow}
 */
let win
const rpc = new Client({ transport: 'ipc' })

let rpcReady = false
rpc.on('ready', () => { rpcReady = true })

const setRPC = details => {
  if (!rpcReady) return undefined
  else rpc.setActivity(details)
}

app.on('ready', async () => {
  if (!isDev) autoUpdater.checkForUpdates()

  win = new BrowserWindow({
    width: 500,
    height: isDev ? 370 : 350,
    resizable: false,
    maximizable: false,
    show: false,
  })

  try {
    await rpc.login({ clientId })
  } catch (err) {
    dialog.showErrorBox('Discord RPC', 'Could not connect to the Discord Client.')
    return app.quit()
  }

  win.setTitle(`Elite Dangerous Rich Presence // v${require('../package.json').version}`)
  win.loadURL(format({
    protocol: 'file',
    slashes: true,
    pathname: join(__dirname, 'app', 'index.html'),
  }))

  const menu = !isDev ? null : new Menu.buildFromTemplate([ // eslint-disable-line
    {
      label: 'Dev',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
      ],
    },
  ])

  win.setMenu(menu)
  win.show()

  const watcher = new Watcher()
  watcher.on('details', details => {
    setRPC(details)
    win.webContents.send('details', details)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', async () => {
  if (rpcReady) await rpc.destroy()
})

autoUpdater.on('download-progress', percent => {
  win.setProgressBar(percent.percent, { mode: 'normal' })
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    buttons: [],
    title: 'Updater',
    message: 'A newer version has been downloaded.\n\nClick OK to install the update.\nThe program will restart with the update applied.',
  })

  autoUpdater.quitAndInstall(true, true)
})
