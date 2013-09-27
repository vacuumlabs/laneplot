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
                g.resize($(svgWrapper).width(), config.settings.viewport.width);
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
            var tBoundaries = {
                'minDate': null,
                'maxDate': null
            };

            // create date objects
            config.data.forEach(function (lane) {
                lane.items.forEach(function (item) {
                    if (item.date) {
                        item.date = new Date(item.date);
                        minMaxDate(item.date, tBoundaries);
                    } else {
                        if (item.startDate) {
                            item.startDate = new Date(item.startDate);
                            minMaxDate(item.startDate, tBoundaries);
                        }
                        if (item.endDate) {
                            item.endDate = new Date(item.endDate);
                            minMaxDate(item.endDate, tBoundaries);
                        }
                        if (item.progressDate) {
                            item.progressDate = new Date(item.progressDate);
                        }
                    }
                });
            });

            // init boundaries
            if (config.settings.boundaries.startDate != null) {
                config.settings.boundaries.startDate = new Date(config.settings.boundaries.startDate);
            } else if (tBoundaries.minDate != null) {
                config.settings.boundaries.startDate = tBoundaries.minDate;
            }
            if (config.settings.boundaries.endDate != null) {
                config.settings.boundaries.endDate = new Date(config.settings.boundaries.endDate);
            } else if (tBoundaries.maxDate != null) {
                config.settings.boundaries.endDate = tBoundaries.maxDate;
            }
            if (config.settings.viewport.position != null) {
                config.settings.viewport.position = new Date(config.settings.viewport.position);
            }
        }

        // find minimum/maximum date
        function minMaxDate(date, tBoundaries) {
            if (config.settings.boundaries.startDate == null
                && (tBoundaries.minDate == null || tBoundaries.minDate > date)) {
                tBoundaries.minDate = date;
            } else if (config.settings.boundaries.endDate == null
                && (tBoundaries.maxDate == null || tBoundaries.maxDate < date)) {
                tBoundaries.maxDate = date;
            }
        }

        // create lane label
        function createLabel(lane) {
            var label = $('<div/>', {
                'class': 'label',
                'style': 'height:' + config.settings.laneHeight + ';' +
                    'line-height:' + config.settings.laneHeight + ';'
            });
            if (lane.icon) {
                var icon = $('<img/>', {
                    'class': 'icon',
                    'style': 'max-height:' + config.settings.laneHeight + 'em;',
                    'src': lane.icon,
                    'alt': 'icon'
                });
                label.append(icon);
                // icon vertical center fix
                icon.load(function () {
                    icon.css('left', parseInt(label.css('padding-left')));
                    label.css('padding-left', parseInt(label.css('padding-left')) + icon.width() + 2);
                });
            }
            label.append(lane.description);
            labelContainer.append(label);
        }

        // d3 graphics
        function graphics(laneHeight, laneCount, viewportWidth, viewportMiliseconds) {
            // init size
            var unitSize = viewportWidth / viewportMiliseconds,
                svgWidth = Math.abs(config.settings.boundaries.startDate - config.settings.boundaries.endDate) * unitSize,
                svgHeight = laneHeight * laneCount + 20,
                svgMargin = 5;
            graphics.viewportWidth = viewportWidth;
            graphics.svgHeight = svgHeight;

            // create svg
            var svg = d3.select($(svgWrapper)[0])
                .append("svg:svg")
                .attr("width", svgWidth + svgMargin)
                .attr("height", svgHeight);

            //scroll to date
            if (config.settings.viewport.position != null) {
                $('.svgWrapper')[0].scrollLeft = Math.abs(config.settings.viewport.position - config.settings.boundaries.startDate) * unitSize;
            }

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
                .tickSize(-svgHeight);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0, " + (svgHeight - 20) + ")")
                .call(xAxis)
                .selectAll("text")
                .attr("y", 6)
                .attr("x", 6)
                .style("text-anchor", "start");

            // render lanes
            var lanesGroup = svg.append("g")
                .attr("class", "lanes");
            for (var i = 0; i < laneCount; i++) {
                lanesGroup.append("svg:path")
                    .attr("d", "M 0 " + (i * laneHeight) + " L " + svgWidth + " " + i * (laneHeight));

                // render items
                config.data[i].items.forEach(function (item) {
                    // EVENT
                    if (item.date) {
                        // skip out of boundaries
                        if (item.date < config.settings.boundaries.startDate) {
                            return true;
                        }
                        // init
                        var textX = Math.abs(item.date - config.settings.boundaries.startDate) * unitSize,
                            textY = i * laneHeight + laneHeight / 2,
                            textLeftPadding = 2,
                            eventClasses = item.classes instanceof Array ? item.classes.join(' ') : '',
                            eventGroup = svg.append("g")
                                .attr("class", "event");

                        // text background
                        var rect = eventGroup.insert("rect");

                        // text
                        var eventText = eventGroup.append("text")
                            .attr("x", textX)
                            .attr("y", textY)
                            .text(item.label)
                            .attr("class", eventClasses)
                            .attr("transform", "translate(" + textLeftPadding + ", 0)")
                            .attr("fullText", item.label);

                        // text dimensions
                        var textWidth = eventText.node().getBBox().width,
                            textHeight = eventText.node().getBBox().height;
                        /* IE fix */
                        var browser = navigator.appName;
                        if (browser == "Microsoft Internet Explorer") {
                            eventText.attr("dy", textHeight / 3);
                        }

                        //icon
                        if (item.icon && item.icon != "") {
                            var img = eventGroup.append("image")
                                .attr("xlink:href", item.icon)
                                .attr("x", textX)
                                .attr("y", textY - textHeight + textHeight / 2)
                                .attr("width", textHeight)
                                .attr("height", textHeight)
                                .attr("transform", "translate(" + textLeftPadding + ", -" + 0 + ")");

                            // increase left padding of event text
                            textLeftPadding = 2 * textLeftPadding + parseInt(img.attr('width'));
                            eventText.attr("transform", "translate(" + textLeftPadding + ", 1)");
                        }

                        // text background setup
                        rect.attr("x", textX + 1)
                            .attr("y", textY - textHeight + textHeight / 2)
                            .attr("width", textWidth + textLeftPadding)
                            .attr("height", textHeight)
                            .attr("fill", "white");

                        // INTERVAL
                    } else {
                        // skip/crop out of boundaries
                        var itemStartDate = item.startDate;
                        if (item.endDate < config.settings.boundaries.startDate) {
                            return true;
                        } else if (item.startDate < config.settings.boundaries.startDate) {
                            item.startDate = config.settings.boundaries.startDate;
                        }

                        //init
                        var margin = 5,
                            rectX = Math.abs(itemStartDate - config.settings.boundaries.startDate) * unitSize,
                            rectY = i * laneHeight + margin,
                            rectHeight = laneHeight - 2 * margin,
                            rectEndWidth = Math.abs(itemStartDate - item.endDate) * unitSize,
                            rectProgressWidth = Math.abs(itemStartDate - item.progressDate) * unitSize,
                            rectClasses = item.classes instanceof Array ? item.classes.join(' ') : '',
                            textLeftPadding = 5,
                            intervalGroup = svg.append("g")
                                .attr("class", "interval");

                        // full interval
                        var rect = intervalGroup.append("rect")
                            .attr("x", rectX)
                            .attr("y", rectY)
                            .attr("width", rectEndWidth)
                            .attr("height", rectHeight)
                            .attr("rx", 5)
                            .attr("class", rectClasses);
                        // progress
                        var progress = intervalGroup.append("rect")
                            .attr("x", rectX)
                            .attr("y", rectY)
                            .attr("width", rectProgressWidth)
                            .attr("height", rectHeight)
                            .attr("rx", 5)
                            .attr("class", rectClasses + " progress");
                        //icon
                        if (item.icon && item.icon != "") {
                            var img = intervalGroup.append("image")
                                .attr("xlink:href", item.icon)
                                .attr("x", rectX)
                                .attr("y", rectY)
                                .attr("width", rectHeight - 4)
                                .attr("height", rectHeight - 4)
                                .attr("transform", "translate(" + textLeftPadding + ", 1)");

                            // increase left padding of interval text
                            textLeftPadding = 2 * textLeftPadding + parseInt(img.attr('width'));
                        }

                        // text
                        var txt = intervalGroup.append("text")
                            .attr("x", rectX)
                            .attr("y", rectY)
                            .text(item.label)
                            .attr("class", rectClasses)
                            .attr("dx", textLeftPadding)
                            .attr("dy", (rectHeight) / 2)
                            .attr("fullText", item.label);
                        /* IE fix */
                        var browser = navigator.appName;
                        if (browser == "Microsoft Internet Explorer") {
                            var txtHeight = txt.node().getBBox().height;
                            txt.attr("dy", "1.3em" );
                        }

                        // text overflow
                        wrapText(txt, rect);
                    }
                });
            }
            ;
            svg.attr('transform', 'translate(4,0)');

            graphics.resize = function (newViewportWidth, viewportMiliseconds) {
                var unitSize = newViewportWidth / viewportMiliseconds,
                    svgWidth = Math.abs(config.settings.boundaries.startDate - config.settings.boundaries.endDate) * unitSize,
                    svgMargin = 5,
                    linearScale = d3.scale.linear()
                        .domain([0, graphics.viewportWidth])
                        .range([0, newViewportWidth]);
                graphics.viewportWidth = newViewportWidth;


                // resize svg
                svg.attr("width", svgWidth + svgMargin);

                // resize lines
                d3.selectAll(".lanes path").each(function () {
                    var settings = d3.select(this).attr('d').split(" ");
                    settings[4] = svgWidth;
                    d3.select(this).attr('d', settings.join(" "));
                });

                // recreate x axis
                d3.select(".x.axis").remove();
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
                    .tickSize(-graphics.svgHeight);

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0, " + (graphics.svgHeight - 20) + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .attr("y", 6)
                    .attr("x", 6)
                    .style("text-anchor", "start");

                // resize/reposition rectangles
                d3.selectAll(".interval rect, .event rect").each(function () {
                    d3.select(this).attr('x', linearScale(d3.select(this).attr('x')));
                    d3.select(this).attr('width', linearScale(d3.select(this).attr('width')));
                });
                // resize/reposition texts and icons
                d3.selectAll(".interval text, .interval image, .event text, .event image").each(function () {
                    d3.select(this).attr('x', linearScale(d3.select(this).attr('x')));
                    //interval text wrap
                    var parent = d3.select(this.parentNode);
                    if (parent.attr('class') == 'interval') {
                        var rect = parent.select('rect');
                        var text = parent.select('text');
                        wrapText(text, rect);
                    }
                });
                return graphics;
            }

            return graphics;
        }

        // wrap long interval text
        function wrapText(svgText, svgRect) {
            var browserFix, browserFix2 = 0;
            /* Firefox fix */
            var browser = navigator.appName;
            if (browser != "Firefox") {
                browserFix = 20;
                browserFix2 = 30;
            }
            svgText.text(svgText.attr('fullText'));
            var rectWidth = svgRect.attr('width');
            var textWidth = svgText.node().getComputedTextLength();
            textWidth += (svgText.attr('x') - svgRect.attr('x'));

            if (textWidth > rectWidth) {
                var words = svgText.text().split(' ');
                var line = new Array();
                var word;
                textWidth = 0;
                while (textWidth < rectWidth) {
                    word = words.shift();
                    line.push(word);
                    svgText.text(line.join(' ') + '...');
                    textWidth = svgText.node().getComputedTextLength();
                    textWidth += (svgText.attr('x') - svgRect.attr('x'));

                }
                word = line.pop();

                //one word
                if (line.length < 1) {
                    while (textWidth > rectWidth && word.length > 2) {
                        word = word.substring(0,word.length-1);
                        svgText.text(word + '...');
                        textWidth = svgText.node().getComputedTextLength();
                        textWidth += (svgText.attr('x') - svgRect.attr('x'));
                        textWidth += browserFix2;
                    }
                } else {
                    svgText.text(line.join(' ') + '...');
                }
            }
        }

        // initialize every element
        this.each(function (index, element) {
            init(element);
        });

        return this;
    };


})(jQuery, window);