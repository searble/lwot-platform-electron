'use strict';

const fs = require('fs');
const path = require('path');

let electron = require("electron");

let {app, ipcMain} = electron;

const APP_ROOT = path.resolve(__dirname);
const CTRL_ROOT = path.resolve(APP_ROOT, 'controller');
const CONFIG_ROOT = path.resolve(CTRL_ROOT, 'config.json');
const EVENT_ROOT = path.resolve(CTRL_ROOT, 'event');
const IPC_ROOT = path.resolve(CTRL_ROOT, 'ipc');

electron.mainWindow = null;
electron.APP_ROOT = path.resolve(__dirname);
electron.config = fs.existsSync(CONFIG_ROOT) ? JSON.parse(fs.readFileSync(CONFIG_ROOT, 'utf-8')) : {};

const DEV = electron.config.dev;

// run
let before = ()=> new Promise((next)=> {
    require('./controller/before')(electron, process).then(next);
});

let eventBinder = ()=> new Promise((next)=> {
    if (DEV) console.log('bind app event ...');
    let events = fs.readdirSync(EVENT_ROOT);
    for (let i = 0; i < events.length; i++) {
        if (path.extname(events[i]) === '.js') {
            let eventName = path.basename(events[i], path.extname(events[i]));
            let eventModule = path.resolve(EVENT_ROOT, events[i]);
            try {
                app.on(eventName, require(eventModule)(electron, process));
            } catch (e) {
                if (DEV) console.log(eventName, e);
            }
        }
    }

    next();
});

let ipcBinder = ()=> new Promise((next)=> {
    if (DEV) console.log('bind ipcMain event ...');
    let ipc = fs.readdirSync(IPC_ROOT);
    for (let i = 0; i < ipc.length; i++) {
        if (path.extname(ipc[i]) === '.js') {
            let ipcName = path.basename(ipc[i], path.extname(ipc[i]));
            let ipcModule = path.resolve(IPC_ROOT, ipc[i]);
            try {
                ipcMain.on(ipcName, require(ipcModule)(electron, process));
            } catch (e) {
                if (DEV) console.log(eventName, e);
            }
        }
    }

    next();
});

before()
    .then(()=> eventBinder())
    .then(()=> ipcBinder())
    .then(()=> {
        if (DEV) console.log('App Launched');
    });