export async function main(ns) {
    const { server, growTime, cycleTime, gapTime, stock } = ns.flags([
        ['server', ''],
        ['growTime', 0],
        ['cycleTime', 0],
        ['gapTime', 0],
        ['stock', true]
    ]);
    if (!server || !growTime || !cycleTime) {
        ns.tprint('Usage: --server=<> --cycleTime=<> --growTime=<> [--stock]');
        return;
    }
    while (true) {
        await ns.sleep(cycleTime - growTime - gapTime * 2);
        ns.print(['start', server]);
        await ns.grow(server, { stock });
        ns.print(['done', server]);
        await ns.sleep(gapTime);
    }
}
