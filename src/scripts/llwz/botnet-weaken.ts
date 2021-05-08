import type { BitBurner as NS, Host } from 'Bitburner';

export async function main(ns: NS) {
    const { server, weakenTime, cycleTime, stock } = ns.flags<{
        server: Host,
        weakenTime: number;
        cycleTime: number;
        gapTime: number;
        stock: boolean;
    }>([
        ['server', ''],
        ['weakenTime', 0],
        ['cycleTime', 0],
        ['gapTime', 0],
        ['stock', true]
    ]);

    if (!server || !weakenTime || !cycleTime) {
        ns.tprint('Usage: --server=<> --cycleTime=<> --weakenTime=<> [--stock]');
        return;
    }

    while (true) {
        await ns.sleep(cycleTime - weakenTime);
        ns.print(['start', server]);
        await ns.weaken(server, { stock });
        ns.print(['done', server]);
    }
}
