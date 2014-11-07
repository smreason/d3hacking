d3.fool = d3.fool || {};

d3.fool.returnsChart = function module() {
  var margin = {top: 20, right: 20, bottom: 40, left: 40}, 
      width = 500, 
      height = 500,
      returnsType = "returns",
      benchmarkType = "none"
      ease = "bounce";

  var activeDatePoint, activeIndex;
  var PositionDataInstrument;
  var returnsLabel;
  var dispatch = d3.dispatch('dateChanged');
  var formatPercent = d3.format(".0%");
  var colors = d3.scale.category10();

  var chartH, chartW;
  var returnsData;
  var yAxis, xAxis;
  var x1, y1, line;

  function exports(selection) {
    selection.each(function(data) { 
        chartW = width - margin.left - margin.right; 
        chartH = height - margin.top - margin.bottom;

        returnsData = data;
        activeIndex = returnsData.length - 1;

        x1 = d3.time.scale()
            .range([0, chartW])
            .domain(d3.extent(data, function(d) { return d.date }));

        var xTicks = data.length;

        if (data.length === 1) {
          x1.domain([moment(data[0].date).add(-1, 'months').toDate(), moment(data[0].date).add(+1, 'months').toDate()]);
          xTicks = 3;
        }

        y1 = d3.scale.linear()
            .range([chartH, 0])
            .domain([d3.min([-.2, d3.min(returnsData, function(d) { return d.returns; })]), 
                     d3.max([.5, d3.max(returnsData, function(d) { return d.returns; })])]);  

        line = d3.svg.line()
            .interpolate("monotone")
            .x(function(d) { return x1(d.date); })
            .y(function(d) { return y1(d.returns); });

        xAxis = d3.svg.axis().scale( x1).ticks(xTicks).orient('bottom').tickFormat(d3.time.format("%b %y"));

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

        removePositionData();

        if (!returnsLabel) {
          returnsLabel = svg.select('.label-group')
                              .attr({ transform: 'translate(' + chartW/2 + ',' + (chartH-80) + ')'})
                              .append('text')
                              .classed("returnsLabel", true);
        }
        updateReturnsLabel(data[data.length-1]);

        if (!activeDatePoint) {
          activeDatePoint = svg.select('.chart-group')
                              .append('circle')
                              .classed("activeDate", true);
        }

        svg.transition().attr({ width: width, height: height}); 
        svg.select('.container-group').attr({ transform: 'translate(' + margin.left + ',' + margin.top + ')'});

        svg.select('.x-axis-group.axis') 
            .transition() 
            .ease(ease) 
            .attr({ transform: 'translate( 0,' + (chartH) + ')'}) 
            .call(xAxis);
      
        chartReturns();
    });
  }

  function chartReturns() {
    var svg = d3.select('svg');
    var lineGraph = svg.select('.chart-group') 
            .selectAll('path.line')
            .data([returnsData]);

    lineGraph.enter()
        .append("path")
        .attr("class", "line");

    lineGraph.transition().attr("d", line);

    yAxis = d3.svg.axis().scale( y1).orient('left').ticks(6).tickFormat(formatPercent);
    svg.select('.y-axis-group.axis') 
        .transition() 
        .ease(ease) 
        .call(yAxis);

    svg.selectAll('g.y-axis-group.axis g.tick')
            .each(function (d) {
                if (d === 0) {
                    d3.select(this).append('line')
                        .classed('grid-line', true)
                        .attr('x1', 0)
                        .attr('y1', 0)
                        .attr('x2', chartW)
                        .attr('y2', 0);
                }
            });

    activeDatePoint
      .attr("cx", x1(returnsData[activeIndex].date))
      .attr("cy", y1(returnsData[activeIndex].returns))
      .attr('r', 18)
      .transition()
      .attr('r', 8);

    var points = svg.select('.chart-group') 
        .selectAll('.returnDate') 
        .data(returnsData);
                
    points.enter()
        .append('circle')
        .classed('returnDate', true)
        .on('click', function(d, i) {
            activeIndex = i;
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

    chartBenchmark();
  }

  function chartArea(svg) {

  }

  function chartBenchmark() {
    var svg = d3.select('svg');

    if (benchmarkType === "none") {
      svg.selectAll('path.benchmarkline').remove();
      return;
    }

    var benchmarkline = line = d3.svg.line()
            .interpolate("monotone")
            .x(function(d) { return x1(d.date); })
            .y(function(d) { return y1(d[benchmarkType]); });

    var benchmarkGraph = svg.select('.chart-group') 
            .selectAll('path.benchmarkline')
            .data([returnsData]);

    benchmarkGraph.enter()
        .append("path")
        .attr("class", "benchmarkline");

    benchmarkGraph.transition().attr("d", benchmarkline);

    benchmarkGraph.exit().remove();
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
    returnsLabel.text(d3.round(pointData.returns*100,2) + "%")
                .style("fill", function (d) { return pointData.returns < 0 ? "red" : "green"; });
  }

  function removePositionData() {
    d3.selectAll('path.positionReturn').remove();
    d3.selectAll(".positionText").remove();
  }

  exports.showPositionData = function(position) {
    var svg, PositionData;
    var minReturn, maxReturn;

    if (position.instrumentId === PositionDataInstrument) {
      PositionDataInstrument = 0; 
      removePositionData();
      y1.domain([d3.min([-.2, d3.min(returnsData, function(d) { return d.returns; })]), 
                 d3.max([.5, d3.max(returnsData, function(d) { return d.returns; })])]);
      chartReturns(); 
      return;
    }

    PositionDataInstrument = position.instrumentId;
    svg = d3.select("svg");
    PositionData = [];
    returnsData.forEach(function(d) {
      var positions = d.positions.filter(function(p) { return p.Instrument.InstrumentId === position.instrumentId; });
      if (positions.length) {
        PositionData.push({ returns: positions[0].OverallReturn, date: d.date });
      }
    }); 

    var existingLines = svg.select('path.positionReturn');

    if (existingLines.empty()) {
      minReturn = d3.min([-.2, d3.min(PositionData, function(d) { return d.returns; })]);
      maxReturn = d3.max([.5, d3.max(PositionData, function(d) { return d.returns; })]);

      y1.domain([d3.min([minReturn, y1.domain()[0]]), d3.max([maxReturn, y1.domain()[1]])]);
    
      chartReturns(); 
    }
    
    var lineGraph = svg.select('.chart-group') 
        .selectAll('path.instrument' + position.instrumentId)
        .data([PositionData]);

    lineGraph.enter()
        .append("path")
        .attr("class", "positionReturn instrument" + position.instrumentId);

    lineGraph.transition()
      .attr("d", line)
      //.style("stroke-dasharray", ("3, 3"))
      .attr("stroke", position.color);

    lineGraph.exit().remove();

    var bisect = d3.bisector(function(d) { return x1(d.date); }).left;
    var matchIndex = bisect(PositionData, position.x);
    var previousY = y1(PositionData[matchIndex-1].returns);
    var nextY = y1(PositionData[matchIndex].returns);
    var labelYoffset = nextY < chartH * .2 ? -30 : -5;
    
    svg.append('text')
        .classed("positionText", true)
        .attr("x", position.x)
        .attr("y", (previousY+nextY)/2 - labelYoffset)
        .attr("fill", "black")
        .attr("stroke", position.color)
        .text(position.ticker);

    // svg.append("svg:image")
    //   .attr("width", 50)
    //   .attr("height", 50)
    //   .attr("x", position.x)
    //   .attr("y", (previousY+nextY)/2 - labelYoffset)
    //   .attr("xlink:href", "https://g.foolcdn.com/art/companylogos/square/" + position.ticker + ".png")
  }

  exports.setDatePointIndex = function(index) {
    var points;
    activeIndex = index;

    points = d3.select('.chart-group').selectAll('.returnDate');
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

  exports.returnsType = function(rt) { 
    if (!arguments.length) return returnsType; 
    returnsType = rt; 
    return this; 
  };

  exports.benchmarkType = function(bt) { 
    if (!arguments.length) return benchmarkType; 
    benchmarkType = bt; 
    chartBenchmark();
    return this; 
  };

  d3.rebind(exports, dispatch, 'on');
 
  return exports;
};