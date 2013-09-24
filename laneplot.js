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
                graphics.redraw();
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
                    } else if (item.startDate) {
                        item.startDate = new Date(item.startDate);
                    } else if (item.endDate) {
                        item.endDate = new Date(item.endDate);
                    } else if (item.progressDate) {
                        item.progressDate = new Date(item.progressDate);
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
        function graphics(laneHeight, laneCount, viewportRealWidth, viewportWidth) {
            // init size
            var zoom = 86400000, //1 day zoom
                unitSize = viewportRealWidth / viewportWidth,
                svgWidth = 1400,
                svgHeight = laneHeight * laneCount + 50;

            // create svg
            var svg = d3.select($(svgWrapper)[0])
                .append("svg:svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight);

            // render lanes
            for (var i = 0; i <= laneCount; i++) {
                svg.append("svg:line")
                    .attr("x1", 0)
                    .attr("y1", i * laneHeight)
                    .attr("x2", svgWidth)
                    .attr("y2", i * laneHeight)
                    .style("stroke", "rgb(233,233,251)")
                    .style("stroke-width", 2);
            };

            // test x Axis
            var t1 = config.settings.boundaries.startDate,
                t2 = config.settings.boundaries.endDate,
                t0 = d3.time.month.offset(t1, -1),
                t3 = d3.time.month.offset(t2, +1);
            var x = d3.time.scale()
                .domain([t0, t3])
                .range([t0, t3].map(d3.time.scale()
                    .domain([t0, t3])
                    .range([0, svgWidth])));
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (svgHeight - 50) + ")")
                .call(xAxis)
                .selectAll("text")
                .attr("y", 6)
                .attr("x", 6)
                .style("text-anchor", "start");

            graphics.redraw = function () {
                // redraw todo
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