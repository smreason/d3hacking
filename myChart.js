d3.fool = d3.fool || {};

var get = function(field) {
  return function(obj) {
    return typeof(field) !== 'undefined' ? obj[field] : obj;
  }
};

var compose = function(g,h) {
  return function(d) {
    return g(h(d));
  }
};

d3.fool.barChart = function module() {
  var margin = {top: 20, right: 20, bottom: 40, left: 40}, 
      width = 500, 
      height = 500, 
      gap = 0, 
      ease = 'bounce'; // Use the 'bounce' transition type. 
      
  var svg;
  var dispatch = d3.dispatch('customHover');

  function exports(selection) {
    selection.each(function(data) { 
      var chartW = width - margin.left - margin.right, 
          chartH = height - margin.top - margin.bottom;

      var x1 = d3.scale.ordinal() 
                 .domain(data.map(function(d, i) { return i; })) 
                 .rangeRoundBands([0, chartW], 0.1);
                 
      var y1 = d3.scale.linear() 
                 .domain([0, d3.max(data, get())]) 
                 .range([chartH, 0]);
      
      var xAxis = d3.svg.axis().scale( x1).orient('bottom'); 
      var yAxis = d3.svg.axis().scale( y1).orient('left');

      var barW = chartW / data.length;
      
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

      var gapSize = x1.rangeBand() / 100 * gap; 
      barW = x1.rangeBand() - gapSize;
      
      svg.select('.chart-group')
         .append("linearGradient")				
          .attr("id", "line-gradient")			
          .attr("gradientUnits", "userSpaceOnUse")	
          .attr("x1", 0).attr("y1", 0)			
          .attr("x2", width).attr("y2", 0)		
          .selectAll("stop")						
            .data([								
                {offset: "0%", color: "red"},		
                {offset: "40%", color: "red"},	
                {offset: "40%", color: "black"},		
                {offset: "62%", color: "black"},		
                {offset: "62%", color: "lawngreen"},	
                {offset: "100%", color: "lawngreen"}	
            ])					
          .enter().append("stop")			
            .attr("offset", function(d) { return d.offset; })	
            .attr("stop-color", function(d) { return d.color; });	
      
      var bars = svg.select('.chart-group') 
                    .selectAll('.bar') 
                    .data(data);
                    
      bars.enter()
        .append('rect')
        .classed('bar', true) 
        .attr({ x: chartW, 
                width: barW, 
                y: compose(y1, get()), 
                fill: 'url(#line-gradient)',
                height: function(d, i) { return chartH - y1(d); } }) 
        .on('mouseover', dispatch.customHover);
        
      bars.transition() 
          .ease(ease) 
          .attr({ width: barW, 
                  x: function(d, i) { return x1(i) + gapSize / 2; }, 
                  y: function(d, i) { return y1(d); }, 
                  height: function(d, i) { return chartH - y1(d); } });

      bars.exit()
          .transition()
          .style({ opacity: 0 })
          .remove();

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
 
      exports.gap = function(g) { 
        if (!arguments.length) return gap; 
        gap = parseInt(g); 
        return this; 
      };
      
      exports.ease = function(e) { 
        if (!arguments.length) return ease; 
        ease = parseInt(e); 
        return this; 
      };
    });
  }
  
  d3.rebind(exports, dispatch, 'on');
 
  return exports;
};