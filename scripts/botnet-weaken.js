export async function main(ns) {
    const { server, weakenTime, windowTime, stock } = ns.flags([
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
    let calculatedWeakenTime = weakenTime;
    while (true) {
        await ns.sleep(windowTime - calculatedWeakenTime);
        // const start = Date.now();
        ns.tprint(['start', server]);
        await ns.weaken(server, { stock });
        ns.tprint(['done', server]);
        // calculatedWeakenTime = Date.now() - start;
    }
}
