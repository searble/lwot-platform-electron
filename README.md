# LWOT Platform - Electron

## Install

### Install Dependencies

```bash
brew install mono wine                   #Mac
sudo npm install -g electron-prebuilt
lwot install https://github.com/searble/lwot-compiler-electron
```

### Install Platform

```bash
lwot install https://github.com/searble/lwot-platform-electron
lwot install platform electron #not working yet
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
        
        