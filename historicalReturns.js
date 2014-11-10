
var currentPortfolio = -1;
var currentIndex = 0;
var playing = false;

var portfolios;
var historicalData = {};

var dataManager = d3.fool.dataManager();
var returnsChart = d3.fool.returnsChart().height(400).width(800);
var positionsChart = d3.fool.positionsBubbleChart().height(400).width(800);
var portfolioTreeChart = d3.fool.portfolioTreeChart().height(660).width(600);

var portfolioSelect = d3.select("#portfolioSelect");
var decreaseButton = d3.select("#decreaseDate");
var dateInput = d3.select("input.date");
var dateDisplay = d3.select("#dateDisplay");
var increaseButton = d3.select("#increaseDate");
var playButton = d3.select("#playDate");
var stopButton = d3.select("#stopDate");

portfolioSelect.on('change', function(e) {
    currentPortfolio = parseInt(portfolioSelect.node().value);
    currentIndex = historicalData[currentPortfolio].data.length - 1;

    setDateInput(historicalData[currentPortfolio].data[currentIndex].date);
    updateReturns();
    updatePositions(currentIndex);
    updatePortfolioTree();

    d3.select("#portfolioName").text(this.selectedOptions[0].text);
});

increaseButton.on('click', function() {
    changeDateAndUpdate(1);
});

decreaseButton.on('click', function() {
    changeDateAndUpdate(-1);
});

playButton.on('click', function() {
    playing = true;
    setTimeout(function() {
        autoIncreaseAndUpdate(); 
    }, 1500);
});

d3.selectAll('input[name="returnsType"').on('change', function() {
    returnsChart.returnsType(this.value);
    updateReturns();
});

d3.selectAll('input[name="benchmarkType"').on('change', function() {
    returnsChart.benchmarkType(this.value);
});

stopButton.on('click', function() {
    playing = false;
});

function autoIncreaseAndUpdate() {
    if (!playing) return;
    changeDateAndUpdate(1);
    var date = new Date(dateInput.property("value"));
    if (date < Date.now()) {
        setTimeout(function() {
            autoIncreaseAndUpdate(); 
        }, 1500);
    }
}

function changeDateAndUpdate(change) {
    var historicalDate = moment(dateInput.property("value"));

    if (currentIndex + change < 0) { return; }
    if (historicalDate.add(change, "months") > moment()) { return; }

    currentIndex = currentIndex + change;
    setDateInput(historicalDate.toDate());
    
    if (currentIndex < historicalData[currentPortfolio].data.length) {
        returnsChart.setDatePointIndex(currentIndex);
        updatePositions(currentIndex);
        updatePortfolioTree();
    }
    else {
        dataManager.loadHistoricalReturnsData(currentPortfolio, dateInput.property("value"), function(data) {
            historicalData[currentPortfolio].data.push(data);
            updateReturns();
            updatePositions(currentIndex);
            updatePortfolioTree();
        });
        if (currentPortfolio !== 0) {
            dataManager.loadHistoricalReturnsData(0, dateInput.property("value"), function(data) {
                    historicalData[0].data.push(data);
                });
        }
        portfolios.forEach(function(p, i) {
            if (p.num !== currentPortfolio) {
                dataManager.loadHistoricalReturnsData(p.num, dateInput.property("value"), function(data) {
                    historicalData[p.num].data.push(data);
                });
            }
        });
    }
}

function updateReturns() { 
    d3.select('#chart1') 
        .datum(historicalData[currentPortfolio].data) 
        .call(returnsChart, currentIndex); 
}

function updatePositions(i) {
    d3.select('#chart2') 
        .datum(historicalData[currentPortfolio].data[i].positions) 
        .call(positionsChart);
}

function updatePortfolioTree() {
    d3.select('#chart3') 
        .datum(historicalData) 
        .call(portfolioTreeChart, { portfolioIndex: currentPortfolio, dateIndex: currentIndex }); 
}

function setDateInput(date) {
    dateInput.property("value", moment(date).format("L"));
    dateDisplay.text(moment(date).format("MMM YYYY"));
}

function loadInitialReturns(portfolio, date, isFirst) {
    dataManager.loadHistoricalReturnsData(portfolio.num, date.format("L"), function(data) {
        historicalData[portfolio.num] = {};
        historicalData[portfolio.num].name = portfolio.name;
        historicalData[portfolio.num].data = [data];

        if (isFirst) {
            currentPortfolio = portfolio.num;
            currentIndex = 0;
            updateReturns();
            updatePositions(currentIndex);
            updatePortfolioTree();
        }
    });
}

function addPortfolioToSelectList(p) {
    portfolioSelect.append("option")
        .attr("value", p.num)
        .text(p.name); 
}

dataManager.loadPortfolios(function(data) {
    var startDate;

    portfolios = data;
    startDate = moment("1/1/2014"); //moment(portfolios[0].created).add(1, "months").date(1);
    setDateInput(startDate);

    loadInitialReturns({ num: 0, name: "All"}, startDate, true);

    portfolios.forEach(function(p, i) {
        //startDate = moment(p.created).add(1, "months").date(1);
        loadInitialReturns(p, startDate, false);
        addPortfolioToSelectList(p);
    });
});

returnsChart.on("dateChanged", function(i) { 
    currentIndex = i;
    setDateInput(historicalData[currentPortfolio].data[i].date);
    updatePositions(i);
});

positionsChart.on("positionSelected", function(position) {
    returnsChart.showPositionData(position);
});

portfolioTreeChart.on("portfolioSelected", function(portfolio) {
    console.log(portfolio);
    var sel = portfolioSelect.node();
    for(var i = 0, j = sel.options.length; i < j; ++i) {
        if(sel.options[i].innerHTML === portfolio) {
           sel.selectedIndex = i;
           break;
        }
    }

    currentPortfolio = parseInt(portfolioSelect.node().value);
    currentIndex = historicalData[currentPortfolio].data.length - 1;

    updateReturns();
    updatePositions(currentIndex);
    d3.select("#portfolioName").text(sel.selectedOptions[0].text);
});

dataManager.on('dataLoading', function() {
    d3.selectAll('button').attr('disabled', true);
});

dataManager.on('dataReady', function() {
    d3.selectAll('button').attr('disabled', null);
});
