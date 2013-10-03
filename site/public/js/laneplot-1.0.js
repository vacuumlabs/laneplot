/*!
 * jQuery lanePlot
 * Version: 1.0
 * Vacuumlabs @ 2013
 */

;
(function ($, window, undefined) {
    // Object.create support for older browsers
    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {
            }

            F.prototype = o;
            return new F();
        };
    }

    var Graphics = {
        svg: {
            elem: null,
            wrapper: null,
            width: 0,
            height: 0,
            minValue: 0,
            maxValue: 0,
            scale: null,
            rectMargin: 5,
            xAxisHeight: 20
        },
        viewport: {
            width: 0,
            milliseconds: 0
        },
        labels: {
            elem: null,
            width: 126,
            height: 0,
            laneHeight: 0
        },
        init: function (svgElem, wrapperElem, labelsElem, laneCount, laneHeight, milliseconds) {
            var self = this;
            self.svg.elem = svgElem;
            self.svg.wrapper = wrapperElem;
            self.labels.elem = labelsElem;
            self.labels.laneCount = laneCount;
            self.labels.laneHeight = laneHeight;
            self.viewport.milliseconds = parseInt(milliseconds);
        },
        update: function (minValue, maxValue) {
            var self = this;

            self.svg.minValue = minValue;
            self.svg.maxValue = maxValue;
            self.viewport.width = self.svg.wrapper.width();
            self.svg.scale = d3.scale.linear()
                .domain([0, self.viewport.milliseconds])
                .range([0, self.viewport.width]);

            self.svg.width = self.svg.scale(Math.abs(maxValue - minValue));
            self.svg.height = self.labels.laneCount * parseInt(self.labels.laneHeight) + self.svg.xAxisHeight;
            self.svg.elem.attr('width', self.svg.width);
            self.svg.elem.attr('height', self.svg.height);
        }
    }

    // LanePlot object concept
    var LanePlotObj = {
        init: function (options, elem) {
            var self = this;
            self.elem = $(elem);
            self.graphics = Object.create(Graphics);

            // extend by default configuration
            self.options = $.extend({}, $.fn.lanePlot.options, options);

            // create DOM structure
            var leftCol = $('<div/>', {
                    'class': 'leftCol'
                }),
                svgWrapper = $('<div/>', {
                    'class': 'svgWrapper'
                }),
                rightCol = $('<div/>', {
                    'class': 'rightCol',
                    'html': svgWrapper
                });
            self.elem
                .addClass('lanePlot')
                .append(rightCol)
                .append(leftCol)
                .append('<div class="clearfix"></div>');
            self.graphics.labels.elem = leftCol;

            // onClick callback
            if (typeof self.options.onLaneClick === 'function') {
                self.elem.bind('click touchstart', function (e) {
                    var parentOffset = $(this).offset(),
                        relY = e.pageY - parentOffset.top,
                        laneNumber = Math.floor(relY / parseInt(self.options.settings.laneHeight));
                    self.options.onLaneClick.call(this, self.options.data[laneNumber]);
                })
            }

            // init graphics
            self.graphics.init(
                d3.select(svgWrapper[0]).append("svg:svg"),
                svgWrapper,
                leftCol,
                self.options.data.length,
                self.options.settings.laneHeight,
                self.options.settings.viewport.width
            );

            // create y/x axis & interval/event groups
            self.graphics.svg.elem.append('g').attr('class', 'xaxis');
            self.graphics.svg.elem.append('g').attr('class', 'yaxis');
            self.graphics.svg.elem.append('g').attr('class', 'items');

            // init lanes
            self.lanes = [];
            if (self.options.data instanceof Array) {
                var index = 0;
                self.options.data.forEach(function (laneData) {
                    // create lane object
                    var lane = Object.create(LaneObj);
                    lane.init(self, laneData, index, self.graphics);
                    lane.render();

                    // add to lane list
                    self.lanes.push(lane);
                    index++;
                });
            }

            // init boundaries
            var settings = self.options.settings;
            if (typeof settings.boundaries.startDate === "string" && settings.boundaries.startDate != '') {
                settings.boundaries.startDate = new Date(settings.boundaries.startDate);
            }
            if (typeof settings.boundaries.endDate === "string" && settings.boundaries.endDate != '') {
                settings.boundaries.endDate = new Date(settings.boundaries.endDate);
            }
            // init viewport start position
            if (typeof settings.viewport.position === "string" && settings.viewport.position != '') {
                settings.viewport.position = new Date(settings.viewport.position);
            }

            // start/end date of boundaries not set => init by minDate, maxDate
            if (!(settings.boundaries.startDate instanceof Date)) {
                settings.boundaries.startDate = self.minDate;
            }
            if (!(settings.boundaries.endDate instanceof Date)) {
                settings.boundaries.endDate = self.maxDate;
            }
        },
        resize: function () {
            var self = this,
                settings = self.options.settings;

            // update graphics (based on date range)
            self.graphics.update(settings.boundaries.startDate, settings.boundaries.endDate);

            // resize lanes
            self.lanes.forEach(function (lane) {
                lane.resize();
                lane.items.forEach(function (item) {
                    item.resize();
                });
            });

            // resize x Axis
            var axisGroup = self.graphics.svg.elem.select(".xaxis"),
                xAxisDomain = [settings.boundaries.startDate, settings.boundaries.endDate],
                xAxisScale = d3.time.scale()
                    .domain(xAxisDomain)
                    .range(xAxisDomain.map(d3.time.scale()
                        .domain(xAxisDomain)
                        .range([0, self.graphics.svg.width]))),
                xAxis = d3.svg.axis()
                    .scale(xAxisScale)
                    .orient("bottom")
                    .tickSize(-(self.graphics.svg.height))
                    .ticks(d3.time.days)
                    .tickFormat(d3.time.format("%d"));

            axisGroup.selectAll().remove();
            axisGroup.attr("transform", "translate(0, " + (self.graphics.svg.height - self.graphics.svg.xAxisHeight) + ")")
                .call(xAxis)
                .selectAll("text")
                .attr("y", 6)
                .attr("x", 6)
                .style("text-anchor", "start");
        }
    }

    // Lane object concept
    var LaneObj = {
        init: function (plot, data, index, graphics) {
            var self = this;
            self.graphics = graphics;
            self.index = index;

            // extend data
            self.data = $.extend({}, $.fn.lanePlot.laneOptions, data);

            // create DOM structure
            self.elem = $('<div/>', {
                'class': 'lane-label',
                'style': 'line-height:' + self.graphics.labels.laneHeight
            });

            if (typeof self.data.icon === "string" && self.data.icon != "") {
                var icon = $('<img/>', {
                    'class': 'icon',
                    'style': 'max-height:' + self.graphics.labels.laneHeight,
                    'src': self.data.icon,
                    'alt': 'lane-icon'
                });
                self.elem.append(icon);
                // icon vertical center fix
                icon.load(function () {
                    icon.css('left', parseInt(self.elem.css('padding-left')));
                    self.elem.css('padding-left', parseInt(self.elem.css('padding-left')) + icon.width() + 2);
                });
            }
            self.elem.append(self.data.description);

            // init items
            if (self.data.items instanceof Array) {
                self.items = [];
                self.data.items.forEach(function (itemData) {
                    var item = null;

                    // if event
                    if (typeof itemData.date === "string" && itemData.date != "") {
                        item = Object.create(EventObj);
                        // if interval
                    } else if (typeof itemData.startDate === "string" && itemData.startDate != "" &&
                        typeof itemData.endDate === "string" && itemData.endDate != "") {
                        item = Object.create(IntervalObj);
                    }

                    item.init(plot, self.index, itemData, self.graphics);
                    // add to item list
                    item.render();
                    self.items.push(item);
                });
            }
        },
        render: function () {
            var self = this;
            // append div label
            self.graphics.labels.elem.append(this.elem);

            // generate lane for y axis
            self.yaxis = self.graphics.svg.elem.select('g.yaxis')
                .append("svg:path");
        },
        resize: function () {
            var self = this,
                lineFunction = d3.svg.line()
                    .x(function (d) {
                        return d.x;
                    })
                    .y(function (d) {
                        return d.y;
                    })
                    .interpolate("linear"),
                lineData = [
                    { "x": 0,
                        "y": (self.index + 1) * parseInt(self.graphics.labels.laneHeight)
                    },
                    { "x": self.graphics.svg.width,
                        "y": (self.index + 1) * parseInt(self.graphics.labels.laneHeight)
                    }
                ];
            self.yaxis.attr("d", lineFunction(lineData));
        }
    }

    // Interval object concept
    var IntervalObj = {
        type: 'interval',
        init: function (plot, laneIndex, data, graphics) {
            var self = this;
            self.graphics = graphics;
            self.laneIndex = laneIndex;

            // extend data
            self.data = $.extend({}, $.fn.lanePlot.intervalOptions, data);

            // parse date
            if (typeof self.data.startDate === "string" && self.data.startDate != "") {
                self.startDate = new Date(self.data.startDate);
            }
            if (typeof self.data.endDate === "string" && self.data.endDate != "") {
                self.endDate = new Date(self.data.endDate);
            }
            if (typeof self.data.progressDate === "string" && self.data.progressDate != "") {
                self.progressDate = new Date(self.data.progressDate);
            } else {
                if (self.endDate instanceof Date) {
                    self.progressDate = self.endDate;
                } else {
                    self.progressDate = null;
                }
            }
            self.minMaxDate(plot, self.startDate, self.endDate);
        },
        render: function () {
            var self = this;

            var itemsGroup = self.graphics.svg.elem.select('g.items');
            self.intervalGroup = itemsGroup.append('g')
                .attr('class', 'interval');

            var classes = self.data.classes.join(" ");
            // main rect
            self.intervalGroup.append("svg:rect")
                .attr("rx", 5)
                .attr("class", classes + " unfinished");

            // progress rect
            self.intervalGroup.append("svg:rect")
                .attr("rx", 5)
                .attr("class", classes + " progress");

            // text
            self.intervalText = $('<div/>', {
                'class': 'intervalText',
                'html': '<span>' + self.data.label + '</span>'
            });

            //icon
            if (typeof self.data.icon === "string" && self.data.icon != "") {
                var intervalIcon = $('<img />', {
                    src: self.data.icon,
                    class: 'intervalIcon'
                });
                self.intervalText.prepend(intervalIcon);
            }

            self.graphics.svg.wrapper.append(self.intervalText);

        },
        minMaxDate: function (plot, startDate, endDate) {
            if (plot.minDate == null || plot.minDate > startDate) {
                plot.minDate = startDate;
            }
            if (plot.maxDate == null || plot.maxDate < endDate) {
                plot.maxDate = endDate;
            }
        },
        resize: function () {
            var self = this;

            // init dimensions
            var rectX = Math.abs(self.startDate - self.graphics.svg.minValue),
                rectY = parseInt(self.graphics.labels.laneHeight) * self.laneIndex + self.graphics.svg.rectMargin,
                progressWidth = Math.abs(self.endDate - self.startDate),
                unfinishedWidth = Math.abs(self.progressDate - self.startDate),
                rectHeight = parseInt(self.graphics.labels.laneHeight) - 2 * self.graphics.svg.rectMargin,
                progressRect = self.intervalGroup.select("rect.progress"),
                unfinishedRect = self.intervalGroup.select("rect.unfinished");

            // scale dimensions
            rectX = self.graphics.svg.scale(rectX);
            progressWidth = self.graphics.svg.scale(progressWidth);
            unfinishedWidth = self.graphics.svg.scale(unfinishedWidth);

            unfinishedRect
                .attr('x', rectX)
                .attr('y', rectY)
                .attr('width', progressWidth)
                .attr('height', rectHeight);

            progressRect
                .attr('x', rectX)
                .attr('y', rectY)
                .attr('width', unfinishedWidth)
                .attr('height', rectHeight);

            // update text div
            self.intervalText
                .css('left', (rectX + 2 * self.graphics.svg.rectMargin).toFixed(2) + 'px')
                .css('top', rectY.toFixed(2) + 'px')
                .css('width', (unfinishedWidth - 2 * self.graphics.svg.rectMargin).toFixed(2))
                .css('height', rectHeight.toFixed(2))
                .css('line-height', rectHeight.toFixed(2) + "px");
            var icon = self.intervalText.children('.intervalIcon')
                .css('max-height', rectHeight.toFixed(2) - 5)
                .css('margin-right', 5);
            // icon vertical center fix
            icon.load(function () {
                self.intervalText.children('span').css('padding-left', icon.width() + 5);
            });
        }
    }

    // Event object concept
    var EventObj = {
        type: 'event',
        init: function (plot, laneIndex, data, graphics) {
            var self = this;
            self.graphics = graphics;
            self.laneIndex = laneIndex;

            // extend data
            self.data = $.extend({}, $.fn.lanePlot.eventOptions, data);

            // parse date
            if (typeof data.date === "string" && data.date != "") {
                self.date = new Date(data.date);
            }
            self.minMaxDate(plot, self.date);
        },
        render: function () {
            var self = this;

            // text
            self.eventText = $('<div/>', {
                'class': 'eventText',
                'html': '<span>' + self.data.label + '</span>'
            });

            //icon
            if (typeof self.data.icon === "string" && self.data.icon != "") {
                var intervalIcon = $('<img />', {
                    src: self.data.icon,
                    class: 'intervalIcon'
                });
                self.eventText.prepend(intervalIcon);
            }

            self.graphics.svg.wrapper.append(self.eventText);
        },
        minMaxDate: function (plot, date) {
            if (plot.minDate == null || plot.minDate > date) {
                plot.minDate = date;
            }
            if (plot.maxDate == null || plot.maxDate < date) {
                plot.maxDate = date;
            }
        },
        resize: function () {
            var self = this;

            // init dimensions
            var textX = Math.abs(self.date - self.graphics.svg.minValue),
                textY = parseInt(self.graphics.labels.laneHeight) * self.laneIndex,
                textHeight = parseInt(self.graphics.labels.laneHeight);

            // scale dimensions
            textX = self.graphics.svg.scale(textX);

            // update text div
            self.eventText
                .css('left', textX.toFixed(2) + 'px')
                .css('top', textY.toFixed(2) + 'px')
                .css('height', textHeight)
                .css('line-height', self.graphics.labels.laneHeight);
            var icon = self.eventText.children('.intervalIcon')
                .css('max-height', textHeight - 5)
                .css('margin-right', 5);
            // icon vertical center fix
            icon.load(function () {
                self.eventText.children('span').css('padding-left', icon.width() + 2);
            });
        }
    }

    // plot initialization
    $.fn.lanePlot = function (options) {
        // initialize every element
        this.each(function (index, element) {
            // init lanePlot
            var lanePlot = Object.create(LanePlotObj);
            lanePlot.init(options, element);
            lanePlot.resize();

            // window resize
            $(window).resize(function () {
                lanePlot.resize();
            });
        });
    }

    // default LanePlot configuration
    $.fn.lanePlot.options = {
        data: [],
        settings: {
            boundaries: {
                startDate: null,
                endDate: null
            },
            viewport: {
                width: 2629743830, // month
                position: null
            },
            laneHeight: '20px'
        },
        onLaneClick: null
    }

    // default Lane configuration
    $.fn.lanePlot.laneOptions = {
        id: null,
        description: "",
        icon: "",
        classes: "",
        items: []
    }

    // default Interval configuration
    $.fn.lanePlot.intervalOptions = {
        startDate: null,
        endDate: null,
        progressDate: null,
        icon: "",
        classes: [],
        label: ""
    }

    // default Event configuration
    $.fn.lanePlot.eventOptions = {
        date: null,
        icon: "",
        classes: [],
        label: ""
    }
})(jQuery, window);