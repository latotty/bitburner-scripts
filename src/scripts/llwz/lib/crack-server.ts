import type { BitBurner as NS, Host } from 'Bitburner';

export const crackServer = (ns: NS, server: Host): boolean => {
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