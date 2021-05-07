import { config } from 'import.js';

export async function main(ns) {
    const folder = config.folder;
    const urlPrefix = config.rootUrl;

    const files = [
        "auto-hack.js",
        "auto-stock.js",
        "autoRemoteHack.js",
        "botnet-manual.js",
        "botnet-worker.js",
        "buyHacknet.js",
        "custom-hack.js",
        "dashboard.js",
        "hack.js",
        "hax.js",
        "minGrow.js",
        "minHack.js",
        "minWeak.js",
        "purchaseServers.js",
        "remoteHack.js",
        "serverStatus.js"
    ];
    
    let filesImported = true;
    for (let file of files) {
        const remoteFileName = `${urlPrefix}scripts/${file}`;
        const result = await ns.wget(remoteFileName, `/${folder}/${file}`);
        filesImported = filesImported && result;
        ns.tprint(`File: ${file}: ${result ? '✔️' : '❌'}`);
    }

    ns.tprint('='.repeat(20));
    
    if (filesImported) {
        ns.tprint('Hey! Thank you for downloading the BitBurner Scripts.');
        ns.tprint(`You've installed these in the ${folder} directory.`);
        ns.tprint(`A good place to start is running \`run /${folder}/hax.js\``);
    } else {
        ns.tprint('You had some issues downloading files, please reach out to the repo maintainer or check your config.');
    }
}