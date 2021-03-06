export async function main(ns) {
    const { server, hackThreads, stock, serverSecurityThreshold, serverMoneyThreshold } = ns.flags([
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
    while (true) {
        if (ns.getServerSecurityLevel(server) > serverSecurityThreshold) {
            await ns.weaken(server, { stock });
        }
        else if (ns.getServerMoneyAvailable(server) < serverMoneyThreshold) {
            await ns.grow(server, { stock });
        }
        else {
            await ns.hack(server, { threads: hackThreads || undefined, stock });
        }
    }
}
