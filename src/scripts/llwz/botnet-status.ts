import type { BitBurner as NS, Host } from 'Bitburner';
import { BotnetTargetOpts, getBotnetTargetOpts } from '/scripts/llwz/lib/botnet.js';
import { humanTime } from '/scripts/llwz/lib/human-time.js';
import { getAllServers } from '/scripts/llwz/lib/walk-server.js';

export async function main(ns: NS) {
    const serverNames: Host[] = getAllServers(ns); 
    const botnetOpts: BotnetTargetOpts[] = serverNames.map(s => getBotnetTargetOpts(ns, s));
    ns.tprint(JSON.stringify(botnetOpts
        .sort((a, b) => a.moneyPerSec - b.moneyPerSec)
        // @ts-expect-error
        .sort((a, b) => a.canHack - b.canHack)
        .map(({ targetServer, moneyPerSec, moneyPerRam, cycleTime, canHack, totalScriptRam }) => ({ targetServer, moneyPerSec, moneyPerRam, cycleTime: humanTime(cycleTime), canHack, totalScriptRam })), 
        null, 2));
}
