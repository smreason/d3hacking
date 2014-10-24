
var chart = d3.fool.barChart();
var chart2 = d3.fool.barChart();
var chart3 = d3.fool.barChart();

fixture = d3.select('body').append('div').classed('test-container', true);

function update() { 
  var data = randomDataset(); 
  d3.select('#chart1') 
    .datum(data) 
    .call(chart); 
    
  var data2 = randomDataset(); 
  d3.select('#chart2') 
    .datum(data2) 
    .call(chart2); 
    
  var charts = fixture.selectAll('div.container')
         .data([data, data2])
         .enter()
         .append('div') 
         .classed('container', true);
         
  charts.datum(function( d, i) { return d;}) 
        .call(chart3);
}

chart.on("customHover", function(d) { console.log("chart1 = " + d); });
chart2.on("customHover", function(d) { console.log("chart2 = " + d); });

function randomDataset() { 
  return d3.range(~~(Math.random() * 8) + 5)
           .map(function(d, i) { 
              return ~~(Math.random() * 1000); 
           }); 
}

update();
//setInterval(update, 3000);
