
var currentPortfolio = 1;
var currentIndex = 0;
var playing = false;

var historicalData = [{ date: new Date('1/1/2014'), returns: 0}];

var dataManager = d3.fool.dataManager(historicalData);
var returnsChart = d3.fool.returnsBarChart().height(400).width(800);
var positionsBubbleChart = d3.fool.positionsBubbleChart().height(400).width(500);

var decreaseButton = d3.select("#decreaseDate");
var dateInput = d3.select("input.date");
var increaseButton = d3.select("#increaseDate");
var playButton = d3.select("#playDate");
var stopButton = d3.select("#stopDate");

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
    if (currentIndex + change < 0) { return; }
    currentIndex = currentIndex + change;
    dateInput.property("value", moment(dateInput.property("value")).add(change, "months").format("L"));
    
    if (currentIndex < historicalData.length) {
        returnsChart.setDatePointIndex(currentIndex-1);
        updatePositions(currentIndex);
    }
    else {
        dataManager.loadHistoricalReturnsData(currentPortfolio, dateInput.property("value"), function(data) {
            historicalData.push(data);
            updateReturns();
            updatePositions(currentIndex);
        });
    }
}

function updateReturns() { 
    d3.select('#chart1') 
        .datum(historicalData) 
        .call(returnsChart); 
}

function updatePositions(i) {
    d3.select('#chart2') 
        .datum(historicalData[i].positions) 
        .call(positionsBubbleChart);
}

returnsChart.on("dateChanged", function(i) { 
    currentIndex = i;
    dateInput.property("value", moment(historicalData[i].date).format("L"));
    updatePositions(i);
});

dataManager.loadHistoricalReturnsData(1, '2/1/2014', function(data) {
    currentIndex++;
    historicalData.push(data);
    updateReturns();
    updatePositions(1);
});
