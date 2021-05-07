import { getAllServers } from './lib/walk-server';
export async function main(ns) {
    ns.tprint(getAllServers(ns));
}
