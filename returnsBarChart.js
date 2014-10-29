d3.fool = d3.fool || {};

d3.fool.returnsBarChart = function module() {
  var margin = {top: 20, right: 20, bottom: 40, left: 40}, 
      width = 500, 
      height = 500,
      ease = "bounce";

  var activeDatePoint;
  var returnsLabel;
  var dispatch = d3.dispatch('dateChanged');
  var formatPercent = d3.format(".0%");
  var colors = d3.scale.category10();

  function exports(selection) {
    selection.each(function(data) { 
        var chartW = width - margin.left - margin.right, 
            chartH = height - margin.top - margin.bottom;

        var x1 = d3.time.scale()
            .domain(d3.extent(data, function(d) { return d.date }))
            .range([0, chartW]);

        var y1 = d3.scale.linear()
            .domain([d3.min([-.2, d3.min(data, function(d) { return d.returns; })]), 
                     d3.max([.5, d3.max(data, function(d) { return d.returns; })])])
            .range([chartH, 0]);

        var line = d3.svg.line()
            .x(function(d) { return x1(d.date); })
            .y(function(d) { return y1(d.returns); });

        var xAxis = d3.svg.axis().scale( x1).ticks(data.length).orient('bottom').tickFormat(d3.time.format("%b %y"));
        var yAxis = d3.svg.axis().scale( y1).orient('left').ticks(6).tickFormat(formatPercent);

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
            .data(data.filter(function(d, i) { return i > 0; }));
                    
        points.enter()
            .append('circle')
            .classed('returnDate', true)
            .on('click', function(d, i) {
                moveActiveDatePoint(this, i + 1);
                updateReturnsLabel(d);
                dispatch.dateChanged(i + 1);
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