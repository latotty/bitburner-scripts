import type { BitBurner as NS, Host } from 'Bitburner';
import { config } from 'import.js';

const getWorkerScript = () => `/${config.folder}/botnet-worker.js`;

export async function main(ns: NS) {
    const { runnerServer, targetServer } = ns.flags<{
        runnerServer: Host,
        targetServer: Host,
    }>([
        ['runnerServer', ''],
        ['targetServer', ''],
    ]);

    if (!runnerServer || !targetServer) {
        ns.tprint('Usage: --runnerServer=<> --targetServer=<>');
        return;
    }

    const workerScript = getWorkerScript();
    const workerScriptRam = ns.getScriptRam(workerScript);

    const maxMoney = ns.getServerMaxMoney(targetServer);
    const hackThreads = Math.min(1, ns.hackAnalyzeThreads(targetServer, maxMoney * 0.5));
    const growthThreads = Math.min(1, Math.ceil(ns.growthAnalyze(targetServer, 2)));
    const weakenThreads = Math.min(1, Math.ceil(hackThreads / 25) + Math.ceil((0.004 * growthThreads) / 0.05));

    const hackTime = ns.getHackTime(targetServer);
    const growTime = ns.getGrowTime(targetServer);
    const weakenTime = ns.getWeakenTime(targetServer);

    const totalThreads = hackThreads + growthThreads + weakenThreads;
    const totalScriptRam = totalThreads * workerScriptRam;

    const freeRam = ns.getServerMaxRam(runnerServer) - ns.getServerUsedRam(runnerServer);

    if (freeRam < totalScriptRam) {
        ns.tprint(`Not enough free ram [${freeRam} Gb] on ${runnerServer}, required: ${totalScriptRam} Gb`);
        return;
    }

    ns.scp(workerScript, runnerServer);
    ns.exec(workerScript, runnerServer, totalThreads, ...[
        `--server=${targetServer}`,
        `--hackThreads=${hackThreads}`,
        `--growThread=${growthThreads}`,
        `--weakenThread=${weakenThreads}`,
        `--hackTime=${hackTime}`,
        `--growTime=${growTime}`,
        `--weakenTime=${weakenTime}`,
    ]);
}
