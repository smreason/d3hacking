d3.fool = d3.fool || {};

d3.fool.dataManager = function module() {
    var exports = {},
    dispatch = d3.dispatch('dataReady', 'dataLoading'),
    server = '//localhost.apiary.fool.com';

    exports.loadPortfolios = function() {
        d3.json(server + '/folios/portfolios', 
            function(returnsData) {

            }
        );
    }

    exports.loadHistoricalReturnsData = function(portfolioNum, historicalDate, callback) {
        d3.json(server + '/folios/returns/historical.json?HistoricalDate=' + historicalDate + '&portfolioReferenceNum=' + portfolioNum, 
            function(returnsData) {
                var activePositions = returnsData.Positions.filter(function(p) { return p.UnrealizedShares > 0; });
                callback({  date: new Date(historicalDate), 
                            returns: returnsData.OverallReturn,
                            positions: activePositions 
                        });
            }
        );
    }

    d3.rebind(exports, dispatch, 'on');
    return exports;
}