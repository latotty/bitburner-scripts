import type { BitBurner as NS, Host } from 'Bitburner';

const TIME_GAP_MS = 10;

export async function main(ns: NS) {
    const { server, hackThreads, growThread, weakenThread, hackTime, growTime, weakenTime, stock } = ns.flags<{
        server: Host,
        hackThreads: number;
        growThread: number;
        weakenThread: number;
        hackTime: number;
        growTime: number;
        weakenTime: number;
        stock: boolean;
    }>([
        ['server', ''],
        ['hackThreads', 0],
        ['growThread', 0],
        ['weakenThread', 0],
        ['hackTime', 0],
        ['growTime', 0],
        ['weakenTime', 0],
        ['stock', true]
    ]);

    if (!server || !hackThreads || !growThread || !weakenThread || !hackTime || !growTime || !weakenTime) {
        ns.tprint('Usage: --server=<> --hackThreads=<> --growThread=<> --weakenThread=<> --hackTime=<> --growTime=<> --weakenTime=<> [--stock]');
        return;
    }

    let calculatedHackTime = hackTime;
    let calculatedGrowTime = growTime;
    let calculatedWeakenTime = weakenTime;

    while (true) {
        await Promise.all([
            (async () => {
                const start = Date.now();
                await ns.weaken(server, { threads: weakenThread, stock });
                calculatedWeakenTime = Date.now() - start;
            })(),
            (async () => {
                await ns.sleep(calculatedWeakenTime - calculatedGrowTime - (2 * TIME_GAP_MS));

                const start = Date.now();
                await ns.grow(server, { threads: growThread, stock });
                calculatedGrowTime = Date.now() - start;
            })(),
            (async () => {
                await ns.sleep(calculatedWeakenTime - calculatedHackTime - TIME_GAP_MS);

                const start = Date.now();
                await ns.hack(server, { threads: hackThreads, stock });
                calculatedHackTime = Date.now() - start;
            })(),
        ]);
    }
}
