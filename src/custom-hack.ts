import type { BitBurner as NS, Host } from 'Bitburner';

export async function main(ns: NS) {
    const { server, hackThreads, stock, serverSecurityThreshold, serverMoneyThreshold } = ns.flags<{
        server: Host,
        hackThreads: number;
        stock: boolean;
        serverSecurityThreshold: number;
        serverMoneyThreshold: number;
    }>([
        ['server', ''], 
        ['hackThreads', 0], 
        ['serverSecurityThreshold', 0], 
        ['serverMoneyThreshold', 0], 
        ['stock', true]
    ]);

    if (!server || !serverMoneyThreshold || !serverSecurityThreshold) {
        ns.tprint('Usage: --server=<> --serverSecurityThreshold=<> --serverMoneyThreshold=<> [--stock] [--hackThreads=<>]');
        return;
    }

    ns.disableLog('getServerSecurityLevel');

    if (serverMoneyThreshold === 0) {
        return;
    }

    while (true) {
        if (ns.getServerSecurityLevel(server) > serverSecurityThreshold) {
            await ns.weaken(server, { stock });
        } else if (ns.getServerMoneyAvailable(server) < serverMoneyThreshold) {
            await ns.grow(server, { stock });
        } else {
            await ns.hack(server, { threads: hackThreads || undefined, stock });
        }
    }
}
