function drawbarchart(erorr,ddata) {
    d3.select("#barchart svg").remove();
    var opacity =1;
    console.log('data is bar',ddata)
     data= JSON.parse(ddata);
    if(data.length==0)
    {
        document.getElementById('bar').style.display="block";
    }
    else {
        document.getElementById('bar').style.display="none";
    }

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 331 - margin.left - margin.right,
        height = 241 - margin.top - margin.bottom;

    var width1 = 327;
    var height1 = 211;
    var lefts=margin.left+151;
    var tops=margin.top-21;

    var y = d3.scaleBand()
        .range([height, 0])
        .padding(0.5);

    var x = d3.scaleLinear()
        .range([0, width - 20]);

    var y1 = d3.scaleBand()
        .range([height1, 0])
        .padding(0.5);

    var x1 = d3.scaleLinear()
        .range([0, width1]);

    var svg = d3.select('#barchart').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + lefts + "," + tops + ")");

    var tooltip = d3.select('#barchart')
        .append('div').attr('width',101).attr('height',100)
        .attr('class', 'tooltips').style('display','none');

    tooltip.append('div')
        .attr('class', 'label');

    tooltip.append('br');


    tooltip.append('div')
        .attr('class', 'count');

    // format the cricket
    data.forEach(function (d) {
        d.count = +d.count;
    });

    // Scale the range of the cricket in the domains
    x.domain([0, d3.max(data, function (d) {
        return d.count;
    })])
    y.domain(data.map(function (d) {
        return d.attacktype1_txt;
    }));


    let ysum = 35;

    function yy() {
        let temp = ysum;
        ysum = ysum + 46;
        return temp;
    }

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("width", function (d) {
            return x(d.count);
        })
        .attr("y", function (d) {
            return y(d.attacktype1_txt);
        }).attr('fill','steelblue')
        .attr("height", y.bandwidth())
        .on('click',function(d,i){
            svg.selectAll(".bar").attr('opacity',0.3)
            opacity=0.3;
            d3.select(this).attr('opacity',1);
            d3.queue().defer(d3.json, "/getRadial3?attacktype="+d.attacktype1_txt)
                .await(drawbubble);
            d3.queue().defer(d3.json, "/getDataPerCountryPie3?attacktype="+d.attacktype1_txt)
                .await(drawpie);
        })
        .on('mouseover', function(d,i) {
            console.log('barchart tooltip',d);
        tooltip.select('.label').html(d.attacktype1_txt);
        tooltip.select('.count').html(d.count);
        tooltip.style('display', 'block');
        d.attacktype1_txt.length>11?tooltip.style('width',111+d.attacktype1_txt.length+'px'):tooltip.style('width',101+'px');

        tooltip.style('top', (d3.event.pageY) + 'px')
            .style('left', (d3.event.pageX+21) + 'px');

        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "black")
    }).on('mouseout', function() {
        tooltip.style('display', 'none');

        d3.select(this)
            .transition()
            .duration(200)
            //.style("opacity", opacity)
            .style("stroke", "transparent")
    });


    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)).call(g => g.select(".domain").remove()).selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y)).call(g => g.select(".domain").remove());

    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisBottom(x)
            .tickSize(height)
            .tickFormat("")
        ).style('opacity',0.6);
}

d3.queue().defer(d3.json, "/getDataPerCountryBar3?country=All&starty=2015&endy=2018")
    .await(drawbarchart);
