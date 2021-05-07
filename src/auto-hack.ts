import type { BitBurner as NS, Host } from 'Bitburner';
import { config } from 'import.js';
import { crackServer } from './lib/crack-server.js';
import { walkServer, WalkServerProcessFn } from './lib/walk-server.js';

const getHackScript = () => `/${config.folder}/hack.js`;

/* Searches for servers that are hackable,
 * cracks them if you don't have root access,
 * installs a hack script, and instructs them to
 * HACK THEMSELVES
 */ 
export const main = async function (ns: NS) {
    ns.disableLog('ALL');

    while (true) {
        walkServer({ ns, targetServer: 'home', processFn: ({ ns, server }) => !server.includes(config.serverPrefix) ? hackServer({ ns, server }) : null });
        await ns.sleep(1000 * 60);
    }
}

const hackServer: WalkServerProcessFn = ({ ns, server }) => {
    if (!isServerHackable(ns, server)) {
        return;
    }

    const hackScript = getHackScript();
    const runningScripts = ns.ps(server);

    const runningHackScript = runningScripts.filter(s => s.filename === hackScript);
    let scriptRam = ns.getScriptRam(hackScript);
    let serverRam = ns.getServerRam(server)[0];
    let threads = Math.floor(serverRam / scriptRam);

    if (runningHackScript.some(s => s.threads === threads && s.args[0] === server && s.args[1] === threads)) {
        return;
    }

    for (const s of runningHackScript) {
        ns.kill(s.pid);
    }

    ns.scp(hackScript, server);
    if (threads > 0) {
        ns.exec(hackScript, server, threads, server, threads);
    }
}

const isServerHackable = (ns: NS, server: Host): boolean => crackServer(ns, server) && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel();
