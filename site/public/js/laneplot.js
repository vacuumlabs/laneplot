/*!
 * jQuery LanePlot
 * Vacuumlabs @ 2013
 */
(function ($, window, undefined) {

    $.fn.lanePlot = function (options) {

        // default configuration
        var config = $.extend({}, {
                data: [],
                settings: {
                    boundaries: {
                        startDate: null,
                        endDate: null
                    },
                    viewport: {
                        width: 604800000, // 7 days
                        position: null
                    },
                    laneHeight: 2
                },
                onLaneClick: null
            }, options),
            labelContainer = null,
            eventContainer = null,
            svgWrapper = null;

        // init function
        function init(element) {
            // containers/structure
            labelContainer = $('<div/>', {
                'class': 'labelContainer'
            });
            eventContainer = $('<div/>', {
                'class': 'eventContainer'
            });
            svgWrapper = $('<div/>', {
                'class': 'svgWrapper'
            });
            $(eventContainer).append(svgWrapper);
            $(element).addClass('lanePlot');
            $(element)
                .append(eventContainer)
                .append(labelContainer)
                .append('<div class="clearfix"></div>');
            $(element).css('height', config.data.length * config.laneHeight);

            // data init
            processData();

            // lane init
            config.data.forEach(function (lane) {
                createLabel(lane);
            });

            // graphics init
            var g = graphics(
                labelContainer.children('.label').outerHeight(),
                config.data.length,
                $(svgWrapper).width(),
                config.settings.viewport.width
            );

            // window resize
            $(window).resize(function () {
                g.resize($(svgWrapper).width());
            });

            // onClick callback
            if (typeof config.onLaneClick === 'function') {
                $(element).bind('click touchstart', function (e) {
                    var parentOffset = $(this).offset(),
                        relY = e.pageY - parentOffset.top,
                        laneNumber = Math.floor(relY / labelContainer.children('.label').outerHeight());
                    config.onLaneClick(e, config.data[laneNumber]);
                })
            }
        }

        // preprocess data
        function processData() {
            config.data.forEach(function (lane) {
                lane.items.forEach(function (item) {
                    if (item.date) {
                        item.date = new Date(item.date);
                    } else {
                        if (item.startDate) {
                            item.startDate = new Date(item.startDate);
                        }
                        if (item.endDate) {
                            item.endDate = new Date(item.endDate);
                        }
                        if (item.progressDate) {
                            item.progressDate = new Date(item.progressDate);
                        }
                    }
                });
            });

            if (config.settings.boundaries.startDate != null) {
                config.settings.boundaries.startDate = new Date(config.settings.boundaries.startDate);
            }
            if (config.settings.boundaries.endDate != null) {
                config.settings.boundaries.endDate = new Date(config.settings.boundaries.endDate);
            }
            if (config.settings.viewport.position != null) {
                config.settings.viewport.position = new Date(config.settings.viewport.position);
            }
        }

        // create lane label
        function createLabel(lane) {
            var label = $('<div/>', {
                'class': 'label',
                'style': 'height:' + config.settings.laneHeight + 'em;' +
                    'line-height:' + config.settings.laneHeight + 'em;',
                'html': lane.description
            });
            labelContainer.append(label);
        }

        // d3 graphics
        function graphics(laneHeight, laneCount, viewportWidth, viewportMiliseconds) {
            // init size
            var unitSize = viewportWidth / viewportMiliseconds,
                svgWidth = Math.abs(config.settings.boundaries.startDate - config.settings.boundaries.endDate) * unitSize,
                svgHeight = laneHeight * laneCount + 50;

            // create svg
            var svg = d3.select($(svgWrapper)[0])
                .append("svg:svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight);
//                .attr("transform","scale(0.10,1)");

            // render lanes
            var lanesGroup = svg.append("g")
                .attr("class", "lanes");
            for (var i = 0; i < laneCount; i++) {
                lanesGroup.append("svg:line")
                    .attr("x1", 0)
                    .attr("y1", i * laneHeight)
                    .attr("x2", svgWidth)
                    .attr("y2", i * laneHeight)
                    .style("stroke", "rgb(233,233,251)")
                    .style("stroke-width", 2);

                // render items
                config.data[i].items.forEach(function (item) {
//                    svg.append("svg:rect")
//                        .attr("x", Math.ceil(item.startDate * unitSize))
//                        .attr("y", i * laneHeight)
//                        .attr("width", Math.ceil(item.endDate * unitSize))
//                        .attr("height", (i+1) * laneHeight);
                    var margin = 5,
                        recX = Math.abs(item.startDate - config.settings.boundaries.startDate) * unitSize,
                        recY = i * laneHeight + margin,
                        recHeight = laneHeight - 2 * margin,
                        recEndWidth = Math.abs(item.startDate - item.endDate) * unitSize,
                        recProgressWidth = Math.abs(item.startDate - item.progressDate) * unitSize,
                        recClasses = item.classes instanceof Array ? item.classes.join(' ') : '',
                        textX = recX + 2 * margin,
                        textY = recY + recHeight / 2,
                        intervalGroup = svg.append("g")
                            .attr("class", "interval");

                    intervalGroup.append("rect")
                        .attr("x", recX)
                        .attr("y", recY)
                        .attr("width", recEndWidth)
                        .attr("height", recHeight)
                        .attr("rx", 10)
                        .attr("fill", "#DCDCEA");
                    intervalGroup.append("rect")
                        .attr("x", recX)
                        .attr("y", recY)
                        .attr("width", recProgressWidth)
                        .attr("height", recHeight)
                        .attr("rx", 10)
                        .attr("class", recClasses);
                    intervalGroup.append("text")
                        .attr("x", textX)
                        .attr("y", textY)
                        .text(item.label)
                        .attr("alignment-baseline", "middle");
                });
//                for (var j = 0; j < config.data[i].items.length; j++) {
//
//                    console.log(parseFloat(config.data[i]));
//                    console.log(parseFloat(config.data[i].items[j].startDate) * unitSize);
//                    console.log(parseFloat(config.data[i].items[j].endDate) * unitSize);
//                    console.log('-------');
//                }
            };

            // render x axis
            var t1 = config.settings.boundaries.startDate,
                t2 = config.settings.boundaries.endDate;
            var x = d3.time.scale()
                .domain([t1, t2])
                .range([t1, t2].map(d3.time.scale()
                    .domain([t1, t2])
                    .range([0, svgWidth])));
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickSize(-svgHeight)
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0, " + (svgHeight - 50) + ")")
                .call(xAxis)
//                .classed("minor", true)
                .selectAll("text")
                .attr("y", 6)
                .attr("x", 6)
                .style("text-anchor", "start");

            graphics.resize = function (newViewportWidth) {
                var ratio = newViewportWidth / viewportWidth;
//                console.log(viewportWidth, newViewportWidth, ratio);
                viewportWidth = newViewportWidth;
                unitSize = viewportWidth / viewportMiliseconds,
                    svgWidth = Math.abs(config.settings.boundaries.startDate - config.settings.boundaries.endDate) * unitSize;

                svg.attr("width", svgWidth);
                svg.attr("transform", "scale(" + ratio + ",1)");
//                x = d3.time.scale()
//                    .domain([t1, t2])
//                    .range([t1, t2].map(d3.time.scale()
//                        .domain([t1, t2])
//                        .range([0, svgWidth])));
//                xAxis.scale(x);

                return graphics;
            }

            return graphics;
        }

        // initialize every element
        this.each(function (index, element) {
            init(element);
        });

        return this;
    };


})(jQuery, window);