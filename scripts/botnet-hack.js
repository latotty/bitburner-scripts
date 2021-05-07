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
    while (true) {
        await ns.sleep(windowTime - hackTime - gapTime);
        ns.print(['start', server]);
        await ns.hack(server, { stock });
        ns.print(['done', server]);
        await ns.sleep(2 * gapTime);
    }
}
