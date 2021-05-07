export async function main(ns) {
    const { server, hackTime, windowTime, gapTime, stock } = ns.flags([
        ['server', ''],
        ['hackTime', 0],
        ['windowTime', 0],
        ['gapTime', 0],
        ['stock', true]
    ]);
    if (!server || !hackTime || !windowTime) {
        ns.tprint('Usage: --server=<> --windowTime=<> --hackTime=<> [--stock]');
        return;
    }
    let calculatedHackTime = hackTime;
    while (true) {
        await ns.sleep(windowTime - calculatedHackTime - gapTime);
        const start = Date.now();
        ns.tprint(['start', server]);
        await ns.hack(server, { stock });
        ns.tprint(['done', server]);
        calculatedHackTime = Date.now() - start;
        await ns.sleep(2 * gapTime);
    }
}
