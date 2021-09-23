function sankey(error,data){
    d3.select("#sankey svg").remove()
    d3.select("#tooltipz").remove()
    raw_data=JSON.parse(data);

    var preprocess_sankey = function(raw_data){
        var data = _.map(raw_data, function(d){
            return {
                terrorist_group: d.gname,
                target_type: d.targtype1_txt
            }
        });

        var temp = _.countBy(data.map(g => g.terrorist_group))

        data = d3.nest()
            .key(function(d){return d.terrorist_group})
            .key(function(d){return d.target_type})
            .rollup(function(d){ return d.length })
            .entries(data)
            .filter(d => d.key != "Unknown")
            .sort((a,b) => temp[b.key]-temp[a.key]).splice(0,10);


        var terrorist_group = _.unique(data.map(g => g.key));

        var links = [];
        _.each(data, function(d){
            _.each(d.values, function(p){
                links.push({"source":d.key, "target":p.key, "value":p.value})
            })
        })

        var filtered_target = d3.nest().key(function(d){ return d.target;})
            .rollup(function(d){ return d3.sum(d, function(p){ return p.value; });})
            .entries(links).sort((a,b) => b.value-a.value).splice(0,7).map(a => a.key)
        links = links.filter(d => $.inArray(d.target, filtered_target) > -1);

        var nodes = terrorist_group.concat(filtered_target).map(function(d){
            return {
                "name" : d
            }
        });

        var graph = {"nodes":nodes, "links":links};
        var nodeMap = {};
        graph.nodes.forEach(function(x) { nodeMap[x.name] = x; });
        graph.links = graph.links.map(function(x) {
            return {
                source: nodeMap[x.source],
                target: nodeMap[x.target],
                value: x.value
            };
        });

        return {"terrorist_group":terrorist_group,"sankey_graph":graph}
    }

    var t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear)

    var tooltip = d3.select("#sankey").append("div")
        .attr("id","tooltipz");

    var margin = {top: 10, right: 10, bottom: 10, left: 10};

    var svg = d3.select("#sankey")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .append("g")
        // .attr("transform",
        //     "translate(" + margin.left + "," + margin.top + ")");

    var width = 300 //$("#sankey").width() - margin.left - margin.right-561 ,
        height = 200 //$("#sankey").height() - margin.top - margin.bottom+181;

    var links = svg.append("g").attr("class","links");
    var nodes = svg.append("g").attr("class","nodes");

    var sankey = d3.sankey()
        .nodeWidth(10)
        .nodePadding(10)
        .size([width, height]);

    var processedData = preprocess_sankey(raw_data);
    var graph = processedData.sankey_graph;
    var terrorist_group = processedData.terrorist_group;

    var updateSankey = function(graph, terrorist_group){
        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(32);

        sankey.relayout();

        var path = sankey.link();
        var link = links.selectAll("path")
            .data(graph.links);

        var linkEnter = link.enter().append("path")
            .attr("d", path)
            .attr("class","link")
            .style("stroke-width", function(d) { return Math.max(1, d.dy); })
            .style("stroke-opacity", function(d){
                return d.source.name == terrorist_group[0] ? 0.7 : 0.1
            })
            .classed("selected_sankey", function(d){
                return d.source.name == terrorist_group[0]
            })
            .sort(function(a, b) { return b.dy - a.dy; })
            .on("mousemove", function(d,i){
                if (d3.select(this).classed('selected_sankey')){
                    console.log('tootlitp showing',d);
                    tooltip
                        .style("visibility", "visible")
                        .html(`<span style="font-size:15px;"><b>${d.source.name}</b><br>${d.value} attacks on ${d.target.name}</b></span>`)
                        .style("top", (d3.event.pageY)+"px")
                        .style("left",(d3.event.pageX+10)+"px");

                }
            })
            .on("mouseout", function (d) {
                d3.selectAll("#tooltip").style("visibility", "hidden");
            });;

        link
            .classed("selected_sankey", function(d){
                return d.source.name == terrorist_group[0]
            })
            .sort(function(a, b) { return b.dy - a.dy; })
            .transition(t)
            .attr("d",path)
            .style("stroke-width", function(d) { return Math.max(1, d.dy); })
            .style("stroke-opacity", function(d){
                return d.source.name == terrorist_group[0] ? 0.7 : 0.1
            })

        link.exit().remove();

        var node = nodes.selectAll("g")
            .data(graph.nodes)

        var nodeEnter = node.enter().append('g').attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"; });


        nodeEnter.append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", sankey.nodeWidth())
            .style("fill", "#000")
            .on('click',function(d){
                d3.queue().defer(d3.json, "/getDataPerCountryBar3?terrorist="+d.name)
                    .await(drawbarchart);
                d3.queue().defer(d3.json, "/getDataPerCountryPie3?terrorist="+d.name)
                    .await(drawpie);
            })
            .on("mouseover", function(d){
                console.log('tootltip 2',d);
                links.selectAll("path").style("stroke-opacity", function(x){
                    return d.name == x.source.name ? 0.7 : (d.name == x.target.name ? 0.7 : 0.1)
                });
                links.selectAll("path").classed("selected_sankey", function(x){
                    return d.name == x.source.name || d.name == x.target.name
                });
                tooltip
                    .style("visibility", "visible")
                    .style("top", (d3.event.pageY-70)+"px")
                    .style("left",(d3.event.pageX+10)+"px");
                if( $.inArray(d.name, terrorist_group) > -1){
                    tooltip.html(`<span style="font-size:15px;"><b>${d.name}</b></span><br><span style="font-size:15px;">Attack Count: ${d.value}</span>`)
                }else{
                    tooltip.html(`<span style="font-size:15px;"><b>${d.name}</b></span><br><span style="font-size:15px;">Attacked Count: ${d.value}</span>`)
                }

            })
            .on("mouseout", function (d) {
                d3.selectAll("#tooltip").style("visibility", "hidden");
            });

        node.select('rect')
            .transition(t)
            .attr("height", function(d) { return d.dy; })

        nodeEnter.append("text")
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < width / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        node.select("text").transition(t)
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < width / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        node.exit().remove();
        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; });
    }

    this.updates = function(data){
        var processedData = preprocess_sankey(data);
        var graph = processedData.sankey_graph;
        var terrorist_group = processedData.terrorist_group;
        sankey = d3.sankey()
            .nodeWidth(10)
            .nodePadding(10)
            .size([width, height]);

        updateSankey(graph,terrorist_group);
    }

    updateSankey(graph,terrorist_group);
    return this;
}

d3.queue().defer(d3.json, "/getCSV?country=All")
    .await(sankey);