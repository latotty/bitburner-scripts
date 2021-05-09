export async function main(ns) {
    const { rootUrl } = ns.flags([['rootUrl', 'https://raw.githubusercontent.com/latotty/bitburner-scripts/main/']]); 
    const folder = 'scripts';

    const files = [
        "buyHacknet.js",
        "dashboard.js",
        "hack.js",
        "llwz/auto-hack.js",
        "llwz/auto-stock.js",
        "llwz/botnet-grow.js",
        "llwz/botnet-hack.js",
        "llwz/botnet-manual.js",
        "llwz/botnet-status.js",
        "llwz/botnet-weaken.js",
        "llwz/custom-hack.js",
        "llwz/lib/botnet.js",
        "llwz/lib/crack-server.js",
        "llwz/lib/walk-server.js",
        "purchaseServers.js",
        "serverStatus.js"
    ];
    
    let filesImported = true;
    for (let file of files) {
        const remoteFileName = `${rootUrl}scripts/${file}?t=${Date.now()}`;
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