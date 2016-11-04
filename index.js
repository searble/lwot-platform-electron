'use strict';

module.exports = (()=> {
    const fs = require('fs');
    const path = require('path');
    const spawn = require("child_process").spawn;

    const PLUGIN_ROOT = path.resolve(__dirname);
    const RUN_PATH = path.resolve(PLUGIN_ROOT, 'app');

    let terminal = (cmd, args, opts)=> new Promise((callback)=> {
        if (!opts) opts = {};
        const term = spawn(cmd, args, opts);
        term.stdout.pipe(process.stdout);
        term.stderr.pipe(process.stderr);
        process.stdin.pipe(term.stdin);
        term.on('close', () => {
            process.stdin.end();
            callback();
        });
    });

    let plugin = {};

    plugin.compiler = 'electron';

    plugin.run = ()=> new Promise((callback)=> {
        terminal('electron', [RUN_PATH]).then(callback);
    });

    plugin.deploy = ()=> new Promise((callback)=> {

    });

    return plugin;
})();