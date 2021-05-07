import type { BitBurner as NS, Host } from 'Bitburner';

export type WalkServerProcessFn = (args: { ns: NS, server: Host }) => void;
export const walkServer = ({ ns, previousServer, targetServer, processFn }: { ns: NS, targetServer: Host, previousServer?: Host, processFn: WalkServerProcessFn }) => {
    ns.scan(targetServer, true)
        .filter((server) => server !== (previousServer || targetServer))
        .forEach((server) => {
            processFn({ ns, server });
            walkServer({ ns, previousServer: targetServer, targetServer: server, processFn });
        });
}

export const getAllServers = (ns: NS): Host[] => {
    let servers: Host[] = [];
    walkServer({ ns, targetServer: 'home', processFn({ server }) { servers = [...servers, server]}})
    return servers;
};