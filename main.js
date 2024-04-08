const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

let win

let versionDetails = {
  upToDate: true,
  currentVersion: app.getVersion(),
  newVersion: '',
  newVersionReleaseDate: new Date(),
  changelog: '',
}

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
      sandbox: false
    },
  })

  win.loadFile(path.join(__dirname, 'index.html'))

  win.openDevTools();
}

ipcMain.handle('get-path', (_e, path) => {
  const allowedPaths = ['userData']
  if (allowedPaths.indexOf(path) === -1) {
      throw Error(`Path ${path} is not allowed`)
  }
  return app.getPath(path)
})
ipcMain.handle('get-version-details', (_e) => versionDetails)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
