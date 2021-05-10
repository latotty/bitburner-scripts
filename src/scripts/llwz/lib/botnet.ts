import type { BitBurner as NS, Host } from 'Bitburner';
import { crackServer } from '/scripts/llwz/lib/crack-server.js';

const getWorkerScripts = () => ({
    weaken: `/scripts/llwz/botnet-weaken.js`,
    hack: `/scripts/llwz/botnet-hack.js`,
    grow: `/scripts/llwz/botnet-grow.js`,
});

const getWorkerScriptRam = (ns: NS) => {
    const workerScripts = getWorkerScripts();
    return ({
        weaken: ns.getScriptRam(workerScripts.weaken),
        hack: ns.getScriptRam(workerScripts.hack),
        grow: ns.getScriptRam(workerScripts.grow),
    });
}

export type BotnetTargetOpts = {
    targetServer: Host;
    gapTime: number;

    serverMaxMoney: number;
    serverGrowth: number;
    serverMinSecurity: number;
    serverSecurity: number;
    serverRequiredHackingLevel: number;
    hasRoot: boolean;
    canHack: boolean;

    potentialMoney: number;
    moneyPerSec: number;
    moneyPerRam: number;

    hackThreads: number;
    growThreads: number;
    weakenThreads: number;

    hackTime: number;
    growTime: number;
    weakenTime: number;

    cycleTime: number;
    
    hackRam: number;
    growRam: number;
    weakenRam: number;
    
    totalScriptRam: number;
};

export const getBotnetTargetOpts = (ns: NS, targetServer: Host, { gapTime = 0, harvestPercent = 40, growthAmount = 2 }: { gapTime?: number, harvestPercent?: number, growthAmount?: number } = {}): BotnetTargetOpts => {
    const workerScriptsRam = getWorkerScriptRam(ns);

    const hackThreads = Math.max(1, Math.floor(harvestPercent / ns.hackAnalyzePercent(targetServer)));
    const growThreads = Math.max(1, Math.ceil(ns.growthAnalyze(targetServer, growthAmount)));
    const weakenThreads = Math.max(1, Math.ceil(hackThreads / 25) + Math.ceil((0.004 * growThreads) / 0.05));

    const hackTime = ns.getHackTime(targetServer) * 1000;
    const growTime = ns.getGrowTime(targetServer) * 1000;
    const weakenTime = ns.getWeakenTime(targetServer) * 1000;

    const cycleTime = Math.max(hackTime + gapTime, growTime + gapTime * 2, weakenTime);

    const hackRam = workerScriptsRam.hack * hackThreads;
    const growRam = workerScriptsRam.grow * growThreads;
    const weakenRam = workerScriptsRam.weaken * weakenThreads;

    const totalScriptRam = hackRam + growRam + weakenRam;

    const serverMaxMoney = ns.getServerMaxMoney(targetServer);
    const potentialMoney = serverMaxMoney * (harvestPercent / 100);

    const serverRequiredHackingLevel = ns.getServerRequiredHackingLevel(targetServer);
    const hasRoot = crackServer(ns, targetServer);

    return {
        targetServer,
        gapTime,

        serverMaxMoney,
        serverGrowth: ns.getServerGrowth(targetServer),
        serverMinSecurity: ns.getServerMinSecurityLevel(targetServer),
        serverSecurity: ns.getServerSecurityLevel(targetServer),
        serverRequiredHackingLevel,
        hasRoot,
        canHack: hasRoot && ns.getHackingLevel() >= serverRequiredHackingLevel,

        potentialMoney,
        moneyPerSec: potentialMoney / (cycleTime / 1000),
        moneyPerRam: potentialMoney / totalScriptRam,

        hackThreads,
        growThreads,
        weakenThreads,

        hackTime,
        growTime,
        weakenTime,

        cycleTime,

        hackRam,
        growRam,
        weakenRam,

        totalScriptRam,
    }
} 

export const execHack = (ns: NS, runnerServer: Host, opts: BotnetTargetOpts) => {
    const workerScripts = getWorkerScripts();

    const freeRam = ns.getServerMaxRam(runnerServer) - ns.getServerUsedRam(runnerServer);
    if (freeRam < opts.hackRam) {
        return false;
    }
    
    ns.scp(workerScripts.hack, runnerServer);
    ns.exec(workerScripts.hack, runnerServer, opts.hackThreads, ...[
        `--server=${opts.targetServer}`,
        `--cycleTime=${opts.cycleTime}`,
        `--hackTime=${opts.hackTime}`,
        `--gapTime=${opts.gapTime}`,
    ]);

    return true;
}

export const execGrow = (ns: NS, runnerServer: Host, opts: BotnetTargetOpts) => {
    const workerScripts = getWorkerScripts();

    const freeRam = ns.getServerMaxRam(runnerServer) - ns.getServerUsedRam(runnerServer);
    if (freeRam < opts.growRam) {
        return false;
    }
    
    ns.scp(workerScripts.grow, runnerServer);
    ns.exec(workerScripts.grow, runnerServer, opts.growThreads, ...[
        `--server=${opts.targetServer}`,
        `--cycleTime=${opts.cycleTime}`,
        `--growTime=${opts.growTime}`,
        `--gapTime=${opts.gapTime}`,
    ]);

    return true;
}

export const execWeaken = (ns: NS, runnerServer: Host, opts: BotnetTargetOpts) => {
    const workerScripts = getWorkerScripts();

    const freeRam = ns.getServerMaxRam(runnerServer) - ns.getServerUsedRam(runnerServer);
    if (freeRam < opts.weakenRam) {
        return false;
    }
    
    ns.scp(workerScripts.weaken, runnerServer);
    ns.exec(workerScripts.weaken, runnerServer, opts.weakenThreads, ...[
        `--server=${opts.targetServer}`,
        `--cycleTime=${opts.cycleTime}`,
        `--weakenTime=${opts.weakenTime}`,
        `--gapTime=${opts.gapTime}`,
    ]);

    return true;
}