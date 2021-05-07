import type { BitBurner as NS, Host } from 'Bitburner';

export async function main(ns: NS) {
    const { server, weakenTime, windowTime, stock } = ns.flags<{
        server: Host,
        weakenTime: number;
        windowTime: number;
        gapTime: number;
        stock: boolean;
    }>([
        ['server', ''],
        ['weakenTime', 0],
        ['windowTime', 0],
        ['gapTime', 0],
        ['stock', true]
    ]);

    if (!server || !weakenTime || !windowTime) {
        ns.tprint('Usage: --server=<> --windowTime=<> --weakenTime=<> [--stock]');
        return;
    }

    while (true) {
        await ns.sleep(windowTime - weakenTime);
        ns.print(['start', server]);
        await ns.weaken(server, { stock });
        ns.print(['done', server]);
    }
}
