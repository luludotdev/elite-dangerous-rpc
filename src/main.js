const { format } = require('url')
const { join } = require('path')
const { BrowserWindow, Menu, app, dialog } = require('electron')
const isDev = require('electron-is-dev')
const { Client } = require('discord-rpc')
const { Watcher } = require('./main/watcher.js')
const { CLIENT_ID: clientId } = require('./main/constants.js')

const rpc = new Client({ transport: 'ipc' })

let rpcReady = false
rpc.on('ready', () => { rpcReady = true })

const setRPC = details => {
  if (!rpcReady) return undefined
  else rpc.setActivity(details)
}

app.on('ready', async () => {
  const win = new BrowserWindow({
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

  win.setTitle('Elite Dangerous Rich Presence')
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
