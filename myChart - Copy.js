
d3.fool = d3.fool || {};

d3.fool.resuableBarChart = function() {
  var height = 500;
  var width = 500;
  var dispatch = d3.dispatch('customHover');
  
  function exports(selection) {
    selection.each(function(data, i) {

      var xScale = d3.scale.ordinal()
                      .domain(data.map(function(d) { return d.name; }))
                      .rangeBands([0, width], .1);
      var yScale = d3.scale.linear()
                      .domain([0, d3.max(data, function(d) { return d.quantity; })])
                      .range([height, 0]);
      
      var container = d3.select(this);
      
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");
                      
      var bar = container.selectAll('g')
        .data(data)
        .enter()
        .append('g')
          .attr("transform", function(d, i) { return "translate(" + xScale(d.name) + ",0)"; });
          
      bar.append('rect')
        .attr('class', 'bar')
        .attr("y", function(d) { return yScale(d.quantity); })
        .attr("width", xScale.rangeBand())
        .attr("height", function(d) { return height - yScale(d.quantity); })
        .on('mouseover', dispatch.customHover);

      bar.append('text')
        .attr("x", xScale.rangeBand() / 2)
        .attr("y", function(d) { return yScale(d.quantity) + 3; })
        .attr("dy", ".75em")
        .text(function(d) { return d.quantity; });
        
      container.append("g")
        .attr("class", "axis")
        .attr("transform", function(d, i) { return "translate(0," + height + ")"; })
        .call(xAxis);
    });
  }
    
  exports.height = function(h) {
    if (!arguments.length) return height;
    height = h;
    return this;
  }
  
  exports.width = function(w) {
    if (!arguments.length) return width;
    width = w;
    return this;
  }
  
  d3.rebind(exports, dispatch, "on");
  return exports;
 }