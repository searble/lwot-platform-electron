'use strict';

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