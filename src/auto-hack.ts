import type { BitBurner as NS, Host } from 'Bitburner';
import { config } from 'import.js';

const getHackScript = () => `/${config.folder}/hack.js`;

/* Searches for servers that are hackable,
 * cracks them if you don't have root access,
 * installs a hack script, and instructs them to
 * HACK THEMSELVES
 */ 
export const main = async function (ns: NS) {
    ns.disableLog('ALL');

    while (true) {
        findServer({ ns, targetServer: 'home', processFn: ({ ns, server }) => !server.includes(config.serverPrefix) ? hackServer({ ns, server }) : null });
        await ns.sleep(1000 * 60);
    }
}

type FindServerProcessFn = (args: { ns: NS, server: Host }) => void;
const findServer = ({ ns, previousServer, targetServer, processFn }: { ns: NS, targetServer: Host, previousServer?: Host, processFn: FindServerProcessFn }) => {
    ns.scan(targetServer, true)
        .filter((server) => server !== (previousServer || targetServer))
        .forEach((server) => {
            processFn({ ns, server });
            findServer({ ns, previousServer: targetServer, targetServer: server, processFn });
        });
}

const hackServer: FindServerProcessFn = ({ ns, server }) => {
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

const crackServer = (ns: NS, server: Host): boolean => {
    if (ns.hasRootAccess(server)) {
        return true;
    }

    let openPorts = 0;
    if (ns.fileExists('BruteSSH.exe')) {
        ns.brutessh(server);
        openPorts++;
    }
    if (ns.fileExists('FTPCrack.exe')) {
        ns.ftpcrack(server);
        openPorts++;
    }
    if (ns.fileExists('relaySMTP.exe')) {
        ns.relaysmtp(server);
        openPorts++;
    }
    if (ns.fileExists('HTTPWorm.exe')) {
        ns.httpworm(server);
        openPorts++;
    }
    if (ns.fileExists('SQLInject.exe')) {
        ns.sqlinject(server);
        openPorts++;
    }

    if (ns.getServerNumPortsRequired(server) > openPorts) {
        return false;
    }

    ns.nuke(server);

    return true;
}
