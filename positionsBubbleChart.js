d3.fool = d3.fool || {};

d3.fool.positionsBubbleChart = function module() {
  var margin = {top: 20, right: 20, bottom: 40, left: 40}, 
      width = 500, 
      height = 500,
      ease = "bounce";

  function exports(selection) {
    selection.each(function(data) { 
        var chartW = width - margin.left - margin.right, 
            chartH = height - margin.top - margin.bottom;

        var duration = 1000;

        var x1 = d3.scale.linear()
            .domain([0, data.length])
            .range([0, chartW]);

        var y1 = d3.scale.linear()
            .domain([d3.min([-.5, d3.min(data, function(d) { return d.OverallReturn; })]), 
                     d3.max([1, d3.max(data, function(d) { return d.OverallReturn; })])])
            .range([chartH, 0]);

        var xAxis = d3.svg.axis().scale( x1).ticks(data.length).orient('bottom'); 
        var yAxis = d3.svg.axis().scale( y1).orient('left');

        var svg = d3.select(this)
                .selectAll("svg")
                .data([data]);
        var container = svg.enter().append("svg")
          .classed("chart", true)
          .append("g").classed("container-group", true);

        container.append("g").classed("chart-group", true);
        container.append("g").classed("x-axis-group axis", true);
        container.append("g").classed("y-axis-group axis", true);

        svg.transition().attr({ width: width, height: height}); 
        svg.select('.container-group').attr({ transform: 'translate(' + margin.left + ',' + margin.top + ')'});

        svg.select('.x-axis-group.axis') 
            .transition() 
            .ease(ease) 
            .attr({ transform: 'translate( 0,' + (chartH) + ')'}) 
            .call(xAxis);

        svg.select('.y-axis-group.axis') 
            .transition() 
            .ease(ease) 
            .call(yAxis);

        var positions = svg.select('.chart-group') 
            .selectAll('.position') 
            .data(data);
                    
        positions.enter()
            .append('circle')
            .attr("class", "position")
            
        positions
            .transition().duration(duration)
            .attr("cx", function(d, i) { return x1(i+1); })
            .attr("cy", function(d) { console.log(d.Ticker + " ( " + d.UnrealizedShares + ") = " + d.OverallReturn); return y1(d.OverallReturn); })
            .attr("r", function(d) { return d3.max([2, d.PercentOfPortfolio * 100]); });
    
        positions.exit()
            .transition()
            .style({ opacity: 0 })
            .remove();

        var labels = svg.select('.chart-group') 
            .selectAll('.positions-label') 
            .data(data);
                    
        labels.enter()
            .append('text')
            .attr("class", "positions-label")
            
        labels
            .transition().duration(duration)
                .attr("x", function(d, i) { return x1(i+1); })
                .attr("y", function(d) { 
                    if (d.PercentOfPortfolio < .10) {
                        return y1(d.OverallReturn) + 15; 
                    }
                    return y1(d.OverallReturn) + 5; 
                })
                .text( function (d) { return d.Ticker; })
                .attr("font-family", "sans-serif")
                .attr("font-size", "20px")
                .attr("fill", function(d) { 
                    if (d.PercentOfPortfolio < .10) {
                        return "black"; 
                    }
                    return "white"; 
                })
    
        labels.exit()
            .transition()
            .style({ opacity: 0 })
            .remove();
    });
  }

  exports.width = function(w) { 
    if (!arguments.length) return width; 
    width = parseInt(w); 
    return this; 
  };
  
  exports.height = function(h) { 
    if (!arguments.length) return height; 
    height = parseInt(h); 
    return this; 
  };
 
  return exports;
};