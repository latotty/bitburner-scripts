import type { BitBurner as NS, Host } from 'Bitburner';

export async function main(ns: NS) {
    const { server, growTime, windowTime, gapTime, stock } = ns.flags<{
        server: Host,
        growTime: number;
        windowTime: number;
        gapTime: number;
        stock: boolean;
    }>([
        ['server', ''],
        ['growTime', 0],
        ['windowTime', 0],
        ['gapTime', 0],
        ['stock', true]
    ]);

    if (!server || !growTime || !windowTime) {
        ns.tprint('Usage: --server=<> --windowTime=<> --growTime=<> [--stock]');
        return;
    }

    while (true) {
        await ns.sleep(windowTime - growTime - gapTime * 2);
        ns.print(['start', server]);
        await ns.grow(server, { stock });
        ns.print(['done', server]);
        await ns.sleep(gapTime);
    }
}
