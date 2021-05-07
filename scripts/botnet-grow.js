export async function main(ns) {
    const { server, growTime, windowTime, gapTime, stock } = ns.flags([
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
    let calculatedGrowTime = growTime;
    while (true) {
        await ns.sleep(windowTime - calculatedGrowTime - gapTime * 2);
        const start = Date.now();
        ns.tprint(['start', server]);
        await ns.grow(server, { stock });
        ns.tprint(['done', server]);
        calculatedGrowTime = Date.now() - start;
        await ns.sleep(gapTime);
    }
}
