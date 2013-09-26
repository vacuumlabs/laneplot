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
                    'line-height:' + config.settings.laneHeight + 'em;'
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
                svgHeight = laneHeight * laneCount + 20;

            // create svg
            var svg = d3.select($(svgWrapper)[0])
                .append("svg:svg")
                .attr("width", svgWidth + 25)
                .attr("height", svgHeight);
//                .attr("transform","scale(0.10,1)");

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
                        var margin = 5,
                            textX = Math.abs(item.date - config.settings.boundaries.startDate) * unitSize,
                            textY = i * laneHeight + margin + laneHeight / 2,
                            eventGroup = svg.append("g");
                        // text
                        eventGroup.attr("class", "event")
                            .append("text")
                            .attr("x", textX)
                            .attr("y", textY)
                            .text(item.label)
                            .attr("class", recClasses)
                            .attr("alignment-baseline", "middle");
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
                            recX = Math.abs(itemStartDate - config.settings.boundaries.startDate) * unitSize,
                            recY = i * laneHeight + margin,
                            recHeight = laneHeight - 2 * margin,
                            recEndWidth = Math.abs(itemStartDate - item.endDate) * unitSize,
                            recProgressWidth = Math.abs(itemStartDate - item.progressDate) * unitSize,
                            recClasses = item.classes instanceof Array ? item.classes.join(' ') : '',
                            textX = recX + 2 * margin,
                            textY = recY + laneHeight / 2,
                            intervalGroup = svg.append("g")
                                .attr("class", "interval");

                        // full interval
                        var rect = intervalGroup.append("rect")
                            .attr("x", recX)
                            .attr("y", recY)
                            .attr("width", recEndWidth)
                            .attr("height", recHeight)
                            .attr("rx", 5)
                            .attr("class", recClasses);
                        // progress
                        var progress = intervalGroup.append("rect")
                            .attr("x", recX)
                            .attr("y", recY)
                            .attr("width", recProgressWidth)
                            .attr("height", recHeight)
                            .attr("rx", 5)
                            .attr("class", recClasses + " progress");
                        //icon
//                        <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 30 40"
//                        width="50" height="30">&Smile;</svg>
                        if (item.icon && item.icon != "") {
//                            var testsvg = intervalGroup.append("svg")
//                                .attr("x", recX)
//                                .attr("y", textY)
//                                .attr("viewBox", "0 0 30 40")
//                                .attr("preserveAspectRatio", "xMidYMid meet");
//                            testsvg.append("image")
//                                .attr("xlink:href", item.icon)
//                                .attr("width", 10)
//                                .attr("height", 10);
//                                .attr("alignment-baseline", "middle");
                        }
                        // text
                        var txt = intervalGroup.append("text")
                            .attr("x", textX)
                            .attr("y", textY)
                            .text(item.label)
                            .attr("class", recClasses)
                            .attr("alignment-baseline", "middle");
                        mywrap(txt, rect);
//                        wordWrap(txt,0);
//                        var bbox = txt.getBBox();
//                        console.log(rect.attr('width'), txt.node().getComputedTextLength() );
//                        console.log(rect.width(), bbox.width());
                    }
                });

//                for (var j = 0; j < config.data[i].items.length; j++) {
//
//                    console.log(parseFloat(config.data[i]));
//                    console.log(parseFloat(config.data[i].items[j].startDate) * unitSize);
//                    console.log(parseFloat(config.data[i].items[j].endDate) * unitSize);
//                    console.log('-------');
//                }
            }
            ;

//            svg.selectAll('.interval text')
//                .each(fontSize)
//                .each(wordWrap);
            // translate (horizontal margin)
//            var aa = d3.select(document.createElement("text"));
//            $(aa).html("ehehheeheh");
//            aa.node().getComputedTextLength();
            svg.attr('transform', 'translate(15)');

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

        function mywrap(svgText, svgRect) {
            var rectWidth = svgRect.attr('width');
            var textWidth = svgText.node().getComputedTextLength();
            textWidth += (svgText.attr('x') - svgRect.attr('x'));
//            console.log(svgText.attr('x') - svgRect.attr('x'));
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
                line.pop()
                svgText.text(line.join(' ') + '...');
            }
        }

//        function fontSize(d, i) {
//            var size = d.dx / 5;
//            var words = d.data.key.split(' ');
//            var word = words[0];
//            var width = d.dx;
//            var height = d.dy;
//            var length = 0;
//            d3.select(this).style("font-size", size + "px").text(word);
//            while (((this.getBBox().width >= width) || (this.getBBox().height >= height)) && (size > 12)) {
//                size--;
//                d3.select(this).style("font-size", size + "px");
//                this.firstChild.data = word;
//            }
//        }
//
//        function wordWrap(d, i) {
//            var words = d.data.key.split(' ');
//            var line = new Array();
//            var length = 0;
//            var text = "";
//            var width = d.dx;
//            var height = d.dy;
//            var word;
//            do {
//                word = words.shift();
//                line.push(word);
//                if (words.length)
//                    this.firstChild.data = line.join(' ') + " " + words[0];
//                else
//                    this.firstChild.data = line.join(' ');
//                length = this.getBBox().width;
//                if (length < width && words.length) {
//                    ;
//                }
//                else {
//                    text = line.join(' ');
//                    this.firstChild.data = text;
//                    if (this.getBBox().width > width) {
//                        text = d3.select(this).select(function () {
//                            return this.lastChild;
//                        }).text();
//                        text = text + "...";
//                        d3.select(this).select(function () {
//                            return this.lastChild;
//                        }).text(text);
//                        d3.select(this).classed("wordwrapped", true);
//                        break;
//                    }
//                    else
//                        ;
//
//                    if (text != '') {
//                        d3.select(this).append("svg:tspan")
//                            .attr("x", 0)
//                            .attr("dx", "0.15em")
//                            .attr("dy", "0.9em")
//                            .text(text);
//                    }
//                    else
//                        ;
//
//                    if (this.getBBox().height > height && words.length) {
//                        text = d3.select(this).select(function () {
//                            return this.lastChild;
//                        }).text();
//                        text = text + "...";
//                        d3.select(this).select(function () {
//                            return this.lastChild;
//                        }).text(text);
//                        d3.select(this).classed("wordwrapped", true);
//
//                        break;
//                    }
//                    else
//                        ;
//
//                    line = new Array();
//                }
//            } while (words.length);
//            this.firstChild.data = '';
//        }

        // initialize every element
        this.each(function (index, element) {
            init(element);
        });

        return this;
    };


})(jQuery, window);