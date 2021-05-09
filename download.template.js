export async function main(ns) {
    const { rootUrl } = ns.flags([['rootUrl', 'https://raw.githubusercontent.com/latotty/bitburner-scripts/main/']]); 
    const folder = 'scripts';

    const files = [/* FILES */    ];
    
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