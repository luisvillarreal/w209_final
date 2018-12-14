/* global d3 */

function scatterPlot() {
    var margin = { top: 20, right: 20, bottom: 70, left: 40 },
        width = 400,
        height = 400,
        innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom,
        xValue = function(d) { return d[0]; },
        yValue = function(d) { return d[1]; },
        xSValue = [-0.51, 3.6006],
        ySValue = [-3.90628731186, 5.5336487262],
        xScale = d3.scaleLinear(),
        yScale = d3.scaleLinear(),
        needToRecalculateScales = true,
        xLabel = "Unemployment",
        yLabel = "Interest";



    function chart(selection) {
        selection.each(function(data) {

            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            // Otherwise, create the skeletal chart.
            var svgEnter = svg.enter().append("svg");
            var gEnter = svgEnter.append("g");
            gEnter.append("g").attr("class", "x axis");
            gEnter.append("g").attr("class", "y axis");

            innerWidth = width - margin.left - margin.right;
            innerHeight = height - margin.top - margin.bottom;

            // Update the outer dimensions.
            svg.merge(svgEnter).attr("width", width)
                .attr("height", height);

            // Update the inner dimensions.
            var g = svg.merge(svgEnter).select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            if (needToRecalculateScales) {
                xScale.range([0, innerWidth])
                     .domain(xSValue);
                    //.domain([d3.min(data, function(d) { return 0.97 * xValue(d); }), d3.max(data, function(d) { return 1.02 * xValue(d); })]);
                yScale.range([innerHeight, 0])
                     .domain(ySValue);
                    //.domain([d3.min(data, function(d) { return 0.97 * yValue(d); }), d3.max(data, function(d) { return 1.02 * yValue(d); })]);
                needToRecalculateScales = false;
            }



            g.select(".x.axis")
                .attr("transform", "translate(0," + innerHeight + ")")
                .call(d3.axisBottom(xScale).ticks(10, "s"));

            g.select(".y.axis")
                .call(d3.axisLeft(yScale).ticks(10, "s"))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Frequency");

       
            //y label


            g
                .append("text")
                .attr("id", "yLabel1")
                //.attr("transform", "rotate(-90)")
                .attr("x", 17)
                .attr("y", -20)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", "12px")
                .text(yLabel);

            // x label
            g.append("text")
                .attr("id", "xLabel1")
                    .attr("transform",
                    "translate(" + (innerWidth / 2) + " ," +
                    (height - 40) + ")")
                .style("text-anchor", "middle")
                .style("font-size", "15px")
                .text(xLabel);

            var points = g.selectAll(".point")
                .data(function(d) { return d; });

            points.enter().append("circle")
                .attr("class", "point")
                .merge(points)
                .attr("cx", X)
                .attr("cy", Y)
                .attr("r", 3);

            points.exit().remove();

        });

    }

    // The x-accessor for the path generator; xScale ∘ xValue.
    function X(d) {
        return xScale(xValue(d));
    }

    // The y-accessor for the path generator; yScale ∘ yValue.
    function Y(d) {
        return yScale(yValue(d));
    }

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.x = function(_) {
        if (!arguments.length) return xValue;
        xValue = _;
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return yValue;
        yValue = _;
        return chart;
    };

    chart.xS = function(_) {
        if (!arguments.length) return xSValue;
        xSValue = _;
        return chart;
    };

    chart.yS = function(_) {
        if (!arguments.length) return ySValue;
        ySValue = _;
        return chart;
    };
    chart.innerWidth = function(_) {
        if (!arguments.length) return innerWidth;
        innerWidth = _;
        return chart;
    };
    chart.innerHeight = function(_) {
        if (!arguments.length) return innerHeight;
        innerHeight = _;
        return chart;
    };
    chart.xScale = function(_) {
        if (!arguments.length) return xScale;
        xScale = _;
        return chart;
    };
    chart.yScale = function(_) {
        if (!arguments.length) return yScale;
        yScale = _;
        return chart;
    };

    chart.xLabel = function(_) {
        if (!arguments.length) return xLabel;
        xLabel = _;
        return chart;
    };
    chart.yLabel = function(_) {
        if (!arguments.length) return xLabel;
        yLabel = _;
        return chart;
    };

    return chart;
}