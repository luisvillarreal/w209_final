/* global d3, crossfilter, scatterPlot, barChart */
var svg = d3.select("#Yield"),
    margin = { top: 20, right: 20, bottom: (+svg.attr("height") + 20) / 2, left: 40 },
    margin2 = { top: (+svg.attr("height") + 20) / 2, right: 20, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;


var svg_ht1 = (+svg.attr("height") + 20) / 2

var parseDate = d3.timeParse("%m/%d/%y");
var parseYear = d3.timeParse("%y");
var parseMonthDayYear = d3.timeFormat("%b %_d %Y");

var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]),
    tScale = d3.scaleUtc().range([0, 120]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y),
    yAxis2 = d3.axisLeft(y2);

var canvas = svg.append("g")
    .attr("class", canvas);

var width_diff = 156.098;



d3.csv("data/yield_data_with_s&p.csv", type, function(error, data) {
    if (error) throw error;

    var hash = {};

    data.forEach(function(d) {
        hash[d.Date.getTime()] = d;
    });


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
    var intPeriod1 = d3.select("#dimensions2");



    var form_val = "10-1";
    var form_val_1 = "GDP";
    var form = document.getElementById("dimensions1");
    var area = d3.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d[form_val]); });

    var area2 = d3.line()
        .x(function(d) { return x2(d.Date); })
        .y(function(d) { return y2(d[form_val_1]); });

    var bisectDate = d3.bisector(function(d) { return d.Date; }).left;



    function printAxis_context() {
        console.log("Coming here ", form_val_1);
        if (form_val_1 == "GDP") {
            return "GDP % change";
        } else if (form_val_1 == "Unemployment") {
            return "% Unemployment";
        } else if (form_val_1 == "SP500") {
            return "S&P 500 index";
        }
        return "GDP % change";


    }

    function printAxis_focus() {
        if (form_val == "10-1") {
            return "10yr-1yr yield spread (bps)"
        } else if (form_val == "10-2") {
            return "10yr-2yr yield spread (bps)"
        }

    }


    function createChart(form_val, form_val_1) {

        d3.select("#Dim2")
            .text(printAxis_context);

        x.domain(d3.extent(data, function(d) { return d.Date; }));
        y.domain([d3.min(data, function(d) { return 1.1 * d[form_val]; }), d3.max(data, function(d) { return d[form_val]; })]);
        if (form_val_1 == "GDP") {
            y2.domain([d3.min(data, function(d) { return 1.1 * d[form_val_1]; }), d3.max(data, function(d) { return d[form_val_1]; })]);
        } else {
            y2.domain([0, d3.max(data, function(d) { return d[form_val_1]; })]);
        }
        x2.domain(x.domain());
        y2.domain(y2.domain());
        var fiveY = 5 * 365 * 10;
        tScale.domain([0, fiveY]);

        d3.select("#x-axis")
            .remove();
        d3.select("#x-axis2")
            .remove();
        d3.select("#y-axis")
            .remove();
        d3.select("#y-axis2")
            .remove();
        d3.select("#area2")
            .remove();
        d3.select("#zoom")
            .remove();
        d3.select("#brush")
            .remove();
        d3.select("#area")
            .remove();
        d3.select("#cylabel")
            .remove();
        d3.select("#fylabel")
            .remove();

        /*
        focus.append("linearGradient")
        .attr("id", "area")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(50))
        .attr("x2", 0).attr("y2", y(60))
        .selectAll("stop")
        .data([
         {offset: "0%", color: "black"},
         {offset: "50%", color: "black"},
         {offset: "50%", color: "red"},
         {offset: "100%", color: "red"}
        ])
        .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });
        */

        focus.append("path")
            .datum(data)
            .attr("id", "area")
            .attr("class", "area")
            .attr("d", area)
            .attr("stroke", function(d) {
                // console.log("data in line path ", d);
                return (d.forEach(function(d1) { return d1[form_val] <= 0 ? "brick-red" : "blue"; }))
            })
            .on("mousemove", mousemove2)
            .on("mouseout", function() {
                div.style("opacity", 0);
            })
            .on("mouseover", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        //function() {hoverGroup.style("display", null)});
        // .on("mouseover", function() { focus.style("display", null); })
        //.on("mouseout", function() { focus.style("display", "none"); })
        //.on("mousemove", mousemove1);



        function getString() {
            if (form_val_1 == "GDP") {
                return "GDP % change: ";
            } else if (form_val_1 == "Unemployment") {
                return "% Unemployment: ";

            } else {
                return "S&P 500 Index: ";
            }
        }

        function mousemove2() {
            var that = this;
            var x0 = x.invert(d3.mouse(that)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                day = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
            //console.log("value of d in mousemove ", day, "value of i ", i, "Value of mousemove ", +d3.mouse(that)[0]);
            div.html(parseMonthDayYear(day.Date) + "<br/>" + "Spread: " + (day[form_val]).toFixed(3) +
                    " basis pts" + "<br/>" + getString() + (day[form_val_1].toFixed(3)) + "<br/>" + "% SP500_chg: " + (day["SP500_chg"].toFixed(3)))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .style("opacity", .99);
        }

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("id", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .attr("id", "y-axis")
            .call(yAxis);

        focus.selectAll("line").remove();
        focus.append("line")
            .attr("stroke", "Red")
            .attr("x1", x(data[0].Date))
            .attr("x2", x(data[data.length - 1].Date))
            .attr("y1", y(0))
            .attr("y2", y(0));

        context.append("path")
            .datum(data)
            .attr("id", "area2")
            .attr("class", "area")
            .attr("d", area2)
            .on("mousemove", mousemove2)
            .on("mouseout", function() {
                div.style("opacity", 0);
            })
            .on("mouseover", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("id", "x-axis2")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);



        context.selectAll("line").remove();
        if (form_val_1 == "GDP") {
            context.append("line")
                .attr("stroke", "Red")
                .attr("x1", x(data[0].Date))
                .attr("x2", x(data[data.length - 1].Date))
                .attr("y1", y2(0))
                .attr("y2", y2(0));
        }

        var hoverGroup = svg.append("g").style("visibility", "hidden");
        var hoverGroup1 = context.append("g").style("visibility", "hidden");

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        hoverGroup.append("rect")
            .attr("x", 10)
            .attr("y", 0)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", 165)
            .attr("height", 65)
            .attr("fill", "rgb(100,100,100)")
            .attr("stroke", "black");

        var hoverTextBps = hoverGroup.append("text")
            .attr("x", 14)
            .attr("y", 15)
            .style("fill", "white");

        var hoverTextDate = hoverGroup.append("text")
            .attr("x", 14)
            .attr("y", 35)
            .style("fill", "white");

        var hoverTextGDP = hoverGroup.append("text")
            .attr("x", 14)
            .attr("y", 55)
            .style("fill", "white");


        hoverGroup1.append("rect")
            .attr("x", 10)
            .attr("y", 70)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", 165)
            .attr("height", 65)
            .attr("fill", "rgb(100,100,100)")
            .attr("stroke", "black");

        var hoverTextBps1 = hoverGroup1.append("text")
            .attr("x", 14)
            .attr("y", 85)
            .style("fill", "white");

        var hoverTextDate1 = hoverGroup1.append("text")
            .attr("x", 14)
            .attr("y", 105)
            .style("fill", "white");

        var hoverTextGDP1 = hoverGroup1.append("text")
            .attr("x", 14)
            .attr("y", 125)
            .style("fill", "white");

        context.append("g")
            .attr("class", "axis axis--y")
            .attr("id", "y-axis2")
            .call(yAxis2);

        context.append("text")
            .attr("id", "cylabel")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 2)
            .attr("x", -height / 2)
            .attr("dy", ".6em")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text(printAxis_context);

        focus.append("text")
            .attr("id", "fylabel")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 2)
            .attr("x", height - 1.2 * margin.bottom)
            .attr("dy", ".6em")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text(printAxis_focus);





    }


    intPeriod.on("change", reSelectDimensions);

    function get_dimensions(form) {
        for (var i = 0; i < form.length; i++) {
            if (form[i].checked) {
                return form[i].id;
            }
        }

    }

    intPeriod1.on("change", reSelectDimensions);

    createChart(form_val, form_val_1, data);

    function reSelectDimensions() {
        form = document.getElementById("dimensions2");
        form_val_1 = get_dimensions(form);
        form = document.getElementById("dimensions1");
        form_val = get_dimensions(form);
        createChart(form_val, form_val_1, data);
        console.log("form changed: ", form_val, "form_val_1: ", form_val_1);
        //  createChart(form_val, data);
        redraw();
    }

    /* cross filter*/
    //var cs = crossfilter(data);

    //var dimDate = cs.dimension(function(d) { return d.Date; });
    //var dim10Yr = cs.dimension(function(d) { return d["10 Yr"]; });
    //var dimUemp = cs.dimension(function(d) { return d["Unemployment"]; });

    d3.select("#rangeH")
        .attr("min", 0)
        .attr("max", 60)
        .on("input", function() {
            d3.select("#numOfYears")
                .text(+d3.select("#rangeH").property("value"));
            redraw();
        })
        .on("change", function() {
            d3.select("#numOfYears")
                .text(+d3.select("#rangeH").property("value"));
            redraw();
        });

    function get_year_width() {
        var x_tmp = +d3.select("#rangeHandle").property("value");
        var width_in_months = +d3.select("#rangeH").property("value");
        var width_in_years = width_in_months / 12;
        var rem_in_months = width_in_months % 12;
        console.log("x_tmp", x_tmp, "width_years", width_in_years);

        var startDate = x.domain()[0],
            endDate = new Date(startDate).setMonth(startDate.getMonth() + rem_in_months),
            endDate = new Date(endDate).setYear(startDate.getYear() + width_in_years);
        console.log("start", startDate, "end", endDate);
        width_diff = x(endDate) - x(startDate);
        return width_diff;
    }

    d3.select("#rangeHandle")
        .attr("min", margin.left)
        .attr("max", width)
        .on("input", function() {
            redraw();
        })
        .on("change", function() {
            redraw();
        });
    /*     .attr("max", function() {
            return width - get_year_width() + 1;   
        })
        .on("input", function() {
            d3.select("#date")
                .text(function () {
                    var xVal = +d3.select("#rangeHandle").property("value");
                    var width_diff = get_year_width();

                    return parseMonthDayYear(x.invert(xVal + width_diff));
                });
            redraw();
        })
        .on("change", function() {
            d3.select("#date")
                .text(function () {
                    var xVal = +d3.select("#rangeHandle").property("value");
                    var width_diff = get_year_width();

                    return parseMonthDayYear(x.invert(xVal + width_diff));
                });
            redraw();
        });
      //  .on("change", redraw);

*/

    function redraw() {
        var x_tmp = +d3.select("#rangeHandle").property("value");
        var width_in_months = +d3.select("#rangeH").property("value");
        var width_in_years = width_in_months / 12;
        var rem_in_months = width_in_months % 12;
        console.log("x_tmp", x_tmp, "width_years", width_in_years);

        var startDate = x.domain()[0],
            endDate = new Date(startDate).setMonth(startDate.getMonth() + rem_in_months);
        endDate = new Date(endDate).setYear(startDate.getYear() + width_in_years);
        console.log("start", startDate, "end", endDate);
        width_diff = x(endDate) - x(startDate);

        if (x_tmp + width_diff >= width) {
            x_tmp = width - width_diff + margin.right;
        }

        drawHandle(x_tmp, width_diff);

    }

    data.forEach(function(d) {
        // TODO validate if this exist;
        d.offsetD = new Proxy({}, {
            get: function(object, property) {
                return object.hasOwnProperty(property) ? object[property] : 'hello';
            }
        });
    });

    function createScatter(data1, xScale1, yScale1, yScale2) {
        var i = 0;
        var width_in_months = +d3.select("#rangeH").property("value");
        var width_in_years = width_in_months / 12;
        var rem_in_months = width_in_months % 12;
        data1.forEach(function(d) {
            var offsetDateMS = new Date(d.Date).setMonth(d.Date.getMonth() + rem_in_months);
            offsetDateMS = new Date(offsetDateMS).setYear(d.Date.getUTCFullYear() + width_in_years);
            i++;
            // TODO validate if this exist;
            if (i < 2) {
                console.log("Date", d.Date);
            }
            if (offsetDateMS in hash) {
                d.offsetD = hash[offsetDateMS];
            } else {
                var tmpDay = new Date(offsetDateMS).getDate();
                offsetDateMS = new Date(offsetDateMS).setDate(tmpDay + 3);
                if (offsetDateMS in hash) {
                    d.offsetD = hash[offsetDateMS];
                } else {
                    offsetDateMS = new Date(offsetDateMS).setDate(tmpDay + 1);
                    if (offsetDateMS in hash) {
                        d.offsetD = hash[offsetDateMS];
                    } else {
                        offsetDateMS = new Date(offsetDateMS).setDate(tmpDay + 2);
                        if (offsetDateMS in hash) {
                            d.offsetD = hash[offsetDateMS];
                        } else {
                            console.log("This super date does not have a working day 2 days later !!!", new Date(offsetDateMS));
                            console.log("i value = ", i);
                            console.log("d.Date = ", d.Date);
                        }
                    }


                }

            }
            //console.log(i);
        });
        d3.selectAll("#xLabel1").remove();
        d3.selectAll("#yLabel1").remove();

        var unEmpvsInt = scatterPlot()
            .margin({ top: 20, right: 20, bottom: 70, left: 40 })
            .xS(xScale1)
            .yS(yScale1)
            .y(function(d) {
                //console.log(d.offsetD["GDP"]); 
                return d.offsetD[form_val_1];
            })
            .x(function(d) {
                //console.log("f:", d[form_val]); 
                return d[form_val];
            })
            .yLabel(printAxis_context())
            .xLabel(printAxis_focus());


        var sp500vsInt = scatterPlot()
            .margin({ top: 20, right: 20, bottom: 70, left: 40 })
            .xS(xScale1)
            .yS(yScale2)
            .y(function(d) {
                //console.log(d.offsetD["GDP"]); 
                return d.offsetD["SP500_chg"];
            })
            .x(function(d) {
                //console.log("f:", d[form_val]); 
                return d[form_val];
            })
            .yLabel("% daily chg in SP500")
            .xLabel(printAxis_focus);

        var chart2 = d3.select("#chart2")
            .datum(data1)
            .call(sp500vsInt);

        var chart1 = d3.select("#chart1")
            .datum(data1)
            .call(unEmpvsInt);
        yScale2 = [d3.min(data1, function(d) { return 1.02 * d.offsetD["SP500_chg"]; }), d3.max(data, function(d) { return 1.02 * d.offsetD["SP500_chg"]; })];

    }

    function drawHandle(xval, width_diff) {
        console.log("drawHandle", xval, width_diff);

        var handle = svg
            .selectAll(".handle")
            .data([xval]);

        var handleEnter = handle
            .enter()
            .append("g")
            .attr("class", "handle")
            .attr("id", "handle");

        handleEnter
            .append("rect")
            .attr("id", "first")
            .merge(handle.select("#first")) // Enter + Update
            .attr("y", margin.top)
            .attr("height", height - 10)
            .attr("width", 20)
            .style("fill", "firebrick")
            .style("opacity", 0.3)
            .transition()
            .duration(1000)
            .attr("x", xval);

        handleEnter
            .append("rect")
            .attr("id", "end")
            .merge(handle.select("#end")) // Enter + Update
            .attr("y", margin2.top - 10)
            .attr("height", height2 + 10)
            .attr("width", 20)
            .style("fill", "firebrick")
            .style("opacity", 0.3)
            .transition()
            .duration(1000)
            .attr("x", xval + width_diff);

        handleEnter
            .append("rect")
            .attr("id", "middle")
            .merge(handle.select("#middle")) // Enter + Update
            .attr("y", height + 10)
            .attr("height", 20)
            .style("fill", "firebrick")
            .style("opacity", 0.3)
            .transition()
            .duration(1000)
            .attr("width", width_diff + 20)
            .attr("x", xval);

        var x00 = xval - margin.left,
            x01 = xval - margin.left + 20;

        console.log(x.invert(x00));
        console.log(x.invert(x01));

        var xScale1 = [d3.min(data, function(d) { return 1.02 * d[form_val]; }), d3.max(data, function(d) { return 1.02 * d[form_val]; })];
        var yScale1 = [0, d3.max(data, function(d) { return 1.02 * d[form_val_1]; })];
        if (form_val_1 == "GDP") {
            yScale1 = [d3.min(data, function(d) { return 1.02 * d[form_val_1]; }), d3.max(data, function(d) { return 1.02 * d[form_val_1]; })];
        }

        var yScale2 = [d3.min(data, function(d) { return 1.02 * d["SP500_chg"]; }), d3.max(data, function(d) { return 1.02 * d["SP500_chg"]; })];

        var filteredData = data.filter(function(d) {
            return d.Date >= x.invert(x00) && d.Date <= x.invert(x01);
        });

        createScatter(filteredData, xScale1, yScale1, yScale2);
    }

    // function moveHandle(x1) {
    //     handle
    //         .transition()
    //         .duration(1000)
    //         .attr("transform", "translate(" + x1 + ",0)");

    //     var x00 = x1,
    //         x01 = x1 + 20,
    //         x10 = x1 + 100,
    //         x11 = x1 + 120;

    //     dimDate.filter([x.invert(x00), x.invert(x01)]);

    //     console.log(dimDate.filter(x00, x01));

    //     console.log(x.invert(x00));
    //     console.log(x.invert(x01));
    //     console.log(x.invert(x10));
    //     console.log(x.invert(x11));
    //     console.log(x.invert(x1));

    //     handle
    //         .on("change", function() { console.log("coming here!!"); });

    //     createScatter();
    // }



    drawHandle(margin.left, width_diff);

});

var previous_SP500 = 359;

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
    d["SP500_chg"] = (d["SP500"] / previous_SP500 - 1) * 100;
    previous_SP500 = d["SP500"];
    d["10-1"] = d["10 Yr"] - d["1 Yr"];
    d["10-2"] = d["10 Yr"] - d["2 Yr"];
    d["GDP"] = parseFloat(d["GDP"]);
    d["Unemployment"] = parseFloat(d["Unemployment"]);
    return d;
};