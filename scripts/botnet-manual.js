import { config } from 'import.js';
const TIME_GAP_MS = 10;
const getWorkerScripts = () => ({
    weaken: `/${config.folder}/botnet-weaken.js`,
    hack: `/${config.folder}/botnet-hack.js`,
    grow: `/${config.folder}/botnet-grow.js`,
});
export async function main(ns) {
    const { runnerServer, targetServer } = ns.flags([
        ['runnerServer', ''],
        ['targetServer', ''],
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
    const maxMoney = ns.getServerMaxMoney(targetServer);
    const hackThreads = Math.min(1, ns.hackAnalyzeThreads(targetServer, maxMoney * 0.5));
    const growthThreads = Math.min(1, Math.ceil(ns.growthAnalyze(targetServer, 2)));
    const weakenThreads = Math.min(1, Math.ceil(hackThreads / 25) + Math.ceil((0.004 * growthThreads) / 0.05));
    const hackTime = ns.getHackTime(targetServer) * 1000;
    const growTime = ns.getGrowTime(targetServer) * 1000;
    const weakenTime = ns.getWeakenTime(targetServer) * 1000;
    const windowTime = Math.max(hackTime + TIME_GAP_MS, growTime + TIME_GAP_MS * 2, weakenTime);
    const totalScriptRam = workerScriptsRam.hack * hackThreads + workerScriptsRam.grow * growthThreads + workerScriptsRam.weaken * weakenThreads;
    const freeRam = ns.getServerMaxRam(runnerServer) - ns.getServerUsedRam(runnerServer);
    if (freeRam < totalScriptRam) {
        ns.tprint(`Not enough free ram [${freeRam} Gb] on ${runnerServer}, required: ${totalScriptRam} Gb`);
        return;
    }
    ns.scp(workerScripts.weaken, runnerServer);
    ns.scp(workerScripts.hack, runnerServer);
    ns.scp(workerScripts.grow, runnerServer);
    ns.exec(workerScripts.grow, runnerServer, weakenThreads, ...[
        `--server=${targetServer}`,
        `--windowTime=${windowTime}`,
        `--growTime=${growTime}`,
        `--gapTime=${TIME_GAP_MS}`,
    ]);
    ns.exec(workerScripts.hack, runnerServer, weakenThreads, ...[
        `--server=${targetServer}`,
        `--windowTime=${windowTime}`,
        `--hackTime=${hackTime}`,
        `--gapTime=${TIME_GAP_MS}`,
    ]);
    ns.exec(workerScripts.weaken, runnerServer, weakenThreads, ...[
        `--server=${targetServer}`,
        `--windowTime=${windowTime}`,
        `--weakenTime=${weakenTime}`,
        `--gapTime=${TIME_GAP_MS}`,
    ]);
}
