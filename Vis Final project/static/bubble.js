function drawbubble(err,dat)
{



    d3.select("#waynebubble svg").remove();
    data=JSON.parse(dat.bardata);
    if(data.length==0)
    {
        document.getElementById('bubble').style.display="block";
    }
    else {
        document.getElementById('bubble').style.display="none";
    }
    var endy=dat.endy, starty=dat.starty;
    console.log('data',data.terrorism);
        var preprocess = function(data){
            var a = []
            var df = _.map(data, function(d) {
                return {
                    'name'   : d.gname,
                    'kill' : + d.nkill,
                }
            });
            df = d3.nest().key(function(d){ return d.name}).entries(df);
            a.children = _.map(df, function(d){
                var key = d.key;
                var kills = d.values.map(z => z.kill).reduce((a,b) => a+b,0);
                return { name:key, kill: +kills}
            }).filter(d => d.name != "Unknown");
            a.children = _.sortBy(a.children,function(d) {
                return d.kill;
            }).reverse();

            return a;
        }
        // var tooltip = d3.select("#waynebubble").append("div")
        //     .attr("id","tooltip").style("font-size","20px");
        var svg = d3.select("#waynebubble")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "181px")
            .attr("class", "bubble");

        var height = 181 , width = $("#waynebubble").width();

        var color = d3.scaleOrdinal(d3.schemeCategory20);

    var tooltip = d3.select('#piechart')
        .append('div').attr('width',100).attr('height',100)
        .attr('class', 'tooltips').style('display','none');

    tooltip.append('div')
        .attr('class', 'label');

    tooltip.append('br');

    tooltip.append('div')
        .attr('class', 'count');

        var df = preprocess(data);

        var pack = d3.pack(df)
            .size([width-5, height-5])
            .padding(1.5);

        draw(df);

        function draw(df){
            // Draw 20 bubbles but only show top 5 text in bubble
            df.children = df.children.slice(0,20);
            var top10 = _.map(df.children.slice(0,5), function(d){
                return d.name;
            });

            // transition
            var t = d3.transition()
                .duration(750);

            var h = d3.hierarchy(df)
                .sum(function(d) { return d.kill; });

            var circle = svg.selectAll("circle")
                .data(pack(h).leaves(), function(d){ return d.data.name; });

            var text = svg.selectAll("text")
                .data(pack(h).leaves(), function(d){ return d.data.name; });

            //EXIT
            circle.exit()
                .style("fill", "#b26745")
                .transition(t)
                .attr("r", 1e-6)
                .remove();

            text.exit()
                .transition(t)
                .attr("opacity", 1e-6)
                .remove();

            console.log(df.children.length);

            if(df.children.length > 1){
                //UPDATE
                circle
                    .transition(t)
                    .style("fill", function(d){ return color(d); })
                    .attr("r", function(d){ return d.r })
                    .attr("cx", function(d){ return d.x; })
                    .attr("cy", function(d){ return d.y; })

                text
                    .attr("x", function(d){ return d.x; })
                    .attr("y", function(d){ return d.y; })
                    .text(function(d){ return $.inArray(d.data.name, top10) > -1 ? (d.r == 0 ? "":d.data.name) : ""; })
                    .style("pointer-events","none")
                    .each(wrap)

                function clicked(d) {
                    console.log('data on click', d);
                    d3.selectAll('circle').attr('opacity',0.3)
                    d3.select(this).attr('opacity',1)
                    terrorist = d.data.name
                    terrorist = terrorist.toString()
                    d3.queue().defer(d3.json, "/getDataPerCountryPie3?country=" + country1+"&starty="+starty+"&endy="+endy+"&terrorist="+terrorist)
                        .await(drawpie);
                    d3.queue().defer(d3.json, "/getDataPerCountryBar3?terrorist="+terrorist)
                        .await(drawbarchart);
                }
                //ENTER
                circle.enter().append("circle")
                    .attr("r", 1e-6)
                    .attr("cx", function(d){ return d.x; })
                    .attr("cy", function(d){ return d.y; })
                    .style("fill", "#fff")
                    .on('click',clicked)
                    .on("mousemove", function(d,i){

                        //d3.select(this).style("fill", "#E74C3C");
                        tooltip.select('.label').html(d.data.name);
                        tooltip.select('.count').html(d.data.kill);
                        tooltip.style('display', 'block');

                        tooltip.style('top', (d3.event.pageY) + 'px')
                            .style('left', (d3.event.pageX+11) + 'px');
                    })
                    .on("mouseout", function (d) {
                        //d3.select(this).style("fill", "steelblue");
                       // d3.selectAll("#tooltip").style("visibility", "hidden");
                        tooltip.style('display', 'none');
                    })
                    .transition(t)
                    .style("fill", function(d){ return color(d); })
                    .attr("r", function(d){ return d.r });

                var mytext = text.enter().append("text")
                    .attr("opacity", 1e-6)
                    .attr("x", function(d){ return d.x; })
                    .attr("y", function(d){ return d.y; })
                    .style("text-anchor", "middle")
                    .text(function(d){ return $.inArray(d.data.name, top10) > -1 ? (d.r == 0 ? "":d.data.name) : ""; })
                    .style("pointer-events","none")
                    .transition(t)
                    .style("fill","#FFF")
                    .attr("opacity", 1).each(wrap);
            }

            function wrap(d) {
                if ( $.inArray(d.data.name, top10) > -1 && d.r > 0){
                    var text = d3.select(this),
                        width = (d.r * 2)-10,
                        x = d.x,
                        y = d.y,
                        words = d.data.name.split(/\s+/),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1;
                    var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);
                    if (words.length > 4){
                        words = words.splice(0,4);
                        words.push("...")
                        words = words.reverse();
                    }else{
                        words = words.reverse();
                    }
                    if(d.r > 50){
                        while (word = words.pop()) {
                            line.push(word);
                            tspan.text(line.join(" "));
                            if (tspan.node().getComputedTextLength() > width) {
                                line.pop();
                                tspan.text(line.join(" "));
                                line = [word];
                                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + "em").text(word);
                            }
                        }
                    }
                }
            }
        }

        this.updatebubble = function(data){
            var df = preprocess(data);
            draw(df);
        }
        return this;
}


d3.queue().defer(d3.json, "/getRadial3?country=All&starty=2015&endy=2018")
    .await(drawbubble);