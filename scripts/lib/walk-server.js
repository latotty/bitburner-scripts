export const walkServer = ({ ns, previousServer, targetServer, processFn }) => {
    ns.scan(targetServer, true)
        .filter((server) => server !== (previousServer || targetServer))
        .forEach((server) => {
        processFn({ ns, server });
        walkServer({ ns, previousServer: targetServer, targetServer: server, processFn });
    });
};
export const getAllServers = (ns) => {
    let servers = [];
    walkServer({ ns, targetServer: 'home', processFn({ server }) { servers = [...servers, server]; } });
    return servers;
};
