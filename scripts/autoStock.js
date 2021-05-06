// From: https://www.reddit.com/r/Bitburner/comments/bworvo/anyone_got_a_good_script_or_just_an_algorithm_for/

const keep = 0.2;

const buyLimit = 0.58;
const sellLimit = 0.50;

const commission = 100000;

function updateStockData(ns, stocks, myStocks) {
    let corpus = ns.getServerMoneyAvailable("home");
    myStocks.length = 0;
    for (let i = 0; i < stocks.length; ++i) {
        let sym = stocks[i].sym;
        stocks[i].price = ns.getStockPrice(sym);
        stocks[i].shares = ns.getStockPosition(sym)[0];
        stocks[i].forecast = ns.getStockForecast(sym);
        if (stocks[i].shares > 0) myStocks.push(stocks[i]);
        corpus += stocks[i].price * stocks[i].shares;
    }
    stocks.sort((a, b) => b.forecast - a.forecast);
    return corpus;
}

export async function main(ns) {
    ns.disableLog("ALL");

    let stocks = [];
    let myStocks = [];
    let corpus = 0;
    for (let i = 0; i < ns.getStockSymbols().length; ++i)
        stocks.push({ sym: ns.getStockSymbols()[i] });
    updateStockData(ns, stocks, myStocks);

    while (true) {
        corpus = updateStockData(ns, stocks, myStocks);
        // Sell bad shares
        for (let i = 0; i < myStocks.length; i++) {
            if (myStocks[i].forecast < sellLimit) {
                ns.print("Stock " + myStocks[i].sym + " no longer valuable. Selling.");
                ns.sellStock(myStocks[i].sym, myStocks[i].shares);
            }
        }

        // Don't do this. Use getStockPurchaseCost for some proportion of corpus,
        // then reduce it by a certain % until it's buyable.

        let stockIndex = -1;
        let cashToSpend = ns.getServerMoneyAvailable("home");
        while (cashToSpend > 100 * commission && cashToSpend > corpus / 10) {
            ns.print("Have " + cashToSpend + " cash to spend.");
            ++stockIndex;
            updateStockData(ns, stocks, myStocks);
            let stockToBuy = stocks[stockIndex];
            if (stockToBuy.forecast < buyLimit) {
                ns.print("No more good stocks left.");
                break;
            }

            let availibleShares = ns.getStockMaxShares(stockToBuy.sym) - stockToBuy.shares
            if (availibleShares == 0)
                continue; // We bought all shares of this stock

            let numberOfSharesToBuy = availibleShares;
            while (true) {
                if (ns.getStockPurchaseCost(stockToBuy.sym, numberOfSharesToBuy, "L") <= cashToSpend) {
                    ns.buyStock(stockToBuy.sym, numberOfSharesToBuy);
                    ns.print("Bought " + numberOfSharesToBuy + " shares in " + stockToBuy.sym + " for " + ns.getStockPurchaseCost(stockToBuy.sym, numberOfSharesToBuy, "L"));
                    cashToSpend -= ns.getStockPurchaseCost(stockToBuy.sym, numberOfSharesToBuy, "L");
                    break;
                }
                numberOfSharesToBuy = Math.floor(numberOfSharesToBuy * 0.9);
            }
        }
        await ns.sleep(6 * 1000);
    }
}