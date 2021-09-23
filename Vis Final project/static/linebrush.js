var country1="";
function getCountry(err,dat)
{
    country1=dat.country;
}

function drawlinebrush(error,db) {
    d3.select("#linebrush svg").remove();
    var check=false;
    data = JSON.parse(db.bardata)
    data1= JSON.parse(db.bardata)
    country1=db.country;

    var margin = {top: 20, right: 20, bottom: 110, left: 50},
        margin2 = {top: 430, right: 20, bottom: 30, left: 40};
        var width = 710 - margin.left - margin.right-351,
        height = 441 - margin.top - margin.bottom-151,
        height2 = 481 - margin2.top - margin2.bottom;

    var svg = d3.select("#linebrush").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom).attr('fill','none');

    var parseDate = d3.timeParse("%m %Y");

    data.forEach(function (d) {
        d.iyear=d.imonth+' '+d.iyear;
        d.iyear=parseDate(d.iyear);
        d.count = +d.count;
    });

    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);

    var xAxis = d3.axisBottom(x).ticks(5),
        xAxis2 = d3.axisBottom(x2).ticks(5),
        yAxis = d3.axisLeft(y);

    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("end", brushed).on('brush',moving);

    var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    var area = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return x(d.iyear); })
        .y0(height)
        .y1(function(d) { return y(d.count); });

    var area2 = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return x2(d.iyear); })
        .y0(height2)
        .y1(function(d) { return y2(d.count); });

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + (margin.top-21) + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + 50 + "," + 191 + ")");


        x.domain(d3.extent(data, function(d) { return d.iyear; }));
        y.domain([0, d3.max(data, function(d) { return d.count; })]);
        x2.domain(x.domain());
        y2.domain(y.domain());

        focus.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area);

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        context.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area2);

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());

        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);

        function moving()
        {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = d3.event.selection || x2.range();
            x.domain(s.map(x2.invert, x2));
            focus.select(".area").attr("d", area);
            focus.select(".axis--x").call(xAxis);
            svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));
        }

    function brushed() {
        var extent = brush.extent();
        var selection = d3.event.selection.map(x.invert);
        var temp;
        var temp=JSON.stringify(selection[0]);
        var temp1=temp.split('-');
        temp1[0]=temp1[0].replace('"','')

        if(temp1[0]=='2014')
        {
            temp1[0]='2015';
        }
        temp=JSON.stringify(selection[1]);
        var temp3=temp.split('-');
        temp3[0]=temp3[0].replace('"','');
        if(check!=false) {
            d3.queue().defer(d3.json, "/getDataPerCountryPie3?country=" + country1 + "&starty=" + temp1[0] + "&startm=" + temp1[1] + "&endy=" + temp3[0] + "&endm" + temp3[1])
                .await(drawpie);
            d3.queue().defer(d3.json, "/getDataPerCountryBar3?country=" + country1 + "&starty=" + temp1[0] + "&startm=" + temp1[1] + "&endy=" + temp3[0] + "&endm" + temp3[1])
                .await(drawbarchart);

            d3.queue().defer(d3.json, "/getYearCSV?country=" + country1 + "&starty=" + temp1[0] + "&startm=" + temp1[1] + "&endy=" + temp3[0] + "&endm" + temp3[1])
                .await(sankey);

            d3.queue().defer(d3.json, "/getRadial3?country="+ country1 + "&starty=" + temp1[0] + "&startm=" + temp1[1] + "&endy=" + temp3[0] + "&endm" + temp3[1])
                .await(drawbubble);

        }
        else
        {
            check=true;
        }

    }

    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        x.domain(t.rescaleX(x2).domain());
        focus.select(".area").attr("d", area);
        focus.select(".axis--x").call(xAxis);
        context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }

    function type(d) {
        d.date = parseDate(d.iyear);
        d.price = +d.count;
        return d;
    }
}

d3.queue().defer(d3.json, "/getYearAttack?country=All")
    .await(drawlinebrush);