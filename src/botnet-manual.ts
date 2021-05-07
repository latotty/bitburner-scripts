import type { BitBurner as NS, Host } from 'Bitburner';
import { config } from 'import.js';

const getWorkerScripts = () => ({
    weaken: `/${config.folder}/botnet-weaken.js`,
    hack: `/${config.folder}/botnet-hack.js`,
    grow: `/${config.folder}/botnet-grow.js`,
});

export async function main(ns: NS) {
    const { runnerServer, targetServer, gapTime } = ns.flags<{
        runnerServer: Host,
        targetServer: Host,
        gapTime: number;
    }>([
        ['runnerServer', ''],
        ['targetServer', ''],
        ['gapTime', 1000],
    ]);

    if (!runnerServer || !targetServer) {
        ns.tprint('Usage: --runnerServer=<> --targetServer=<>');
        return;
    }

    const workerScripts = getWorkerScripts();
    const workerScriptsRam = {
        weaken: ns.getScriptRam(workerScripts.weaken),
        hack: ns.getScriptRam(workerScripts.hack),
        grow: ns.getScriptRam(workerScripts.grow),
    };

    const hackThreads = Math.max(1, Math.floor(40 / ns.hackAnalyzePercent(targetServer)));
    const growthThreads = Math.max(1, Math.ceil(ns.growthAnalyze(targetServer, 2)));
    const weakenThreads = Math.max(1, Math.ceil(hackThreads / 25) + Math.ceil((0.004 * growthThreads) / 0.05));

    const hackTime = ns.getHackTime(targetServer) * 1000;
    const growTime = ns.getGrowTime(targetServer) * 1000;
    const weakenTime = ns.getWeakenTime(targetServer) * 1000;

    const windowTime = Math.max(hackTime + gapTime, growTime + gapTime * 2, weakenTime);

    const totalScriptRam = Math.ceil(workerScriptsRam.hack * hackThreads) + Math.ceil(workerScriptsRam.grow * growthThreads) + Math.ceil(workerScriptsRam.weaken * weakenThreads);

    const freeRam = ns.getServerMaxRam(runnerServer) - ns.getServerUsedRam(runnerServer);

    if (freeRam < totalScriptRam) {
        ns.tprint(`Not enough free ram [${freeRam} Gb] on ${runnerServer}, required: ${totalScriptRam} Gb`);
        return;
    }

    ns.scp(workerScripts.weaken, runnerServer);
    ns.scp(workerScripts.hack, runnerServer);
    ns.scp(workerScripts.grow, runnerServer);

    ns.tprint({
        hackThreads,
        growthThreads,
        weakenThreads,
        hackTime,
        growTime,
        weakenTime,
        windowTime,
        totalScriptRam,
    });

    ns.exec(workerScripts.grow, runnerServer, growthThreads, ...[
        `--server=${targetServer}`,
        `--windowTime=${windowTime}`,
        `--growTime=${growTime}`,
        `--gapTime=${gapTime}`,
    ]);
    ns.exec(workerScripts.hack, runnerServer, hackThreads, ...[
        `--server=${targetServer}`,
        `--windowTime=${windowTime}`,
        `--hackTime=${hackTime}`,
        `--gapTime=${gapTime}`,
    ]);
    ns.exec(workerScripts.weaken, runnerServer, weakenThreads, ...[
        `--server=${targetServer}`,
        `--windowTime=${windowTime}`,
        `--weakenTime=${weakenTime}`,
        `--gapTime=${gapTime}`,
    ]);
}
