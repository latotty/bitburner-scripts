// Inspired by: https://www.reddit.com/r/Bitburner/comments/bworvo/anyone_got_a_good_script_or_just_an_algorithm_for/
const BUY_LIMIT = 0.58;
const SELL_LIMIT = 0.50;
const COMISSION = 100000;
const getStockData = (ns, sym) => ({
    sym,
    price: ns.getStockPrice(sym),
    shares: ns.getStockPosition(sym)[0],
    forecast: ns.getStockForecast(sym),
});
const getAllStockData = (ns) => ns.getStockSymbols().map(s => getStockData(ns, s));
const getSortedStockSymbols = (ns) => ns.getStockSymbols().sort((a, b) => ns.getStockForecast(b) - ns.getStockForecast(a));
export async function main(ns) {
    ns.disableLog("ALL");
    const { keep } = ns.flags([['keep', 0.1]]);
    while (true) {
        // Sell bad shares
        const myStocks = getAllStockData(ns).filter(s => s.shares > 0);
        for (const myStock of myStocks) {
            if (myStock.forecast < SELL_LIMIT) {
                ns.print("Stock " + myStock.sym + " no longer valuable. Selling.");
                ns.sellStock(myStock.sym, myStock.shares);
            }
        }
        let cashToSpend = ns.getServerMoneyAvailable("home");
        for (const stockSymbol of getSortedStockSymbols(ns)) {
            const allStockData = getAllStockData(ns);
            const corpus = allStockData.filter(s => s.shares > 0).reduce((acc, s) => acc + s.shares * s.price, ns.getServerMoneyAvailable("home"));
            if (cashToSpend <= 100 * COMISSION || cashToSpend <= corpus * keep) {
                break;
            }
            ns.print("Have " + cashToSpend + " cash to spend.");
            const stockToBuy = allStockData.find(s => s.sym === stockSymbol);
            if (stockToBuy.forecast < BUY_LIMIT) {
                continue;
            }
            let availableShares = ns.getStockMaxShares(stockToBuy.sym) - stockToBuy.shares;
            if (availableShares === 0) {
                continue; // We bought all shares of this stock
            }
            let numberOfSharesToBuy = availableShares;
            while (numberOfSharesToBuy > 0) {
                const purchaseCost = ns.getStockPurchaseCost(stockToBuy.sym, numberOfSharesToBuy, "long");
                if (purchaseCost <= cashToSpend) {
                    ns.buyStock(stockToBuy.sym, numberOfSharesToBuy);
                    ns.print("Bought " + numberOfSharesToBuy + " shares in " + stockToBuy.sym + " for " + purchaseCost);
                    cashToSpend -= purchaseCost;
                    break;
                }
                numberOfSharesToBuy = Math.floor(numberOfSharesToBuy * 0.9);
            }
        }
        await ns.sleep(6 * 1000);
    }
}
