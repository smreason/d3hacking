
var historicalData = [{ date: new Date('1/1/2014'), returns: 0}];
var returnsChart = d3.fool.returnsBarChart().height(400).width(800);
var positionsBubbleChart = d3.fool.positionsBubbleChart().height(400).width(500);

var dateInput = d3.select("input.date");
var increaseButton = d3.select("#increaseDate");
var playButton = d3.select("#playDate");
var stopButton = d3.select("#stopDate");
var updateButton = d3.select("#updateDate");
var playing = false;

increaseButton.on('click', function() {
    increaseAndUpdate();
});

updateButton.on('click', function() {
    loadHistoricalReturnsData(dateInput.property("value"), function() {
        update();
    });
});

playButton.on('click', function() {
    playing = true;
    setTimeout(function() {
        autoIncreaseAndUpdate(); 
    }, 1500);
});

stopButton.on('click', function() {
    playing = false;
});

function autoIncreaseAndUpdate() {
    if (!playing) return;
    increaseAndUpdate();
    var date = new Date(dateInput.property("value"));
    if (date < Date.now()) {
        setTimeout(function() {
            autoIncreaseAndUpdate(); 
        }, 1500);
    }
}

function increaseAndUpdate() {
    var date = new Date(dateInput.property("value"));
    date.setMonth(date.getMonth() + 1);
    dateInput.property("value", (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear());
    loadHistoricalReturnsData(dateInput.property("value"), function() {
        update();
    });
}

function update() { 
  d3.select('#chart1') 
    .datum(historicalData) 
    .call(returnsChart); 
  d3.select('#chart2') 
    .datum(historicalData[historicalData.length - 1].positions) 
    .call(positionsBubbleChart); 
}

function loadHistoricalReturnsData(historicalDate, callback) {
    d3.json('http://localhost.apiary.fool.com/folios/returns/historical.json?HistoricalDate=' + historicalDate + '&portfolioReferenceNum=1', function(returnsData) {
        console.log(returnsData);
        var activePositions = returnsData.Positions.filter(function(p) { return p.UnrealizedShares > 0; });
        historicalData.push({   date: new Date(historicalDate), 
                                returns: returnsData.OverallReturn,
                                positions: activePositions 
                            });
        callback();
    });
}

loadHistoricalReturnsData('2/1/2014', function() {
    update();
});