export async function main(ns) {
    const { server, stock } = ns.flags([
        ['server', ''], //  a default string means this flag is a string
        ['stock', false], // a default boolean means this flag is a boolean
    ]);
    
    if (!server) {
        ns.tprint('usage: --server <SERVER> [--stock]');
        return;
    }
    
    await ns.grow(server, { stock });
}