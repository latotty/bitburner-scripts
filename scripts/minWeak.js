export async function main(ns) {
    const { server, stock } = ns.flags([
        ['server', ''], //  a default string means this flag is a string
    ]);
    
    if (!server) {
        ns.tprint('usage: --server <SERVER>');
        return;
    }
    
    await ns.weaken(server);
}