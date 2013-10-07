/*!
 * jQuery VacuumGantt
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

    var Graphics = function () {
        var self = this;

        this.svg = {
            elem: null,
            wrapper: null,
            width: 0,
            height: 0,
            minValue: 0,
            maxValue: 0,
            scale: null,
            rectMargin: 5,
            timelinesCount: 1,
            xAxisHeight: 20,
            eventOverflow: 0,
            gradients: [],
            position: 0,
            padding: 5
        };
        this.timelines = [];
        this.viewport = {
            width: 0,
            milliseconds: 0
        };
        this.labels = {
            elem: null,
            width: 126,
            height: 0,
            laneHeight: 0
        };
        this.errorCallback = null;
        this.init = function (svgElem, wrapperElem, labelsElem, laneCount, laneHeight, milliseconds, timelines, errorCallback) {
            if (parseInt(laneHeight) <= 0) {
                this.errorMsg(
                    'ERR_BAD_HEIGHT',
                    laneHeight)
            }
            self.svg.elem = svgElem;
            self.svg.wrapper = wrapperElem;
            self.labels.elem = labelsElem;
            self.labels.laneCount = laneCount;
            self.labels.laneHeight = laneHeight;
            self.viewport.milliseconds = parseInt(milliseconds);

            if (!(timelines instanceof Array) || timelines.length == 0) {
                self.timelines.push({
                    resolution: Math.ceil(self.viewport.milliseconds),
                    dateFormat: "MM-DD"
                });
            } else {
                self.timelines = timelines;
            }
            self.errorCallback = errorCallback;
        };
        this.update = function (minValue, maxValue) {
            if (minValue && maxValue) {
                self.svg.minValue = minValue;
                self.svg.maxValue = maxValue;
                self.viewport.width = self.svg.wrapper.width();
                self.svg.scale = d3.scale.linear()
                    .domain([0, self.viewport.milliseconds])
                    .range([0, self.viewport.width]);

                self.svg.width = self.svg.scale(Math.abs(maxValue - minValue));
                self.svg.elem.attr('width', self.svg.width + self.svg.eventOverflow + self.svg.padding);
            }
            var timelinesHeight = self.svg.xAxisHeight * self.timelines.length;
            self.svg.height = self.labels.laneCount * parseInt(self.labels.laneHeight) + timelinesHeight;
            self.svg.elem.attr('height', self.svg.height);
            self.svg.elem.attr('transform', 'translate(4,0)');
        }
        this.generateGradient = function (color) {
            // check if exists
            var gradientId = ""
            self.svg.gradients.forEach(function (gradient) {
                if (gradient.color0 == color[0] && gradient.color1 == color[1]) {
                    gradientId = gradient.id;
                }
            })

            if (gradientId != "") {
                return gradientId;
            }

            // create gradient
            gradientId = 'gradient' + self.svg.gradients.length;
            var svg = self.svg.elem;
            var gradient = svg.append("svg:defs")
                .append("svg:linearGradient")
                .attr("id", gradientId)
                .attr("x1", "100%")
                .attr("y1", "100%")
                .attr("x2", "100%")
                .attr("y2", "0%");
            gradient.append("svg:stop")
                .attr("offset", "0")
                .attr("stop-color", color[0]);
            gradient.append("svg:stop")
                .attr("offset", "1")
                .attr("stop-color", color[1]);

            self.svg.gradients.push({
                color0: color[0],
                color1: color[1],
                id: "#" + gradientId
            });

            return "#" + gradientId;
        };
        this.progressPolygon = function rounded_rect(x, y, w, h, r, full) {
            var retval;
            if (full) {
                retval = "M " + (x + r) + "," + y;
                retval += " h " + (w - 2 * r);
                retval += " a " + r + "," + r + " 0 0 1 " + r + "," + r;
                retval += " v " + (h - 2 * r);
                retval += " a " + r + "," + r + " 0 0 1 " + -r + "," + r;
                retval += " h " + (2 * r - w);
                retval += " a " + r + "," + r + " 0 0 1 " + -r + "," + -r;
                retval += " v " + (2 * r - h);
                retval += " a " + r + "," + r + " 0 0 1 " + r + "," + -r;
                retval += " z";
            } else {
                retval = "M " + (x + r) + "," + y;
                retval += " h " + (w - 2 * r);
                retval += " l " + (r) + "," + (h / 2);
                retval += " l " + (-r) + "," + (h / 2);
                retval += " h " + (2 * r - w);
                retval += " a " + r + "," + r + " 0 0 1 " + -r + "," + -r;
                retval += " v " + (2 * r - h);
                retval += " a " + r + "," + r + " 0 0 1 " + r + "," + -r;
                retval += " z";
            }
            return retval;
        };
        this.errorMsg = function (code, targetObject) {
            if (typeof this.errorCallback !== "function") {
                return false;
            }

            var errorMsg = {};
            [
                { code: 'ERR_NO_DATA',
                    message: 'V konfigurácii chýba objekt data'
                },
                { code: 'ERR_DATE_FMT',
                    message: 'Nepodarilo sa spracovat datum'
                },
                { code: 'ERR_BAD_EVENT_TYPE',
                    message: 'Lane item nezodpoveda specifikacii ziadneho typu eventu alebo intervalu'
                },
                { code: 'ERR_BAD_RANGE',
                    message: 'Nespravny rozsah datumov'
                },
                { code: 'ERR_BAD_HEIGHT',
                    message: 'Hodnota laneHeight musi byt vacsia ako 0'
                },
                { code: 'ERR_NO_PLUGIN',
                    message: 'Nepodarilo sa nacitat potrebne pluginy'
                }
            ].forEach(function (error) {
                    if (error.code == code) {
                        errorMsg = jQuery.extend({}, error);
                        return false;
                    }
                })

            this.errorCallback(code, jQuery.extend({}, targetObject));
        }
    }

    // VacuumGantt object concept
    var VacuumGanttObj = {
        init: function (options, elem) {
            var self = this;
            self.elem = $(elem);
            self.graphics = new Graphics();

            // extend by default configuration
            self.options = $.extend(true, {}, $.fn.vacuumGantt.options, options);

            // check if momentjs and d3 exists
            if (typeof moment === "undefined") {
                if (typeof self.options.onError == "function") {
                    self.options.onError(
                        'ERR_NO_PLUGIN',
                        {
                            name: "momentjs"
                        });
                }
            }
            if (typeof d3 === "undefined") {
                if (typeof self.options.onError == "function") {
                    self.options.onError(
                        'ERR_NO_PLUGIN',
                        {
                            name: "d3js"
                        });
                }
            }

            // if no data
            if (!(self.options.data instanceof Array)) {
                self.graphics.errorMsg(
                    'ERR_NO_DATA',
                    self.options.data);
            }

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
                .addClass('vacuumGantt')
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
                self.options.settings.viewport.width,
                self.options.settings.grid.timelines,
                self.options.onError
            );

            // create y/x axis & interval/event groups
            self.graphics.svg.elem.append('g').attr('class', 'yaxis');
            self.graphics.timelines.sort(function compare(a, b) {
                if (a.resolution > b.resolution)
                    return -1;
                if (a.resolution < b.resolution)
                    return 1;
                return 0;
            });
            var lvl = 1;
            self.graphics.timelines.forEach(function () {
                self.graphics.svg.elem.append('g').attr('class', 'xaxis time' + lvl);
                // timeline level
                lvl++;
            });
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
                // error after parsing
                if (!(settings.boundaries.startDate) instanceof Date) {
                    self.graphics.errorMsg(
                        'ERR_DATE_FMT',
                        settings.boundaries.startDate);
                }
            }
            if (typeof settings.boundaries.endDate === "string" && settings.boundaries.endDate != '') {
                settings.boundaries.endDate = new Date(settings.boundaries.endDate);
                // error after parsing
                if (!(settings.boundaries.endDate) instanceof Date) {
                    self.graphics.errorMsg(
                        'ERR_DATE_FMT',
                        settings.boundaries.endDate);
                }
            }
            // init viewport start position
            if (typeof settings.viewport.position === "string" && settings.viewport.position != '') {
                settings.viewport.position = new Date(settings.viewport.position);
                // error after parsing
                if (!(settings.viewport.position) instanceof Date) {
                    self.graphics.errorMsg(
                        'ERR_DATE_FMT',
                        settings.viewport.position);
                }
            }

            // start/end date of boundaries not set => init by minDate, maxDate
            if (!(settings.boundaries.startDate instanceof Date)) {
                settings.boundaries.startDate = self.minDate;
            }
            if (!(settings.boundaries.endDate instanceof Date)) {
                settings.boundaries.endDate = self.maxDate;
            }

            // error on wrong boundaries
            if (settings.boundaries.startDate > settings.boundaries.endDate) {
                self.graphics.errorMsg(
                    'ERR_BAD_RANGE',
                    settings.boundaries);

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

            // init to position
            if (settings.viewport.position > 0) {
                if (settings.viewport.position < settings.boundaries.startDate) {
                    self.graphics.svg.wrapper.scrollLeft(self.graphics.svg.scale(0))
                } else {
                    var pos = Math.abs(settings.boundaries.startDate - settings.viewport.position);
                    self.graphics.svg.wrapper.scrollLeft(self.graphics.svg.scale(pos))
                }
            }
            // timelines
            var xAxisTicks, xAxisGroup, xAxisDomain, xAxisScale, xAxis, lvl = 1;
            self.graphics.timelines.forEach(function (timeline) {
                xAxisTicks = 5;
                if (!isNaN(timeline.resolution)) {
                    xAxisTicks = Math.abs(settings.boundaries.startDate.getTime() - settings.boundaries.endDate.getTime());
                    xAxisTicks = Math.floor(xAxisTicks / timeline.resolution);
                }
                // resize x Axis
                xAxisGroup = self.graphics.svg.elem.select(".xaxis.time" + lvl);
                xAxisDomain = [settings.boundaries.startDate, settings.boundaries.endDate];
                xAxisScale = d3.time.scale()
                    .domain(xAxisDomain)
                    .range(xAxisDomain.map(d3.time.scale()
                        .domain(xAxisDomain)
                        .range([0, self.graphics.svg.width])));
                xAxis = d3.svg.axis()
                    .scale(xAxisScale)
                    .orient("bottom")
                    .tickSize(-(self.graphics.svg.height))
                    .ticks(xAxisTicks)
                    .tickFormat(function (d) {
                        return moment(d).format(timeline.dateFormat);
                    });

                // regenerate axis
                xAxisGroup.selectAll().remove();
                xAxisGroup.attr("transform", "translate(0, " + (self.graphics.svg.height - self.graphics.svg.xAxisHeight * (lvl)) + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .attr("y", 6)
                    .attr("x", 1)
                    .style("text-anchor", "start");
                if (lvl != self.graphics.timelines.length) {
                    xAxisGroup.selectAll("line")
                        .attr("transform", "translate(0, " + self.graphics.svg.xAxisHeight + ")")
                }
                // remove last
                d3.select(xAxisGroup.selectAll('g')[0].pop()).remove();

                // timeline level
                lvl++;
            })


            // change x and y axis color
            if (typeof settings.grid.color === "string" && typeof settings.grid.color != "") {
                self.graphics.svg.elem.selectAll('text').style('fill', settings.grid.color);
                self.graphics.svg.elem.selectAll('line, path').style('stroke', settings.grid.color);
                self.graphics.svg.elem.selectAll(".yaxis path").style('stroke', settings.grid.color);
            }
        }
    }

    // Lane object concept
    var LaneObj = {
        init: function (plot, data, index, graphics) {
            var self = this;
            self.graphics = graphics;
            self.index = index;

            // extend data
            self.data = $.extend({}, $.fn.vacuumGantt.laneOptions, data);

            // create DOM structure
            self.elem = $('<div/>', {
                'class': 'lane-label',
                'style': 'line-height:' + self.graphics.labels.laneHeight + ';'
                    + 'height:' + self.graphics.labels.laneHeight
            });

            if (typeof self.data.icon === "string" && self.data.icon != "") {
                var icon = $('<img/>', {
                    'class': 'lane-icon',
                    'style': 'max-height:' + self.graphics.labels.laneHeight + ';',
                    'src': self.data.icon,
                    'alt': 'lane-icon'
                });
                // icon vertical center fix
                icon.load(function () {
                    self.elem.css('padding-left', parseInt(self.elem.css('padding-left')) + icon.width() + 2);
                });
                self.elem.append(icon);
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
            self.graphics.labels.elem.append(self.elem);

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
            self.boundaries = plot.options.settings.boundaries;

            // extend data
            self.data = $.extend({}, $.fn.vacuumGantt.intervalOptions, data);

            // error on input data
            if (typeof self.data.startDate == "undefined"
                || typeof self.data.endDate == "undefined") {
                self.graphics.errorMsg(
                    'ERR_BAD_EVENT_TYPE',
                    data);
            }

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

            // error handling
            if (!(self.startDate instanceof Date)) {
                self.graphics.errorMsg(
                    'ERR_DATE_FMT',
                    self.data.startDate);
            }

            if (!(self.endDate instanceof Date)) {
                self.graphics.errorMsg(
                    'ERR_DATE_FMT',
                    self.data.endDate);
            }

            if (self.data.progressDate && !(self.startDate instanceof Date)) {
                self.graphics.errorMsg(
                    'ERR_DATE_FMT',
                    self.data.progressDate);
            }

            self.minMaxDate(plot, self.startDate, self.endDate);
        },
        render: function () {
            var self = this;

            var itemsGroup = self.graphics.svg.elem.select('g.items');
            self.intervalGroup = itemsGroup.append('g')
                .attr('class', 'interval');

            var classes = self.data.classes.join(" ");
            // unfinished rect
            var unfinished = self.intervalGroup.append("svg:rect")
                .attr("rx", 5)
                .attr("class", classes + " unfinished");
            // unfinished gradient
            if (typeof self.data.unfinishedColor === "string" && self.data.unfinishedColor != "") {
                unfinished.attr('style', 'fill:' + self.data.unfinishedColor);
            } else if (self.data.unfinishedColor instanceof Array) {
                unfinished.attr('style', 'fill:url(' + self.graphics.generateGradient(self.data.unfinishedColor) + ')');
            }

            // progress rect
            var progress = self.intervalGroup.append("path")
                .attr("class", classes + " progress");
            // progress gradient
            if (typeof self.data.progressColor === "string" && self.data.progressColor != "") {
                progress.attr('style', 'fill:' + self.data.progressColor);
            } else if (self.data.progressColor instanceof Array) {
                progress.attr('style', 'fill:url(' + self.graphics.generateGradient(self.data.progressColor) + ')');
            }

            // text
            self.intervalText = $('<div/>', {
                'class': 'intervalText ' + classes,
                'html': self.data.label
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
            if (self.startDate < self.boundaries.startDate) {
                self.startDate = self.boundaries.startDate;
            }
            var rectX = Math.abs(self.startDate - self.boundaries.startDate),
                rectY = parseInt(self.graphics.labels.laneHeight) * self.laneIndex + self.graphics.svg.rectMargin,
                progressWidth = Math.abs(self.progressDate - self.startDate),
                unfinishedWidth = Math.abs(self.endDate - self.startDate),
                rectHeight = parseInt(self.graphics.labels.laneHeight) - 2 * self.graphics.svg.rectMargin,
                progressRect = self.intervalGroup.select("path.progress"),
                unfinishedRect = self.intervalGroup.select("rect.unfinished");

            if (self.startDate > self.endDate
                || self.progressDate > self.endDate
                || self.progressDate < self.startDate) {
                self.graphics.errorMsg(
                    'ERR_BAD_RANGE',
                    self.data);
            }

            // scale dimensions
            rectX = self.graphics.svg.scale(rectX);
            progressWidth = self.graphics.svg.scale(progressWidth);
            unfinishedWidth = self.graphics.svg.scale(unfinishedWidth);

            unfinishedRect
                .attr('x', rectX)
                .attr('y', rectY)
                .attr('width', unfinishedWidth)
                .attr('height', rectHeight);

            var fullProgress = Math.abs(self.progressDate - self.endDate) == 0 ? true : false;
            progressRect
                .attr("d", self.graphics.progressPolygon(rectX, rectY, progressWidth, rectHeight, 5, fullProgress));

            // update text div
            self.intervalText
                .css('left', (rectX + 2 * self.graphics.svg.rectMargin).toFixed(2) + 'px')
                .css('top', rectY.toFixed(2) + 'px')
                .css('width', (unfinishedWidth - 2 * self.graphics.svg.rectMargin).toFixed(2))
                .css('height', rectHeight.toFixed(2))
                .css('line-height', rectHeight.toFixed(2) + "px");
            var icon = self.intervalText.find('.intervalIcon')
                .css('max-height', rectHeight.toFixed(2) - 5);
            // icon vertical center fix
            icon.load(function () {
                self.intervalText.css('padding-left', icon.width() + 5);
            });
            //bring to front text
            self.intervalText.bind('mouseover touchStart', function () {
                $(this).siblings('.toFront').removeClass('toFront');
                $(this).addClass('toFront');
            })
            self.intervalText.bind('mouseout', function () {
                $(this).removeClass('toFront');
            })
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
            self.data = $.extend({}, $.fn.vacuumGantt.eventOptions, data);

            // error on input data
            if (typeof self.data.date == "undefined") {
                self.graphics.errorMsg(
                    'ERR_BAD_EVENT_TYPE',
                    data);
            }

            // parse date
            if (typeof data.date === "string" && data.date != "") {
                self.date = new Date(data.date);
            }

            if (!(self.date instanceof Date)) {
                self.graphics.errorMsg(
                    'ERR_DATE_FMT',
                    self.data.date);
            }
            self.minMaxDate(plot, self.date);
        },
        render: function () {
            var self = this;

            // text
            var classes = self.data.classes.join(" ");
            self.eventText = $('<div/>', {
                'class': 'eventText ' + classes,
                'html': self.data.label
            });

            //icon
            if (typeof self.data.icon === "string" && self.data.icon != "") {
                var eventIcon = $('<img />', {
                    src: self.data.icon,
                    class: 'eventIcon'
                });
                self.eventText.prepend(eventIcon);
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
                textY = parseInt(self.graphics.labels.laneHeight) * self.laneIndex + self.graphics.svg.rectMargin - 1,
                textHeight = parseInt(self.graphics.labels.laneHeight) - 2 * self.graphics.svg.rectMargin + 1;

            // scale dimensions
            textX = self.graphics.svg.scale(textX);

            // update text div
            self.eventText
                .css('left', (parseInt(textX.toFixed(2)) + 4.0) + 'px')
                .css('top', textY.toFixed(2) + 'px')
                .css('height', textHeight)
                .css('line-height', textHeight + 'px');
            var icon = self.eventText.children('.eventIcon')
                .css('max-height', textHeight);
            // icon vertical center fix
            icon.load(function () {
                self.eventText.css('padding-left', icon.width() + 5);
            });

            // last event overflow fix
            self.eventText.load(function () {
                // resize svg
                if (textX.toFixed(2) + parseInt($(this).width) > self.svg.width) {
                    self.svg.eventOverflow = Math.abs(textX.toFixed(2) + parseInt($(this).width) - self.svg.width);
                    self.svg.eventOverflow = 0;
                    self.svg.elem.attr('width', self.svg.width + self.svg.eventOverflow);
                }
            })

            //bring to front
            self.eventText.bind('mouseover touchStart', function () {
                $(this).siblings('.toFront').removeClass('toFront');
                $(this).addClass('toFront');
            })
            self.eventText.bind('mouseout', function () {
                $(this).removeClass('toFront');
            })
        }
    }

    // plot initialization
    $.fn.vacuumGantt = function (options) {
        // initialize every element
        this.each(function (index, element) {
            // init vacuumGantt
            var vacuumGantt = Object.create(VacuumGanttObj);
            vacuumGantt.init(options, element);
            vacuumGantt.resize();

            // window resize
            $(window).resize(function () {
                vacuumGantt.resize();
            });
        });
    }

    // default VacuumGantt configuration
    $.fn.vacuumGantt.options = {
        settings: {
            boundaries: {
                startDate: null,
                endDate: null
            },
            viewport: {
                width: 2629743830, // month
                position: 0
            },
            laneHeight: '30px',
            grid: {
                color: '#000',
                timelines: []
            }
        },
        onLaneClick: null
    }

    // default Lane configuration
    $.fn.vacuumGantt.laneOptions = {
        id: null,
        description: "",
        icon: "",
        classes: "",
        items: []
    }

    // default Interval configuration
    $.fn.vacuumGantt.intervalOptions = {
        icon: "",
        classes: [],
        label: ""
    }

    // default Event configuration
    $.fn.vacuumGantt.eventOptions = {
        icon: "",
        classes: [],
        label: ""
    }
})(jQuery, window);