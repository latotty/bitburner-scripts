import type { BitBurner as NS } from 'Bitburner';
import { getAllServers } from '/scripts/llwz/lib/walk-server.js';

export async function main(ns: NS) {
    ns.tprint(getAllServers(ns));
}
