d3.fool = d3.fool || {};

d3.fool.dataManager = function module() {
    var exports = {}, 
    uid,
    dispatch = d3.dispatch('dataReady', 'dataLoading'),
    server = '//test.apiary.fool.com';

    exports.loadPortfolios = function(callback) {
        d3.json(server + '/folios/portfolios').header("X-Requested-With", "XMLHttpRequest").get( 
            function(error, portfolios) {
                var activePortfolios = portfolios.filter(function(p) { return !p.IsDeleted; });
                var portfolioList = activePortfolios.map(function(p) {
                    return { name: p.Name, num: p.ReferenceNum, created: p.Created };
                });
                callback(portfolioList);
            }
        );
    }

    exports.loadHistoricalReturnsData = function(portfolioNum, historicalDate, callback) {
        dispatch.dataLoading();
        if (!portfolioNum) { portfolioNum = ""; }
        d3.json(server + '/folios/returns/historical.json?historicalDate=' + historicalDate + '&portfolioReferenceNum=' + portfolioNum, 
            function(returnsData) {
                var activePositions = returnsData.Positions.filter(function(p) { return p.UnrealizedShares > 0; });
                var earliestDate = d3.min(activePositions, function(p) { return p.EarliestUnRealizedBuyDate; });
                callback({  date: new Date(historicalDate), 
                            returns: returnsData.OverallReturn,
                            gains: 0, // TODO.
                            benchmark: returnsData.BenchmarkReturns[0].Return,
                            xirr: returnsData.BenchmarkXirr,
                            positions: activePositions,
                            startDate: earliestDate
                        });
                dispatch.dataReady();
            }
        );
    }

    d3.rebind(exports, dispatch, 'on');
    return exports;
}