d3.fool = d3.fool || {};

d3.fool.returnsChart = function module() {
  var margin = {top: 20, right: 20, bottom: 40, left: 40}, 
      width = 500, 
      height = 500,
      ease = "bounce";

  var activeDatePoint, activeIndex;
  var priceDataInstrument;
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

        removePriceData();

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

  function removePriceData() {
    d3.selectAll('path.instrument').remove();
  }

  exports.showPriceData = function(position) {
    var svg, priceData;
    var minReturn, maxReturn;

    y1 = d3.scale.linear()
        .range([chartH, 0])
        .domain([d3.min([-.2, d3.min(returnsData, function(d) { return d.returns; })]), 
                 d3.max([.5, d3.max(returnsData, function(d) { return d.returns; })])]);

    if (position.instrumentId === priceDataInstrument) {
      priceDataInstrument = 0; 
      removePriceData();
      chartReturns(); 
      return;
    }

    priceDataInstrument = position.instrumentId;
    svg = d3.select("svg");
    priceData = [];
    returnsData.forEach(function(d) {
      var positions = d.positions.filter(function(p) { return p.Instrument.InstrumentId === position.instrumentId; });
      if (positions.length) {
        priceData.push({ returns: positions[0].OverallReturn, date: d.date });
      }
    }); 

    minReturn = d3.min([-.2, d3.min(priceData, function(d) { return d.returns; })]);
    maxReturn = d3.max([.5, d3.max(priceData, function(d) { return d.returns; })]);

    y1 = d3.scale.linear()
      .range([chartH, 0])
      .domain([d3.min([minReturn, y1.domain()[0]]), d3.max([maxReturn, y1.domain()[1]])]);
    
    chartReturns(); 

    var lineGraph = svg.select('.chart-group') 
        .selectAll('path.positionReturn')
        .data([priceData]);

    lineGraph.enter()
        .append("path")
        .attr("class", "positionReturn");

    lineGraph.transition()
      .attr("d", line)
      .attr("stroke", position.color);

    lineGraph.exit().remove();
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

  d3.rebind(exports, dispatch, 'on');
 
  return exports;
};