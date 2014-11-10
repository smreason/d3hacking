d3.fool = d3.fool || {};

d3.fool.portfolioTreeChart = function module() {
    var margin = {top: 20, right: 20, bottom: 40, left: 40}, 
        width = 500, 
        height = 500;

    var _i = 0;

    var tree, diagonal, container;
    var nodes;

    var dispatch = d3.dispatch('portfolioSelected');
    var colors = d3.scale.category20().domain(d3.range(0,20));
    var pie = d3.layout.pie().sort(null);
    var radius = 12;
    var arc = d3.svg.arc().outerRadius(function(d) { return radius; });

    function exports(selection, settings) {
        selection.each(function(data) { 
            chartW = width - margin.left - margin.right; 
            chartH = height - margin.top - margin.bottom;

            var treeData = currentPortfolio === 0 ? buildRootTreeData(data, settings.dateIndex) : buildPortfolioTreeData(data, settings.portfolioIndex, settings.dateIndex);

            tree = d3.layout.tree()
                    .size([chartH, chartW]);

            diagonal = d3.svg.diagonal()
                    .projection(function(d) { return [d.y, d.x]; });

            var svg = d3.select(this)
                .selectAll("svg")
                .data([data]);

            svg.enter().append("svg")
              .classed("chart", true)
              .append("g").classed("container-group", true);

            svg.transition().attr({ width: width, height: height}); 
            container = svg.select('.container-group').attr({ transform: 'translate(' + margin.left + ',' + margin.top + ')'});

            root = treeData;

            root.x0 = chartW / 2; 
            root.y0 = chartH / 2;

            render(root);
        });
    }

    function render(source) {
        var nodes = tree.nodes(source).reverse();
        renderNodes(nodes, source);
        renderPies();
        renderLinks(nodes, source);
    }

    function renderNodes(nodes, source) {
        nodes.forEach(function (d) {
            d.y = d.depth * 180;
        });

        var node = container.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id || (d.id = ++_i);
                });

        var nodeEnter = node.enter().append("svg:g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + source.x0 
                        + "," + source.y0 + ")";
                })
                .on("click", function (d) {
                    toggle(d);
                    render(d);
                });

        nodeEnter.append("svg:circle")
                .attr("r", 1e-6)
                .style("stroke", function(d) {
                    if (d.type === "portfolio") { return "none"; }
                    return d.type !== "position" ? "blue" : colors(d.instrumentId % 20)
                })
                .style("fill", function (d) {
                    return d.type !== "position" ? "lightsteelblue" : "#fff";
                });

        var nodeUpdate = node.transition()
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

        nodeUpdate.select("circle")
                .attr("r", function(d) {
                    return d.type === "position" ? 4.5 : 12;
                })
                .style("fill", function (d) {
                    return d.type !== "position" ? "lightsteelblue" : "#fff";
                });

        var nodeExit = node.exit().transition()
                .attr("transform", function (d) {
                    return "translate(" + source.y 
                        + "," + source.x + ")";
                })
                .remove();

        nodeExit.select("circle").attr("r", 1e-6);
        
        renderLabels(nodeEnter, nodeUpdate, nodeExit);
        renderLogos(nodeEnter, nodeUpdate, nodeExit);
        
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    function renderLabels(nodeEnter, nodeUpdate, nodeExit) {
        nodeEnter.append("svg:text")
                .attr("x", function (d) {
                    return d.children || d._children ? 10 : 35;
                })
                .attr("dy", function (d, i) {
                    return d.children || d._children ?  "-1.35em" : ".2em";
                })
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) {
                    return d.name;
                })
                .style("fill-opacity", 1e-6);
        nodeUpdate.select("text")
                .style("fill-opacity", 1);
        nodeExit.select("text")
                .style("fill-opacity", 1e-6);
    }

    function renderLinks(nodes, source) {
        var link = container.selectAll("path.link")
                .data(tree.links(nodes), function (d) {
                    return d.target.id;
                });
        link.enter().insert("svg:path", "g")
                .attr("class", "link")
                .attr("d", function (d) {
                    var o = {x: source.y0, y: source.x0};
                    return diagonal({source: o, target: o});
                });
        link.transition()
                .attr("d", diagonal);
        link.exit().transition()
                .attr("d", function (d) {
                    var o = {x: source.y, y: source.x};
                    return diagonal({source: o, target: o});
                })
                .remove();
    }

    function renderPies() {
        container.selectAll('g.node')
            .filter(function(d) { return d.type === "portfolio"; })
            .selectAll("path.pie")
            .data(function(d) { 
                var positions = d.children || [0];
                var pieData = pie(d.percents);
                for(var i = 0; i < pieData.length; i++) {
                    pieData[i].position = positions[i];
                }
                return pieData; 
            })
            .enter().append("path")
            .attr("d", arc)
            .style("fill", function(d,i) { 
                return d.position ? colors(d.position.instrumentId % 20) : "lightsteelblue";
            });
    }

    function renderLogos(nodeEnter, nodeUpdate, nodeExit) {
        nodeEnter.filter(function(d) { return d.type === "position"; })
                .append("svg:image")
                .attr("width", 25)
                .attr("height", 25)
                .attr("x", 86)
                .attr("y", -14)
                .attr("xlink:href", function(d) {
                    return "https://g.foolcdn.com/art/companylogos/square/" + d.name + ".png";
                });
                
        // nodeUpdate.select("text")
        //         .style("fill-opacity", 1);
        // nodeExit.select("text")
        //         .style("fill-opacity", 1e-6);
    }

    function toggle(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
    }

    function toggleAll(d) {
        if (d.children) {
            d.children.forEach(toggleAll);
            toggle(d);
        }
    }

    function buildRootTreeData(portfolioData, dateIndex) {
        var parent = {
            name: "All Scorecards",
            children: [],
            percents: [100],
            type: "all"
        };

        for(var prop in portfolioData) {
            if(portfolioData.hasOwnProperty(prop) && prop > 0) {
                portfolio = {
                    name: portfolioData[prop].name,
                    children: [],
                    percents: [],
                    type: "portfolio"
                };
                var positions = portfolioData[prop].data[dateIndex].positions;

                for(var i = 0; i < positions.length; i++) {
                    portfolio.children.push({
                        name: positions[i].Ticker,
                        instrumentId: positions[i].Instrument.InstrumentId,
                        type: "position"
                    });
                    portfolio.percents.push(positions[i].PercentOfPortfolio);
                }

                if (portfolio.percents.length === 0) {
                    portfolio.percents.push(100);
                }
                parent.children.push(portfolio);
            }
        }
        return parent;
    }

    function buildPortfolioTreeData(portfolioData, portfolioNum, dateIndex) {
        var portfolio = {
                name: portfolioData[portfolioNum].name,
                children: [],
                percents: [],
                type: "portfolio"
            };

        var positions = portfolioData[portfolioNum].data[dateIndex].positions;

        for(var i = 0; i < positions.length; i++) {
            portfolio.children.push({
                name: positions[i].Ticker,
                instrumentId: positions[i].Instrument.InstrumentId,
                type: "position"
            });
            portfolio.percents.push(positions[i].PercentOfPortfolio);
        }

        if (portfolio.percents.length === 0) {
            portfolio.percents.push(100);
        }

        return portfolio;
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