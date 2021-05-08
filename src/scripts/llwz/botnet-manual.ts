import type { BitBurner as NS, Host } from 'Bitburner';
import { execGrow, execWeaken, execHack, getBotnetTargetOpts } from '/scripts/llwz/lib/botnet.js';

export async function main(ns: NS) {
    const { runnerServer, targetServer, gapTime } = ns.flags<{
        runnerServer: Host,
        targetServer: Host,
        gapTime: number;
    }>([
        ['runnerServer', ''],
        ['targetServer', ''],
        ['gapTime', 0],
    ]);

    if (!runnerServer || !targetServer) {
        ns.tprint('Usage: --runnerServer=<> --targetServer=<>');
        return;
    }

    const botnetOpts = getBotnetTargetOpts(ns, targetServer, { gapTime });
    
    const freeRam = ns.getServerMaxRam(runnerServer) - ns.getServerUsedRam(runnerServer);

    if (freeRam < botnetOpts.totalScriptRam) {
        ns.tprint(`Not enough free ram [${freeRam} Gb] on ${runnerServer}, required: ${botnetOpts.totalScriptRam} Gb`);
        return;
    }

    ns.tprint(botnetOpts);

    execGrow(ns, runnerServer, botnetOpts);
    execHack(ns, runnerServer, botnetOpts);
    execWeaken(ns, runnerServer, botnetOpts);
}
