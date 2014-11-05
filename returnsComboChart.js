d3.fool = d3.fool || {};

d3.fool.returnsComboChart = function module() {
  var margin = {top: 20, right: 20, bottom: 40, left: 40}, 
      width = 500, 
      height = 500,
      ease = "bounce";

  var activeDatePoint;
  var returnsLabel;
  var duration = 1000;
  var dispatch = d3.dispatch('dateChanged');
  var formatPercent = d3.format(".0%");
  var colors = d3.scale.category10();

  function exports(selection, i) {
    selection.each(function(data) { 
        var positionData = data[i].positions;
        var chartW = width - margin.left - margin.right, 
            chartH = height - margin.top - margin.bottom;

        var x1 = d3.time.scale()
            .range([0, chartW])
            .domain(d3.extent(data, function(d) { return d.date }));

        var xTicks = data.length;

        if (data.length === 1) {
          x1.domain([moment(data[0].date).add(-1, 'months').toDate(), moment(data[0].date).add(+1, 'months').toDate()]);
          xTicks = 3;
        }

        var x2 = d3.scale.linear()
            .domain([0, positionData.length])
            .range([0, chartW]);

        var y1 = d3.scale.linear()
            .range([chartH, 0])
            .domain([d3.min([-.5, d3.min(positionData, function(d) { return d.OverallReturn; }) - .5 ]), 
                     d3.max([1, d3.max(positionData, function(d) { return d.OverallReturn; }) + .5 ])]);

        var line = d3.svg.line()
            .x(function(d) { return x1(d.date); })
            .y(function(d) { return y1(d.returns); });

        var xAxis = d3.svg.axis().scale(x1).ticks(xTicks).orient('bottom').tickFormat(d3.time.format("%b %y"));
        var yAxis = d3.svg.axis().scale(y1).orient('left').ticks(6).tickFormat(formatPercent);

        var svg = d3.select(this)
                .selectAll("svg")
                .data([data]);
        var container = svg.enter().append("svg")
          .classed("chart", true)
          .append("g").classed("container-group", true);

        container.append("g").classed("chart-group", true);
        container.append("g").classed("x-axis-group axis", true);
        container.append("g").classed("y-axis-group axis", true);
        container.append("g").classed("label-group", true);

        if (!returnsLabel) {
          returnsLabel = svg.select('.label-group')
                              .attr({ transform: 'translate(' + chartW/2 + ',' + (chartH-50) + ')'})
                              .append('text')
                              .classed("returnsLabel", true);
        }
        updateReturnsLabel(data[data.length-1]);

        if (!activeDatePoint) {
          activeDatePoint = svg.select('.chart-group')
                              .append('circle')
                              .classed("activeDate", true);
        }
        activeDatePoint
          .attr("cx", x1(data[data.length-1].date))
          .attr("cy", y1(data[data.length-1].returns))
          .attr('r', 18)
          .transition()
          .attr('r', 8);

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
      
        var lineGraph = svg.select('.chart-group') 
            .selectAll('path.line')
            .data([data]);

        lineGraph.enter()
            .append("path")
            .attr("class", "line");

        lineGraph.transition().attr("d", line);

        var points = svg.select('.chart-group') 
            .selectAll('.returnDate') 
            .data(data);
                    
        points.enter()
            .append('circle')
            .classed('returnDate', true)
            .on('click', function(d, i) {
                moveActiveDatePoint(this, i);
                updateReturnsLabel(d);
                dispatch.dateChanged(i);
            });
            
        points
            .transition() 
            .attr('data-date', function(d) { return d.date; })
            .attr("cx", function(d) { return x1(d.date); })
            .attr("cy", function(d) { return y1(d.returns); })
            .attr("r", 5);
    
        points.exit()
            .transition()
            .style({ opacity: 0 })
            .remove();

        var positions = svg.select('.chart-group') 
            .selectAll('.position') 
            .data(positionData);
                    
        positions.enter()
            .append('circle')
            .attr("class", "position")
            
        positions
            .transition().duration(duration)
            .attr("cx", function(d, i) { return x2(i+.5); })
            .attr("cy", function(d) { return y1(d.OverallReturn); })
            .attr("r", function(d) { return d3.max([2, d.PercentOfPortfolio * 100]); })
            .attr("fill", "none")
            .attr("stroke", function(d, i) { 
                return colors(i);        
            });
    
        positions.exit()
            .transition()
            .style({ opacity: 0 })
            .remove();

        var labels = svg.select('.chart-group') 
            .selectAll('.positions-label') 
            .data(positionData);
                    
        labels.enter()
            .append('text')
            .attr("class", "positions-label")
            
        labels
            .transition().duration(duration)
                .attr("x", function(d, i) { return x2(i+.5); })
                .attr("y", function(d) { 
                    if (d.PercentOfPortfolio < .10) {
                        if (d.OverallReturn < 0) { return y1(d.OverallReturn) + 18; }
                        return y1(d.OverallReturn) - 12; 
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
                    return "black"; 
                })
    
        labels.exit()
            .transition()
            .style({ opacity: 0 })
            .remove();
    });
  }

  function moveActiveDatePoint(element, dateIndex) {
    var datePoint = d3.select(element);
    activeDatePoint
      .attr("cx", datePoint.attr('cx'))
      .attr("cy", datePoint.attr('cy'))
      .attr('r', 18)
      .transition()
      .attr('r', 8);  
  }

  function updateReturnsLabel(pointData) {
    returnsLabel.text(d3.round(pointData.returns*100,2) + "%");
  }

  exports.setDatePointIndex = function(index) {
    var points = d3.select('.chart-group').selectAll('.returnDate');
    points.each(function(d, i) { 
      if (i === index) { 
        moveActiveDatePoint(this, i);
        updateReturnsLabel(d);
      }
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

  d3.rebind(exports, dispatch, 'on');
 
  return exports;
};