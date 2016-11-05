'use strict';

module.exports = (()=> {
    let spawn = require("child_process").spawn;
    // if windows
    if (process.platform == 'win32')
        spawn = require('cross-spawn');

    const fs = require('fs');
    const fsext = require('fs-extra');
    const path = require('path');

    const PLUGIN_ROOT = path.resolve(__dirname);
    const DEPLOY_ROOT = path.resolve(PLUGIN_ROOT, 'deploy');
    const RUN_PATH = path.resolve(PLUGIN_ROOT, 'app');
    const CTRL_PATH = path.resolve(RUN_PATH, 'controller');
    const CONFIG_PATH = path.resolve(CTRL_PATH, 'config.json');

    if (!fs.existsSync(DEPLOY_ROOT)) fsext.mkdirsSync(DEPLOY_ROOT);

    let config = {};
    if (fs.existsSync(CONFIG_PATH)) config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    config.deploy = config.deploy ? config.deploy : {};
    config.deploy.name = config.deploy.name ? config.deploy.name : 'lwot';
    config.deploy.icon = config.deploy.icon ? config.deploy.icon : {};

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

    let deploy = {};

    deploy.package = (argv)=> new Promise((next)=> {
        let platform = argv[0];
        let arch = argv[1];

        if (platform == 'win32' && arch != 'x32' && arch != 'x64') {
            arch = 'x64';
        } else if (platform == 'darwin') {
            arch = 'x64';
        } else {
            platform = process.platform;
            arch = 'x64'
        }

        const PACAKGE_PATH = path.resolve(DEPLOY_ROOT, `${config.deploy.name}-${platform}-${arch}`);
        if (fs.existsSync(PACAKGE_PATH)) fsext.removeSync(PACAKGE_PATH);

        let packageOption = {
            platform: platform,
            arch: arch,
            out: DEPLOY_ROOT,
            dir: RUN_PATH,
            asar: config.deploy.asar !== false,
            prune: config.deploy.prune !== false,
            name: config.deploy.name,
            'app-copyright': config.deploy['app-copyright'] ? config.deploy['app-copyright'] : config.deploy.name,
            'app-version': config.deploy.version ? config.deploy.version : '0.0.0'
        };

        if (config.deploy['version-string']) packageOption['version-string'] = config.deploy['version-string'];
        if (config.deploy.icon[platform]) packageOption.icon = config.deploy.icon;

        var packager = require('electron-packager');
        packager(packageOption, ()=> {
            next();
        });
    });

    deploy.installer = (argv)=> new Promise((next)=> {
        let platform = argv[0];
        let arch = argv[1];

        if (platform == 'win32' && arch != 'x32' && arch != 'x64') {
            arch = 'x64';
        } else if (platform == 'darwin') {
            arch = 'x64';
        } else {
            platform = process.platform;
            arch = 'x64'
        }

        const PACAKGE_PATH = path.resolve(DEPLOY_ROOT, `${config.deploy.name}-${platform}-${arch}`);
        const INSTALLER_PATH = path.resolve(DEPLOY_ROOT, `installer-${platform}-${arch}`);

        if (fs.existsSync(PACAKGE_PATH)) fsext.removeSync(PACAKGE_PATH);
        if (fs.existsSync(INSTALLER_PATH)) fsext.removeSync(INSTALLER_PATH);

        if (platform == 'win32') {
            let installerOption = {
                appDirectory: PACAKGE_PATH,
                outputDirectory: INSTALLER_PATH,
                authors: config.deploy.authors ? config.deploy.authors : config.deploy.name,
                owners: config.deploy.owners ? config.deploy.owners : config.deploy.name,
                description: config.deploy.description ? config.deploy.description : '',
                title: config.deploy.title ? config.deploy.title : config.deploy.name,
                version: config.deploy.version ? config.deploy.version : '0.0.0',
                exe: `${config.deploy.name}.exe`,
                setupExe: `${config.deploy.name}.exe`,
                noMsi: config.deploy.noMsi !== false
            };

            if (config.deploy.iconUrl) installerOption.iconUrl = config.deploy.iconUrl;
            if (config.deploy.loadingGif) installerOption.loadingGif = config.deploy.loadingGif;

            require('electron-winstaller').createWindowsInstaller(installerOption).then(next);
        } else if (platform == 'darwin') {
            var createDMG = require('electron-installer-dmg');
            let installerOption = {
                appPath: PACAKGE_PATH,
                name: config.deploy.name,
                out: INSTALLER_PATH
            };

            createDMG(installerOption, next);
        }
    });

    let plugin = {};

    plugin.compile = require('./compiler');

    plugin.run = ()=> new Promise((callback)=> {
        terminal('electron', [RUN_PATH]).then(callback);
    });

    plugin.deploy = (argv)=> new Promise((callback)=> {
        if (deploy[argv[0]]) return deploy[argv[0]](argv.splice(1, 2)).then(callback);

        deploy.package(argv)
            .then(()=> deploy.installer(argv))
            .then(callback);
    });

    return plugin;
})();