# LWOT Platform - Electron

## Usage

### Install Dependencies

```bash
brew install mono wine                   #Mac
sudo npm install -g electron-prebuilt
```

### Install Platform

```bash
lwot install https://github.com/searble/lwot-platform-electron
lwot install platform electron #not working yet
```

### Deploy Installer

- you can get the installation file at `./plugins/platform/electron/deploy/install-*` after processing deploy.

```bash
lwot deploy electron [platform] [architecture]
lwot deploy electron            # your platform (win32, darwin) & x64
lwot deploy electron darwin     # only support x64 architecture
lwot deploy electron win32 x32
```

### Reload IPC

- not restart electron, you can reload ipc
 
```javascript
electron.ipcBinder().then(()=> {
    console.log('reloaded');
});
```

## Development Guide

in your folder `controller/electron/`.

- config
- before
    - process before app load
    - edit on `controller/electron/before.js`
    
        ```javascript
          module.exports = (electron, proc)=> new Promise((next)=> {
              // you can add middleware like this
              // this module can be used on app event or ipc event
              electron.mysql = mysql;
              electron.windows = {};
      
              // in some condition, you can quit app
              if(condition) electron.app.quit();
          
              next();
          });
        ```
        
- event/
    - bind to app event
    - refer event name on this page, http://electron.atom.io/docs/api/app
    - edit on `controller/electron/event/[event-name].js`
        
        ```javascript
          module.exports = (electron, appProcess)=> ()=> {
              let {BrowserWindow} = electron;
          
              let mainWindow = electron.mainWindow;
              let APP_ROOT = electron.APP_ROOT;
          
              mainWindow = new BrowserWindow({width: 1440, height: 860});
              mainWindow.loadURL("file://" + APP_ROOT + "/www/index.html");
              mainWindow.webContents.openDevTools();
              mainWindow.on("closed", function () {
                  mainWindow = null;
              });
          };    
        ```
        
- ipc/
    - bind to ipcMain event
    - refer event name on this page, http://electron.atom.io/docs/api/ipc-main
    - edit on `controller/electron/ipc/[event-name].js`
    
        ```javascript
          module.exports = (electron, appProcess)=> (event, arg1, arg2)=> {
              event.sender.send('pong', `pong ${arg1} ${arg2}`);
          };
        ```
        
        