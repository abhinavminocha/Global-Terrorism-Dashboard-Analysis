function setCountry(error,db)
{

    console.log('setcountry',db);
    let str=db.piedata.split("[");
    let str1=str[1].split("]");
    let str3=str1[0].split('"');
    document.getElementById('country').textContent=str3[1];
}

function ready(err,da){

    data=JSON.parse(da)
    var transformation;
    var iszoomed = false;
    var circle_radius;
    var selected_year;
    var new_data = data;
    var active = d3.select(null);

    var zoom = d3.zoom()
        .scaleExtent([1, 100])
        .on("zoom", zoomed);


   // var cp_width = 701;/////
   var cp_width =  $("#mapdiv").width()
    console.log('width',cp_width);
      var cp_height = 171;/////

    var choropleth = d3.select("#mapdiv")
        .append("svg")
        .attr("class", "choropleth")
        .attr("width", cp_width)
        .attr("height",cp_height)
        .style("margin-top", '5vh')
        .style("margin-left", '2vw')
        .attr("padding-right", '0px');


    var projection = d3.geoMercator()
        .scale(1)
        .translate([1, 0]);


    var path = d3.geoPath()
        .projection(projection);



    var tooltip = d3.select('#piechart')
        .append('div').attr('width',301).attr('height',101)
        .attr('class', 'tooltips').attr('id','map').style('display','none');

    tooltip.append('div')
        .attr('class', 'label');

    tooltip.append('br');

    tooltip.append('div')
        .attr('class', 'count');

    choropleth.append("rect")
        .attr("class", "background")
        .attr("width", cp_width)
        .attr("height", cp_height);

    var g = choropleth.append("g");



    data.forEach(function (d) {
        if (d.country_txt == "United States")
            d.country_txt = "USA";
        d.iyear = +d.iyear;
        d.latitude = +d.latitude;
        d.longitude = +d.longitude;
        d.nkill = +d.nkill;
        d.nwound = +d.nwound;
    });




    d3.json("static/world_countries.json", function (map) {
        var bounds = path.bounds(map);
        var s = 0.95 / Math.max((bounds[1][0] - bounds[0][0]) / cp_width, (bounds[1][1] - bounds[0][1]) / cp_height);
        var t = [(cp_width - s * (bounds[1][0] + bounds[0][0])) / 2, (cp_height - s * (bounds[1][1] + bounds[0][1])) / 2];
        projection
            .scale(s)
            .translate(t);
        d3.select('#mapdiv').select("g")
            .attr("class", "tracts")
            .selectAll("path")
            .data(map.features)
            .enter()
            .append('path')
            .attr("d", path)
            .on("click", clicked)
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("fill", "white")
            .attr("fill-opacity", 0.7);

        var map_data = _.countBy(data, "country_txt");

        Tooltipupdate(map_data);

        updateColors(map_data);

    })

    function clicked(d) {

        country=d.id
        country1= country.toString()
        d3.queue().defer(d3.json, "/reset?country="+country1)
        d3.queue().defer(d3.json, "/getRadial?country="+country1+"&starty=2015&endy=2018")
            .await(drawbubble);
        d3.queue().defer(d3.json, "/getDataPerCountryPie?country="+country1)
            .await(drawpie);
        d3.queue().defer(d3.json, "/getDataPerCountryBar?country=" + country1).await(drawbarchart);

        d3.queue().defer(d3.json, "/getCountryCSV?country=" + country1).await(sankey);


        d3.queue().defer(d3.json, "/getYearAttack?country="+country1)
            .await(drawlinebrush);

        if (active.node() === this) {
            iszoomed = false;
            global_country = "global";


            choropleth.selectAll("circle").remove();

            reset();
        } else {
            if (iszoomed) {
                choropleth.selectAll("circle").remove();
                reset();
            }
            iszoomed = true;
            global_country = d.properties.name;
            active.classed("active", false);
            active = d3.select(this).classed("active", true);

            choropleth.selectAll('path')
                .transition().duration(1000)
                .attr("opacity", 0.3);

            d3.select(this).attr('opacity',1);

            var bounds = path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / cp_width, dy / cp_height))),
                translate = [cp_width / 2 - scale * x, cp_height / 2 - scale * y];

            choropleth.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)); // updated for d3 v4

            addCrime(new_data);
        }
    }

    function reset() {
        active.classed("active", false);
        active = d3.select(null);

        choropleth.selectAll('path')
            .transition().delay(10)
            .attr("opacity", 1);

        choropleth.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
    }

    function zoomed() {
        transformation = d3.event.transform;
        g.attr("transform", d3.event.transform);
        choropleth.selectAll("circle").attr("transform", d3.event.transform);
    }

    function stopped() {
        if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }

    function Tooltipupdate(map_data) {
        choropleth.selectAll("path")
            .on("mouseover", function (d) {
                d3.select(this)
                    .style("fill-opacity", 1);
                tooltip.html(`<span style="font-size:15px;">Country &emsp; : ${d.properties.name}</span><br><span style="font-size:15px;">Total Attacks &emsp; : ${map_data[d.properties.name]==undefined?0:map_data[d.properties.name]}</span>`);
                tooltip.style('display', 'block');

                tooltip.style('top', (d3.event.pageY) + 'px')
                    .style('left', (d3.event.pageX+11) + 'px');
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("fill-opacity", 0.7);
                tooltip.style('display', 'none');
            });
    }

    function updateColors(map_data) {

        var array = Object.values(map_data);

        var min = getPercentile(array, 1);
        var q1 = getPercentile(array, 25);
        var mean = getPercentile(array, 50);
        var q3 = getPercentile(array, 75);
        var max = getPercentile(array, 99);

        var color_domain = [min, q1, mean, q3, max];


        // var cp_color = d3.scaleOrdinal()
        //     .range(["steelblue", "#ac0bff", "#ea08dc","#03cda9","#74e232","#fa0233","#03cda9"])
        //     .domain(color_domain);

        var cp_color =d3.scaleThreshold()
            .range(d3.schemeBlues[7])
            .domain(color_domain);



        choropleth.selectAll('path')
            .transition().duration(500)
            .attr("fill", function (d) {
                if (map_data[d.properties.name]) {
                    return cp_color(map_data[d.properties.name]);
                } else {
                    return cp_color(0);
                }
            });


        var legend_labels = [];
        var ext_color_domain = [];
        ext_color_domain.push(0);

        for (var i = 0; i < color_domain.length; i++) {
            ext_color_domain.push(color_domain[i]);
        }

        for (var i = 0; i < color_domain.length; i++) {
            if (i == 0)
                legend_labels.push("< " + color_domain[i]);
            else
                legend_labels.push((parseInt(color_domain[i - 1]) + 1) + " - " + color_domain[i]);
        }
        legend_labels.push("> " + color_domain[color_domain.length - 1]);

        choropleth.selectAll("g.legend").select("text")
            .transition().duration(500)
            .on("start", function () {
                var t = d3.active(this)
                    .style("opacity", 0);
            })
            .on("end", function () {
                choropleth.selectAll("g.legend").select("text")
                    .text(function (d, i) {
                        return legend_labels[i];
                    })
                    .transition().delay(500).duration(1000)
                    .style("opacity", 1);

            });
    }

    function getPercentile(data, percentile) {
        data.sort(numSort);
        var index = (percentile / 100) * data.length;
        var result;
        if (Math.floor(index) == index) {
            result = (data[(index - 1)] + data[index]) / 2;
        } else {
            result = data[Math.floor(index)];
        }
        if (result == 0) {
            result = 1;
        }
        return result;
    }

    function numSort(a, b) {
        return a - b;
    }

    function addCrime(data) {
        crime_data = data.filter(function (d) {
            return d.country_txt == global_country;
        })
        crime_data.sort(function (x, y) {
            return d3.descending(+x.nkill, +y.nkill);
        });
        var counter = 0;
        crime_data = crime_data.filter(function (d) {
            if (counter < 100) {
                counter++;
                return d;
            }
        });

        choropleth.selectAll("circle")
            .data(crime_data)
            .enter()
            .append("circle")
            .attr("class", "crime")
            .attr("cx", function (d) {
                return projection([d.longitude, d.latitude])[0];
            })
            .attr("cy", function (d) {
                return projection([d.longitude, d.latitude])[1] - 10;
            })
            .style("opacity", 1e-6)
            .style("fill", "steelblue")
            .on("mouseover", function (d) {
                d3.select(this)
                    .style("fill", "brickred");
                tooltip.html(`<span style="font-size:15px;">Terrorist group &emsp; : ${d.gname}</span><br><span style="font-size:15px;">Type of victim &emsp; : ${d.targtype1_txt}</span><br><span style="font-size:15px;">Type of attack &emsp; : ${d.attacktype1_txt}</span><br><span style="font-size:15px;">No of victim killed : ${d.nkill}</span><br><span style="font-size:15px;">No of victim wounded : ${d.nwound}</span>`).style("visibility", "visible");
                tooltip.style('display', 'block');
                tooltip.style('top', (d3.event.pageY) + 'px')
                    .style('left', (d3.event.pageX+11) + 'px');
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("fill", "steelblue");
                tooltip.style('display', 'none');
            })
            .transition().delay(1000).duration(500)
            .attr("cy", function (d) {
                return projection([d.longitude, d.latitude])[1];
            })
            .attr("r", function (d) {
                return d.nkill > 50 ? 2 : 1;
            })
            .style("opacity", 0.7);
    }

    function updateCrime(data) {
        crime_data = data.filter(function (d) {
            return d.country_txt == global_country;
        })
        crime_data.sort(function (x, y) {
            return d3.descending(+x.nkill, +y.nkill);
        });
        var counter = 0;
        crime_data = crime_data.filter(function (d) {
            if (counter < 100) {
                counter++;
                return d;
            }
        });


        var circle = choropleth.selectAll("circle")
            .data(crime_data)

        var t = d3.transition().duration(500);


        circle.exit()
            .attr("class", "exit")
            .transition(t)
            .style("opacity", 1e-6)
            .remove();

        if (crime_data.length > 0) {
            circle.attr("class", "crime")
                .attr("cx", function (d) {
                    return projection([d.longitude, d.latitude])[0];
                })
                .attr("cy", function (d) {
                    return projection([d.longitude, d.latitude])[1];
                })
                .attr("r", function (d) {
                    return d.nkill > 50 ? 2 : 1;
                })
                .style("opacity", 1e-6)
                .style("fill", "#AF7AC5")
                .transition(t)
                .style("opacity", 0.7);


            circle.enter().append("circle")
                .attr("class", "enter")
                .attr("cx", function (d) {
                    return projection([d.longitude, d.latitude])[0];
                })
                .attr("cy", function (d) {
                    return projection([d.longitude, d.latitude])[1];
                })
                .attr("r", function (d) {
                    return d.nkill > 50 ? 2 : 1;
                })
                .on("mouseover", function (d) {
                    d3.select(this)
                        .attr("stroke", "grey")
                        .attr("stroke-wdith", 0.25);
                    tooltip.html(`<span style="font-size:15px;">Terrorist group &emsp; : ${d.gname}</span><br><span style="font-size:15px;">Type of victim &emsp; : ${d.targtype1_txt}</span><br><span style="font-size:15px;">Type of attack &emsp; : ${d.attacktype1_txt}</span><br><span style="font-size:15px;">No of victim killed : ${d.nkill}</span><br><span style="font-size:15px;">No of victim wounded : ${d.nwound}</span>`).style("visibility", "visible");
                    tooltip.style('display', 'block');
                    tooltip.style('top', (d3.event.pageY) + 'px')
                        .style('left', (d3.event.pageX+11) + 'px');
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .attr("stroke", "none");
                    tooltip.style('display','none');
                })
                .style("opacity", 1e-6)
                .transition(t)
                .style("opacity", 0.7);
        }
    }
}

d3.queue().defer(d3.json, "/getCSV?country=USA")
    .await(ready);

d3.queue().defer(d3.json, "/reset?country=All")