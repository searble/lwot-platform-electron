'use strict';

module.exports = (electron, appProcess)=> ()=> {
    let {app} = electron;
    if (appProcess.platform !== "darwin") {
        app.quit();
    }
};