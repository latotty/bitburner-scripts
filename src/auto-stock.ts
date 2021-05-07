import type { BitBurner as NS, StockSymbol } from 'Bitburner';

// Inspired by: https://www.reddit.com/r/Bitburner/comments/bworvo/anyone_got_a_good_script_or_just_an_algorithm_for/

const BUY_LIMIT = 0.58;
const SELL_LIMIT = 0.50;

const COMISSION = 100000;

type StockData = {
    sym: StockSymbol;
    price: number;
    shares: number;
    forecast: number;
}
const getStockData = (ns: NS): StockData[] => ns.getStockSymbols().map(sym => ({
    sym,
    price: ns.getStockPrice(sym),
    shares: ns.getStockPosition(sym)[0],
    forecast: ns.getStockForecast(sym),
}));

const getSortedStockSymbols = (ns: NS): StockSymbol[] => ns.getStockSymbols().sort((a, b) => ns.getStockForecast(b) - ns.getStockForecast(a));

export async function main(ns: NS) {
    ns.disableLog("ALL");

    const { keep, rapid } = ns.flags<{ keep: number, rapid: boolean }>([['keep', 0.1], ['rapid', false]]);

    while (true) {
        // Sell bad shares
        const myStocks = getStockData(ns).filter(s => s.shares > 0);
        for (const myStock of myStocks) {
            const corpus = getStockData(ns).filter(s => s.shares > 0).reduce((acc, s) => acc + s.shares * s.price, ns.getServerMoneyAvailable("home"));
            if (myStock.forecast < SELL_LIMIT || (rapid && ns.getStockSaleGain(myStock.sym, myStock.shares, 'long') > corpus * 0.05)) {
                ns.print("Stock " + myStock.sym + " no longer valuable. Selling.");
                ns.sellStock(myStock.sym, myStock.shares);
            }
        }
        
        let cashToSpend = ns.getServerMoneyAvailable("home");
        for (const stockSymbol of getSortedStockSymbols(ns)) {
            const stockData = getStockData(ns);
            const corpus = getStockData(ns).filter(s => s.shares > 0).reduce((acc, s) => acc + s.shares * s.price, ns.getServerMoneyAvailable("home"));
            if(cashToSpend <= 100 * COMISSION || cashToSpend <= corpus * keep) {
                break;
            }
            ns.print("Have " + cashToSpend + " cash to spend.");
            const stockToBuy = stockData.find(s => s.sym === stockSymbol)!;

            if (stockToBuy.forecast < BUY_LIMIT) {
                continue;
            }

            let availableShares = ns.getStockMaxShares(stockToBuy.sym) - stockToBuy.shares
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
