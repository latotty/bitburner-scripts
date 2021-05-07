export async function main(ns) {
    const { server, hackTime, cycleTime, gapTime, stock } = ns.flags([
        ['server', ''],
        ['hackTime', 0],
        ['cycleTime', 0],
        ['gapTime', 0],
        ['stock', true]
    ]);
    if (!server || !hackTime || !cycleTime) {
        ns.tprint('Usage: --server=<> --cycleTime=<> --hackTime=<> [--stock]');
        return;
    }
    while (true) {
        await ns.sleep(cycleTime - hackTime - gapTime);
        ns.print(['start', server]);
        await ns.hack(server, { stock });
        ns.print(['done', server]);
        await ns.sleep(2 * gapTime);
    }
}
