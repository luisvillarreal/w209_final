/* global d3, crossfilter, scatterPlot, barChart */
var svg = d3.select("#Yield"),
    margin = { top: 20, right: 20, bottom: 110, left: 40 },
    margin2 = { top: 430, right: 20, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%m/%d/%y");

var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);





svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("id", "focus1")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var NanValue = function(entry) {
    if (entry == "N/A") {
        return 0.00;
    } else {
        return entry;
    }
};

var intPeriod = d3.select("#dimensions1");

var brush = d3.brushX()
    .extent([
        [0, 0],
        [width, height2]
    ])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([
        [0, 0],
        [width, height]
    ])
    .extent([
        [0, 0],
        [width, height]
    ])
    .on("zoom", zoomed);


function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.select(".area").attr("d", area);
    focus.select(".axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.select(".area").attr("d", area);
    focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

 var form_val = "3 Yr";
 var form = document.getElementById("dimensions1");
 var area = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return x(d.Date); })
        .y0(height)
        .y1(function(d) { return y(d[form_val]); });

var area2 = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return x2(d.Date); })
        .y0(height2)
        .y1(function(d) { return y2(d[form_val]); });
function createChart(form_val, data) {

    x.domain(d3.extent(data, function(d) { return d.Date; }));
    y.domain([0, d3.max(data, function(d) { return d[form_val]; })]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    d3.select("#x-axis")
        .remove();
    d3.select("#x-axis2")
        .remove();
    d3.select("#y-axis")
        .remove();
    d3.select("#area2")
        .remove();
    d3.select("#zoom")
        .remove();
    d3.select("#brush")
        .remove();
    d3.select("#area")
        .remove();

    focus.append("path")
        .datum(data)
        .attr("id", "area")
        .attr("class", "area")
        .attr("d", area);

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .attr("id", "y-axis")
        .call(yAxis);

    context.append("path")
        .datum(data)
        .attr("id", "area2")
        .attr("class", "area")
        .attr("d", area2);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("id", "x-axis2")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .attr("id", "brush")
        .call(brush)
        .call(brush.move, x.range());

    svg.append("rect")
        .attr("class", "zoom")
        .attr("id", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);




}

d3.csv("data/yield_data_with_s&p.csv", type, function(error, data) {
    if (error) throw error;
    intPeriod.on("change", function() {
        form = document.getElementById("dimensions1");
        form_val;
        for (var i = 0; i < form.length; i++) {
            if (form[i].checked) {
                form_val = form[i].id;
            }
        }
        console.log(form_val);
        createChart(form_val, data);
    });
    createChart("10 Yr", data);

});

function type(d) {
    d.Date = parseDate(d.Date);
    d["1 Mo"] = parseFloat(d["1 Mo"]);
    d["3 Mo"] = parseFloat(d["3 Mo"]);
    d["6 Mo"] = parseFloat(d["6 Mo"]);
    d["1 Yr"] = parseFloat(d["1 Yr"]);
    d["2 Yr"] = parseFloat(d["2 Yr"]);
    d["3 Yr"] = parseFloat(d["3 Yr"]);
    d["5 Yr"] = parseFloat(d["5 Yr"]);
    d["7 Yr"] = parseFloat(d["7 Yr"]);
    d["10 Yr"] = parseFloat(d["10 Yr"]);
    d["20 Yr"] = parseFloat(d["20 Yr"]);
    d["30 Yr"] = parseFloat(d["30 Yr"]);
    d["SP500"] = parseFloat(d["SP500"]);
    d["Unemployment"] = parseFloat(d["Unemployment"]);
    return d;
};
