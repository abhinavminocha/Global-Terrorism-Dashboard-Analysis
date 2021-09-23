function drawpie(error,db) {
    d3.select("#piechart svg").remove();
    data=JSON.parse(db.piedata);
    console.log('pie data',data);
    var endy=db.endy, starty=db.starty;
    var top10 = data.sort(function(a, b) { return a.count < b.count ? 1 : -1; }).slice(0, 10);

    var width = 340,
        height = 161,
        radius = Math.min(width, height) / 2;

    var total=0;
    top10.map(t=>{
        total=total+t.count;
    })


    var fpercent=(total/100)*11;

    var color = d3.scaleOrdinal()
        // .range(["#4682b4", "#7aacd6", "#a0d1fa"]);
        // .range(["#FFF1C9", "#F7B7A3", "#EA5F89", "#9B3192", "#57167E", "#2B0B3F"]);
        .range(["#FFF1C9", "#F7B7A3", "#ffa600", "#ff7c43", "#f95d6a", "#d45087", "#a05195", "#665191", "#2f4b7c", "#003f5c"]);


    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var labelArc1 = d3.arc()
        .outerRadius(radius +73)
        .innerRadius(radius-31);

    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.count; });

    var svg = d3.select("#piechart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width-10) / 2 + "," + (height+21) / 2 + ")");

    var tooltip = d3.select('#piechart')
        .append('div').attr('width',100).attr('height',100)
        .attr('class', 'tooltips').style('display','none');

    tooltip.append('div')
        .attr('class', 'label');

    tooltip.append('br');

    tooltip.append('div')
        .attr('class', 'count');

    var t = d3.transition()
        .duration(750);
    var g = svg.selectAll(".arc")
        .data(pie(top10))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d,i) { return color(i); }).style('stroke','white').style('opacity','0.7').on('click',clicked)
        .on('mouseover', function(d,i) {
            tooltip.select('.label').html(d.data.city);
            tooltip.select('.count').html(d.data.count);
            tooltip.style('display', 'block');

            tooltip.style('top', (d3.event.pageY) + 'px')
                .style('left', (d3.event.pageX+11) + 'px');

            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black").style('opacity','1')
        }).on('mouseout', function() {
        tooltip.style('display', 'none');
        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "white").style('opacity','0.8')
    });


    var legendRectSize = 9;
    var legendSpacing = 4;
    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = (15 * legendRectSize)-40;
            var vert = i * height - offset+1;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);

    legend.append('text')
        .data(data)
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d.city; }).style('font-size','9px');

    function clicked(d) {
        city = d.data.city
        city1 = city.toString()
        d3.queue().defer(d3.json, "/getDataPerCountryBar3?city="+city1+"&starty="+starty+"&endy="+endy)
            .await(drawbarchart);
        d3.queue().defer(d3.json, "/getRadial3?city="+city1)
            .await(drawbubble);
    }
}

d3.queue().defer(d3.json, "/getDataPerCountryPie3?country=All&starty=2015&endy=2018")
    .await(drawpie);
