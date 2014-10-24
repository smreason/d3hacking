
var monsterData = [
            { name:"dragons", power: 18, quantity:6, category: "beast" }, 
            { name:"trolls", power: 12, quantity:18, category: "humanoid" }, 
            { name:"ogres", power: 10, quantity:15, category: "humanoid" }, 
            { name:"gorgons", power: 8, quantity:16, category: "beast" }, 
            { name:"orcs", power: 3, quantity:23, category: "humanoid" }, 
            { name:"goblins", power: 2, quantity:42, category: "humanoid" },
            { name:"wraiths", power: 9, quantity:9, category: "undead" }, 
            { name:"ghouls", power: 3, quantity:8, category: "undead" }, 
            { name:"skeletons", power: 1, quantity:51, category: "undead" }, 
            { name:"demons", power: 15, quantity:6, category: "beast" }, 
            { name:"beholders", power: 17, quantity:3, category: "beast" }, 
            { name:"giants", power: 14, quantity:4, category: "humanoid" }
          ];
            
var groupData = d3.nest()
  .key(function(d) { return d.category; })
  .rollup(function(d) { return d3.sum(d, function(g) {return g.quantity; }); })
  .entries(monsterData);
  
groupData.forEach(function(d) {
 d.name = d.key;
 d.quantity = d.values;
});

var margin = {top: 80, right: 30, bottom: 30, left: 40},
    width = 840 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
var barChart = d3.fool.resuableBarChart().width(width).height(height);
barChart.on('customHover', function(d, i) { console.log('customHover: ' + d.name, i); });

d3.selectAll('.chart')
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
d3.select('#chart1')
    .selectAll('g')
    .datum(monsterData)
    .call(barChart);
    
d3.select('#chart2')
    .selectAll('g')
    .datum(groupData)
    .call(barChart.width(300));
    

   