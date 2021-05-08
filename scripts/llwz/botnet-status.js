import { getAllServers } from '/scripts/llwz/lib/walk-server.js';
export async function main(ns) {
    ns.tprint(getAllServers(ns));
}
