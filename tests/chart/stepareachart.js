(function() {
    var dataviz = kendo.dataviz,
        Box2D = dataviz.Box2D,
        categoriesCount = dataviz.categoriesCount,
        chartBox = new Box2D(0, 0, 800, 600),
        areaChart,
        root,
        view,
        pointCoordinates,
        TOLERANCE = 1;

    function setupStepAreaChart(plotArea, options) {
        view = new ViewStub();

        areaChart = new dataviz.AreaChart(plotArea, options);

        root = new dataviz.RootElement();
        root.append(areaChart);

        areaChart.reflow();
        areaChart.getViewElements(view);
        pointCoordinates = mapPoints(view.log.path[0].points);
    }

    function stubPlotArea(getCategorySlot, getValueSlot, options) {
        return new function() {
            this.categoryAxis = this.primaryCategoryAxis = {
                getSlot: getCategorySlot,
                lineBox: function() {
                    return new Box2D(0,2,2,2);
                },
                options: {
                    categories: ["A", "B"]
                }
            };

            this.valueAxis = {
                getSlot: getValueSlot,
                lineBox: function() {
                    return new Box2D(0,0,0,2);
                },
                options: {}
            };

            this.namedCategoryAxes = {};
            this.namedValueAxes = {};

            this.seriesCategoryAxis = function(series) {
                return series.categoryAxis ?
                    this.namedCategoryAxes[series.categoryAxis] : this.primaryCategoryAxis;
            };

            this.options = options;
        };
    }

    (function() {
        var positiveSeries = { data: [1, 2], labels: {}, line: { style: "step" } },
            negativeSeries = { data: [-1, -2], labels: {}, line: { style: "step" } },
            sparseSeries = { data: [1, 2, undefined, 2], line: { style: "step" } },
            VALUE_AXIS_MAX = 2,
            CATEGORY_AXIS_Y = 2;

        var plotArea = stubPlotArea(
            function(categoryIndex) {
                return new Box2D(categoryIndex, CATEGORY_AXIS_Y,
                                 categoryIndex + 1, CATEGORY_AXIS_Y);
            },
            function(value) {
                var value = typeof value === "undefined" ? 0 : value,
                    valueY = VALUE_AXIS_MAX - value,
                    slotTop = Math.min(CATEGORY_AXIS_Y, valueY),
                    slotBottom = Math.max(CATEGORY_AXIS_Y, valueY);

                return new Box2D(0, slotTop, 0, slotBottom);
            }
        );

        // ------------------------------------------------------------
        module("Step Area Chart / Positive Values", {
            setup: function() {
                setupStepAreaChart(plotArea, { series: [ positiveSeries ] });
            },
            teardown: destroyChart
        });

        test("Creates points for areaChart data points", function() {
            equal(areaChart.points.length, positiveSeries.data.length);
        });

        test("Reports minimum series value for default axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].min, positiveSeries.data[0]);
        });

        test("Reports maximum series value for default axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].max, positiveSeries.data[1]);
        });

        test("Reports number of categories", function() {
            setupStepAreaChart(plotArea, {series: [ positiveSeries ]});
            equal(categoriesCount(areaChart.options.series), positiveSeries.data.length);
        });

        test("points are distributed across category axis", function() {
            var pointsX = $.map(areaChart.points, function(point) {
                return point.box.x1;
            });

            deepEqual(pointsX, [0, 1]);
        });

        test("points are aligned to category axis", function() {
            var pointsY = $.map(areaChart.points, function(point) {
                return point.box.y2;
            });

            deepEqual(pointsY, [CATEGORY_AXIS_Y, CATEGORY_AXIS_Y]);
        });

        test("segments are clipped to category axis", function() {
            setupStepAreaChart(plotArea, { series: [ positiveSeries ]});

            equal(areaChart._segments[0].points()[0].y, CATEGORY_AXIS_Y);
        });

        test("segments are clipped to secondary category axis", function() {
            plotArea.namedCategoryAxes["secondary"] = {
                getSlot: function(categoryIndex) {
                    return new Box2D(categoryIndex, 0,
                                     categoryIndex + 1, 0);
                },
                lineBox: function() {
                    ok(true)
                    return new Box2D(0,0,2,0);
                },
                options: {
                    categories: ["A", "B"]
                }
            };

            setupStepAreaChart(plotArea, { series: [{
                categoryAxis: "secondary",
                data: [1, 2],
                labels: {}
            }]});

            equal(areaChart._segments[0].points()[0].y, 0);
        });

        test("points have set width", function() {
            $.each(areaChart.points, function() {
                equal(this.box.width(), 1);
            });
        });

        test("points have set height according to value", function() {
            var pointHeights = $.map(areaChart.points, function(point) {
                return point.box.height();
            });

            deepEqual(pointHeights, [1, 2]);
        });

        test("getNearestPoint returns nearest series point", function() {
            var point = areaChart.points[1],
                result = areaChart.getNearestPoint(point.box.x2 + 100, point.box.y2, 0);

            ok(result === point);
        });

        test("sets point owner", function() {
            ok(areaChart.points[0].owner === areaChart);
        });

        test("sets point series", function() {
            ok(areaChart.points[0].series === positiveSeries);
        });

        test("sets point series index", function() {
            ok(areaChart.points[0].seriesIx === 0);
        });

        test("sets point category", function() {
            equal(areaChart.points[0].category, "A");
        });

        test("sets point dataItem", function() {
            equal(typeof areaChart.points[0].dataItem, "number");
        });

        test("Throws error when unable to locate value axis", function() {
            raises(function() {
                    setupStepAreaChart(plotArea, {
                        series: [{ axis: "b", data: [1], line: { style: "step" } }]
                    });
                },
                /Unable to locate value axis with name b/);
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Negative Values", {
            setup: function() {
                setupStepAreaChart(plotArea, { series: [ negativeSeries ] });
            },
            teardown: destroyChart
        });

        test("Reports minimum series value for default axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].min, negativeSeries.data[1]);
        });

        test("Reports maximum series value for default axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].max, negativeSeries.data[0]);
        });

        test("point tops are aligned to category axis", function() {
            var pointsY = $.map(areaChart.points, function(point) {
                return point.box.y1;
            });

            deepEqual(pointsY, [CATEGORY_AXIS_Y, CATEGORY_AXIS_Y]);
        });

        test("points have set height according to value", function() {
            var pointHeights = $.map(areaChart.points, function(point) {
                return point.box.height();
            });

            deepEqual(pointHeights, [1, 2]);
        });

        test("getNearestPoint returns nearest series point", function() {
            var point = areaChart.points[1],
                result = areaChart.getNearestPoint(point.box.x2 + 100, point.box.y2, 0);

            ok(result === point);
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Multiple Series", {
            setup: function() {
                plotArea.namedValueAxes.secondary = plotArea.valueAxis;

                setupStepAreaChart(plotArea, {
                    series: [
                    $.extend({ }, positiveSeries),
                    $.extend({ axis: "secondary" }, negativeSeries  )
                ] });
            },
            teardown: destroyChart
        });

        test("Reports minimum series value for primary axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].min, positiveSeries.data[0]);
        });

        test("Reports maximum series value for primary axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].max, positiveSeries.data[1]);
        });

        test("Reports minimum series value for secondary axis", function() {
            deepEqual(areaChart.valueAxisRanges.secondary.min, negativeSeries.data[1]);
        });

        test("Reports maximum series value for secondary axis", function() {
            deepEqual(areaChart.valueAxisRanges.secondary.max, negativeSeries.data[0]);
        });

        test("Reports number of categories for two series", function() {
            setupStepAreaChart(plotArea, {series: [ positiveSeries, negativeSeries ]});
            equal(categoriesCount(areaChart.options.series), positiveSeries.data.length);
        });

        test("getNearestPoint returns nearest series point", function() {
            var point = areaChart.points[1],
                result = areaChart.getNearestPoint(point.box.x2, point.box.y2 + 100, 1);

            ok(result === point);
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Mismatched series", {
            setup: function() {
                setupStepAreaChart(plotArea, {
                series: [ { data: [1, 2, 3] },
                          positiveSeries
                    ]
                });
            },
            teardown: destroyChart
        });

        test("Reports minimum series value for default axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].min, 1);
        });

        test("Reports maximum series value for default axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].max, 3);
        });

        test("Reports number of categories", function() {
            equal(categoriesCount(areaChart.options.series), 3);
        });

        test("getNearestPoint returns nearest series point", function() {
            var point = areaChart.points[3],
                result = areaChart.getNearestPoint(point.box.x2, point.box.y2 + 10, 1);

            ok(result === point);
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Missing values", {
            setup: function() {
                setupStepAreaChart(plotArea, {
                    series: [ sparseSeries ]
                });
            },
            teardown: destroyChart
        });

        test("Reports minimum series value for default axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].min, 1);
        });

        test("Reports maximum series value for default axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].max, 2);
        });

        test("missing points are assumed to be 0 by default", function() {
            equal(areaChart.points[2].value, 0);
        });

        test("omits missing points", function() {
            setupStepAreaChart(plotArea, {
                series: [
                    $.extend({ missingValues: "gap" }, sparseSeries)
                ]
            });

            equal(areaChart.points[2], null);
        });

        test("omits missing points when interpolating", function() {
            setupStepAreaChart(plotArea, {
                series: [
                    $.extend({ missingValues: "interpolate" }, sparseSeries)
                ]
            });

            equal(areaChart.points[2], null);
        });

        test("getNearestPoint returns nearest series point (left)", function() {
            setupStepAreaChart(plotArea, {
                series: [
                    $.extend({ missingValues: "gap" }, sparseSeries)
                ]
            });

            var point = areaChart.points[1],
                result = areaChart.getNearestPoint(point.box.x2 + 0.1, point.box.y2, 0);

            ok(result === point);
        });

        test("getNearestPoint returns nearest series point (right)", function() {
            setupStepAreaChart(plotArea, {
                series: [
                    $.extend({ missingValues: "gap" }, sparseSeries)
                ]
            });

            var point = areaChart.points[3],
                result = areaChart.getNearestPoint(point.box.x1 - 0.1, point.box.y1, 0);

            ok(result === point);
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Panes", {
            teardown: destroyChart
        });

        test("area fill is clipped to value axis box", function() {
            var chart = createChart({
                series: [{
                    type: "area",
                    data: [1, 2, 3]
                }],
                panes: [{
                    name: "top"
                }, {
                    name: "bottom"
                }],
                valueAxis: [{
                }],
                categoryAxis: {
                    pane: "bottom",
                    categories: ["A"]
                }
            });

            var plotArea = chart._model._plotArea;
            var areaChart = plotArea.charts[0];
            equal(areaChart._segments[0].points()[0].y,
                   plotArea.panes[0].axes[0].lineBox().y2);
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Stack / Positive Values", {
            setup: function() {
                setupStepAreaChart(plotArea, {
                    series: [ positiveSeries, positiveSeries, positiveSeries ],
                    isStacked: true }
                );
            },
            teardown: destroyChart
        });

        test("reports stacked minumum value for default axis", function() {
            equal(areaChart.valueAxisRanges[undefined].min, 1);
        });

        test("reports stacked maximum value for default axis", function() {
            equal(areaChart.valueAxisRanges[undefined].max, 6);
        });

        test("point plot values are stacked", function() {
            deepEqual(
                $.map(areaChart.points, function(point) { return point.plotValue }),
                [1, 2, 3, 2, 4, 6]
            );
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Stack / Negative Values", {
            setup: function() {
                setupStepAreaChart(plotArea, {
                    series: [ negativeSeries, negativeSeries, negativeSeries ],
                    isStacked: true
                });
            },
            teardown: destroyChart
        });

        test("reports stacked minumum value for default axis", function() {
            equal(areaChart.valueAxisRanges[undefined].min, -6);
        });

        test("reports stacked maximum value for default axis", function() {
            equal(areaChart.valueAxisRanges[undefined].max, -1);
        });

        test("point plot values are stacked", function() {
            deepEqual(
                $.map(areaChart.points, function(point) { return point.plotValue }),
                [-1, -2, -3, -2, -4, -6]
            );
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Stack / Mixed Values", {
            setup: function() {
                setupStepAreaChart(plotArea, {
                    series: [{
                        data: [2, 2],
                        labels: {}
                    }, {
                        data: [-1, -1],
                        labels: {}
                    }],
                    isStacked: true
                });
            },
            teardown: destroyChart
        });

        test("reports stacked minumum value for default axis", function() {
            equal(areaChart.valueAxisRanges[undefined].min, 1);
        });

        test("reports stacked maximum value for default axis", function() {
            equal(areaChart.valueAxisRanges[undefined].max, 2);
        });

        test("points have set height according to stack value", function() {
            var pointHeights = $.map(areaChart.points, function(point) {
                return point.box.height();
            });

            deepEqual(pointHeights, [2, 1, 2, 1]);
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Stack / Mixed Series", {
            setup: function() {
                plotArea.namedValueAxes.a = plotArea.valueAxis;
                plotArea.namedValueAxes.b = plotArea.valueAxis;

                setupStepAreaChart(plotArea, {
                    series: [
                        // Both axes should be on same axis.
                        // This rule is intentionally broken for the tests.
                        $.extend({ axis: "a" }, positiveSeries),
                        $.extend({ axis: "b" }, negativeSeries)
                    ],
                    isStacked: true
                });
            },
            teardown: destroyChart
        });

        test("reports stacked minumum value for default axis", function() {
            equal(areaChart.valueAxisRanges.a.min, 0);
        });

        test("reports stacked maximum value for default axis", function() {
            equal(areaChart.valueAxisRanges.a.max, 2);
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Stack / Missing values", {
            setup: function() {
                sparseSeries.line = { width: 0, style: "step" };
                setupStepAreaChart(plotArea, {
                    series: [ sparseSeries, sparseSeries ],
                    isStacked: true
                });
            },
            teardown: destroyChart
        });

        test("Reports minimum series value for default axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].min, 1);
        });

        test("Reports maximum series value for default axis", function() {
            deepEqual(areaChart.valueAxisRanges[undefined].max, 4);
        });

        test("missing points are assumed to be 0 by default", function() {
            equal(areaChart.points[4].value, 0);
        });

        test("omits missing points", function() {
            setupStepAreaChart(plotArea, {
                series: [
                    $.extend({ missingValues: "gap" }, sparseSeries)
                ],
                isStacked: true
            });

            equal(areaChart.points[4], null);
        });

        test("line is drawn between existing points when interpolating", function() {
            setupStepAreaChart(plotArea, {
                series: [
                    $.extend({ missingValues: "interpolate" }, sparseSeries)
                ],
                isStacked: true
            });

            deepEqual(pointCoordinates, [
                [ 0, 2 ], [ 0, 1 ], [ 1, 1 ], [ 1, 1 ], [ 1, 0 ], [ 2, 0 ],
                [ 1, 0 ], [ 2, 0 ], [ 3, 0 ], [ 3, 0 ], [ 4, 0 ], [ 4, 2 ]
            ]);
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Stack / Panes", {
            teardown: destroyChart
        });

        test("charts in different panes are not stacked", function() {
            var chart = createChart({
                series: [{
                    stack: true,
                    type: "area",
                    data: [1]
                }, {
                    type: "area",
                    data: [2],
                    axis: "b"
                }],
                panes: [{
                    name: "top"
                }, {
                    name: "bottom"
                }],
                valueAxis: [{
                }, {
                    name: "b",
                    pane: "bottom"
                }],
                categoryAxis: {
                    categories: ["A"]
                }
            });

            var areaCharts = chart._model._plotArea.charts;
            equal(areaCharts[0].points[0].plotValue, undefined);
            equal(areaCharts[1].points[0].plotValue, undefined);
        });

        // ------------------------------------------------------------
        var polyline;

        module("Step Area Chart / Rendering", {
            setup: function() {
                setupStepAreaChart(plotArea, {
                    series: [{
                        data: [1, 2],
                        labels: {},
                        line: {
                            width: 2,
                            color: "lineColor",
                            opacity: 0.5,
                            dashType: "dot",
                            style: "line"
                        },
                        color: "areaColor",
                        opacity: 0.1
                    }]
                });

                polyline = view.log.path[0];

            },
            teardown: destroyChart
        });

        test("sets area line width", function() {
            equal(view.log.path[1].style.strokeWidth, 2);
        });

        test("sets area line color", function() {
            equal(view.log.path[1].style.stroke, "lineColor");
        });

        test("sets area line opacity", function() {
            equal(view.log.path[1].style.strokeOpacity, 0.5);
        });

        test("sets area line opacity", function() {
            equal(view.log.path[1].style.dashType, "dot");
        });

        test("sets area fill color", function() {
            equal(polyline.style.fill, "areaColor");
        });

        test("sets area fill color to default if series color is fn", function() {
            setupStepAreaChart(plotArea, {
                series: [
                    $.extend({
                            _defaults: { color: "areaColor" },
                            color: function() { }
                        },
                        positiveSeries
                    )
                ]
            });
            equal(view.log.path[0].style.fill, "areaColor");
        });

        test("sets area opacity", function() {
            equal(polyline.style.fillOpacity, 0.1);
        });

        test("area has same model id as its segment", function() {
            equal(polyline.style.data.modelId, areaChart._segments[0].modelId);
        });

        test("renders area chart group", function() {
            equal(view.log.group.length, 1);
        });

        test("sets group animation", function() {
            equal(view.log.group[0].options.animation.type, "clip");
        });

        test("area shape is open", function() {
            equal(polyline.closed, false);
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Rendering / Missing Values", {
            setup: function() {
                sparseSeries.line = { width: 0, style: "step" };
            },
            teardown: destroyChart
        });

        test("area stops before missing value", function() {
            setupStepAreaChart(plotArea, {
                series: [
                    $.extend({ missingValues: "gap" }, sparseSeries)
                ]
            });

            deepEqual(pointCoordinates, [
                [ 0, 2 ], [ 0, 1 ], [ 1, 1 ],
                [ 1, 0 ], [ 2, 0 ], [ 2, 2 ]
            ]);
        });

        test("no area is created for isolated points", function() {
            setupStepAreaChart(plotArea, {
                series: [
                    $.extend({ missingValues: "gap" }, sparseSeries)
                ]
            });

            equal(view.log.path.length, 1);
        });

        test("area continues after missing value", function() {
            setupStepAreaChart(plotArea, {
                series: [{
                    missingValues: "gap",
                    data: [ null, 1, 2 ],
                    line: { width: 0, style: "step" }
                }]
            });

            deepEqual(pointCoordinates, [
                [ 1, 2 ], [ 1, 1 ], [ 2, 1 ],
                [ 2, 0 ], [ 3, 0 ], [ 3, 2 ]
            ]);
        });

        test("area is drawn between existing points", function() {
            setupStepAreaChart(plotArea, {
                series: [
                    $.extend({ missingValues: "interpolate" }, sparseSeries)
                ]
            });

            deepEqual(pointCoordinates, [
                [ 0, 2 ], [ 0, 1 ], [ 1, 1 ], [ 1, 1 ],
                [ 1, 0 ], [ 2, 0 ], [ 1, 0 ], [ 2, 0 ],
                [ 3, 0 ], [ 3, 0 ], [ 4, 0 ], [ 4, 2 ]
            ]);
        });

        test("area goes to zero for missing point", function() {
            setupStepAreaChart(plotArea, {
                series: [
                    $.extend({ missingValues: "zero" }, sparseSeries)
                ]
            });

            deepEqual(pointCoordinates, [
                [ 0, 2 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 2, 0 ], [ 1, 0 ], [ 2, 0 ],
                [ 2, 2 ], [ 3, 2 ], [ 2, 2 ], [ 3, 2 ], [ 3, 0 ], [ 4, 0 ], [ 4, 2 ]
            ]);
        });

    })();

    (function() {
        var areaChart,
            MARGIN = PADDING = BORDER = 5,
            linePoint;

        var plotArea = stubPlotArea(
            function(categoryIndex) {
                return new Box2D();
            },
            function(value) {
                return new Box2D();
            },
            {
                categoryAxis: {}
            }
        );

        function createAreaChart(options) {
            areaChart = new dataviz.AreaChart(plotArea, {
                series: [$.extend({
                    data: [0, 1],
                    color: "areaColor",
                    markers: {
                        visible: false,
                        size: 10,
                        type: "triangle",
                        border: {
                            width: BORDER
                        },
                        opacity: 0.2
                    },
                    labels: {
                        visible: false,
                        color: "labels-color",
                        background: "labels-background",
                        border: {
                            color: "labels-border",
                            width: BORDER
                        },
                        margin: MARGIN,
                        padding: PADDING
                    }
                }, options)]
            });
            areaPoint = areaChart.points[0];
        }

        // ------------------------------------------------------------
        module("Step Area Chart / Configuration", {
            setup: function() {
                createAreaChart();
            },
            teardown: destroyChart
        });

        test("applies visible to point markers", function() {
            equal(areaPoint.options.markers.visible, false);
        });

        test("applies series color to point markers border", function() {
            createAreaChart({ markers: { visible: true } });
            areaPoint.reflow(chartBox);
            equal(areaPoint.marker.options.border.color, "areaColor");
        });

        test("applies opacity to point markers", function() {
            equal(areaPoint.options.markers.opacity, 0.2);
        });

        test("applies size to point markers", function() {
            equal(areaPoint.options.markers.size, 10);
        });

        test("applies type to point markers", function() {
            equal(areaPoint.options.markers.type, "triangle");
        });

        test("applies border color to point markers", function() {
            createAreaChart({ markers: { border: { color: "marker-border" } } });
            equal(areaPoint.options.markers.border.color, "marker-border");
        });

        test("applies border width to point markers.", function() {
            equal(areaPoint.options.markers.border.width, BORDER);
        });

        test("applies visible to point labels", function() {
            equal(areaPoint.options.labels.visible, false);
        });

        test("applies color to point labels", function() {
            equal(areaPoint.options.labels.color, "labels-color");
        });

        test("applies background to point labels", function() {
            equal(areaPoint.options.labels.background, "labels-background");
        });

        test("applies border color to point labels", function() {
            equal(areaPoint.options.labels.border.color, "labels-border");
        });

        test("applies border width to point labels", function() {
            equal(areaPoint.options.labels.border.width, BORDER);
        });

        test("applies padding to point labels", function() {
            equal(areaPoint.options.labels.padding, PADDING);
        });

        test("applies margin to point labels", function() {
            equal(areaPoint.options.labels.margin, MARGIN);
        });

        test("applies color function", function() {
            createAreaChart({
                color: function(p) { return "#f00" }
            });

            equal(areaPoint.options.color, "#f00");
        });

        test("color fn argument contains value", 1, function() {
            createAreaChart({
                data: [1],
                color: function(p) { equal(p.value, 1); }
            });
        });

        test("color fn argument contains dataItem", 1, function() {
            createAreaChart({
                data: [1],
                color: function(p) {
                    deepEqual(p.dataItem, 1);
                }
            });
        });

        test("color fn argument contains series", 1, function() {
            createAreaChart({
                name: "areaSeries",
                data: [1],
                color: function(p) { equal(p.series.name, "areaSeries"); }
            });
        });

    })();

    (function() {
        var LinePoint = dataviz.LinePoint,
            point,
            box,
            marker,
            label,
            root,
            VALUE = 1,
            TOOLTIP_OFFSET = 5,
            CATEGORY = "A",
            SERIES_NAME = "series";

        function createPoint(options) {
            point = new LinePoint(VALUE,
                $.extend(true, {
                    labels: { font: SANS12 }
                }, LinePoint.fn.defaults, options)
            );

            point.category = CATEGORY;
            point.dataItem = { value: VALUE };
            point.series = { name: SERIES_NAME };

            point.owner = {
                formatPointValue: function(point, tooltipFormat) {
                    return kendo.dataviz.autoFormat(tooltipFormat, point.value);
                }
            }

            box = new Box2D(0, 0, 100, 100);
            point.reflow(box);

            root = new dataviz.RootElement();
            root.append(point);

            marker = point.marker;
            label = point.label;
        }

        // ------------------------------------------------------------
        module("Area Point", {
            setup: function() {
                createPoint();
            },
            teardown: destroyChart
        });

        test("fills target box", function() {
            sameBox(point.box, box);
        });

        test("creates marker", function() {
            ok(marker instanceof dataviz.BoxElement);
        });

        test("sets marker width", function() {
            createPoint({ markers: { size: 10 } });
            equal(marker.options.width, 10);
        });

        test("sets marker height", function() {
            createPoint({ markers: { size: 10 } });
            equal(marker.options.height, 10);
        });

        test("sets marker background color", function() {
            deepEqual(marker.options.background, point.options.markers.background);
        });

        test("sets default marker border color based on background", function() {
            createPoint({ markers: { background: "#cf0" } });
            equal(marker.options.border.color, "#a3cc00");
        });

        test("does not change marker border color if set", function() {
            createPoint({ markers: { border: { color: "" } } });
            equal(marker.options.border.color, "");
        });

        test("sets marker border width", function() {
            createPoint({ markers: { border: { width: 4 } } });
            equal(marker.options.border.width, 4);
        });

        test("doesn't create marker", function() {
            createPoint({ markers: { visible: false }});
            ok(!marker);
        });

        test("sets marker shape type", function() {
            createPoint({ markers: { type: "triangle" }});
            equal(marker.options.type, "triangle");
        });

        test("marker is positioned at top", function() {
            createPoint({ vertical: true, aboveAxis: true });
            sameBox(marker.box, new Box2D(44, -6, 56, 6));
        });

        test("marker is positioned at bottom", function() {
            createPoint({ vertical: true, aboveAxis: false });
            sameBox(marker.box, new Box2D(44, 94, 56, 106));
        });

        test("marker is positioned at right", function() {
            createPoint({ vertical: false, aboveAxis: true });
            sameBox(marker.box, new Box2D(94, 44, 106, 56));
        });

        test("marker is positioned at left", function() {
            createPoint({ vertical: false, aboveAxis: false });
            sameBox(marker.box, new Box2D(-6, 44, 6, 56));
        });

        test("sets marker opacity", function() {
            createPoint({ markers: { opacity: 0.5 }});
            deepEqual(marker.options.opacity, point.options.markers.opacity);
        });

        test("sets marker id", function() {
            ok(marker.id.length > 0);
        });

        test("marker has same model id", function() {
            view = new ViewStub();

            point.getViewElements(view);
            equal(marker.modelId, point.modelId);
        });

        test("highlightOverlay returns marker outline", function() {
            createPoint({ markers: { type: "circle" }});
            view = new ViewStub();

            point.highlightOverlay(view);
            equal(view.log.circle.length, 1);
        });

        test("outline element has same model id", function() {
            createPoint({ markers: { type: "circle" }});
            view = new ViewStub();

            point.highlightOverlay(view);
            equal(view.log.circle[0].style.data.modelId, point.modelId);
        });

        test("highlightOverlay applies render options for square markers", function() {
            createPoint({ markers: { type: "square" }});
            view = new ViewStub();

            point.highlightOverlay(view, { flag: true });
            ok(view.log.path[0].style.flag);
        });

        test("highlightOverlay applies render options for circle markers", function() {
            createPoint({ markers: { type: "circle" }});
            view = new ViewStub();

            point.highlightOverlay(view, { flag: true });
            ok(view.log.circle[0].style.flag);
        });

        test("highlightOverlay applies render options for triangle markers", function() {
            createPoint({ markers: { type: "triangle" }});
            view = new ViewStub();

            point.highlightOverlay(view, { flag: true });
            ok(view.log.path[0].style.flag);
        });

        test("tooltipAnchor is at top right of marker / above axis", function() {
            createPoint({ aboveAxis: true });
            var anchor = point.tooltipAnchor(10, 10);
            deepEqual([anchor.x, anchor.y],
                 [point.marker.box.x2 + TOOLTIP_OFFSET, point.marker.box.y1 - 10])
        });

        test("tooltipAnchor is at bottom right of marker / below axis", function() {
            createPoint({ aboveAxis: false });
            var anchor = point.tooltipAnchor(10, 10);
            deepEqual([anchor.x, anchor.y],
                 [point.marker.box.x2 + TOOLTIP_OFFSET, point.marker.box.y2])
        });

        // ------------------------------------------------------------
        module("Area Point / Labels", {
            setup: function() {
                createPoint({ labels: { visible: true } });
            },
            teardown: destroyChart
        });

        test("sets label text", function() {
            equal(label.children[0].content, VALUE);
        });

        test("applies full label format", function() {
            createPoint({ labels: { visible: true, format: "{0}%" }});
            equal(label.children[0].content, VALUE + "%");
        });

        test("applies simple label format", function() {
            createPoint({ labels: { visible: true, format: "p0" }});
            equal(label.children[0].content, VALUE * 100 + " %");
        });

        test("sets label color", function() {
            createPoint({ labels: { visible: true, color: "#cf0" }});
            deepEqual(label.options.color, "#cf0");
        });

        test("sets label background", function() {
            createPoint({ labels: { visible: true, background: "#cf0" }});
            deepEqual(label.options.background, "#cf0");
        });

        test("sets label border color", function() {
            createPoint({ labels: { visible: true, border: { color: "#cf0" } }});
            deepEqual(label.options.border.color, "#cf0");
        });

        test("sets label border width", function() {
            createPoint({ labels: { visible: true, border: { width: 4 } }});
            deepEqual(label.options.border.width, 4);
        });

        test("sets label font", function() {
            createPoint({ labels: { visible: true, font: "12px comic-sans" }});
            deepEqual(label.options.font, "12px comic-sans");
        });

        test("sets default left margin", function() {
            deepEqual(label.options.margin.left, 3);
        });

        test("sets default right margin", function() {
            deepEqual(label.options.margin.right, 3);
        });

        test("labels are not visible by default", function() {
            createPoint();
            equal(typeof label, "undefined");
        });

        test("sets label visibility", function() {
            equal(label.options.visible, true);
        });

        test("label is positioned above marker", function() {
            createPoint({ labels: { visible: true, position: "above" } });
            sameBox(label.box, new Box2D(39, -35, 60, -6), TOLERANCE);
        });

        test("label is positioned below marker", function() {
            createPoint({ labels: { visible: true, position: "below" } });
            sameBox(marker.box, new Box2D(44, -6, 56, 6), TOLERANCE);
        });

        test("label is positioned right of marker", function() {
            createPoint({ labels: { visible: true, position: "right" } });
            sameBox(marker.box, new Box2D(44, -6, 56, 6), TOLERANCE);
        });

        test("label is positioned left of marker", function() {
            createPoint({ labels: { visible: true, position: "left" } });
            sameBox(marker.box, new Box2D(44, -6, 56, 6), TOLERANCE);
        });

        // ------------------------------------------------------------
        module("Area Point / Labels / Template");

        test("renders template", function() {
            createPoint({ labels: { visible: true, template: "${value}%" } });
            equal(label.children[0].content, VALUE + "%");
        });

        test("renders template even when format is set", function() {
            createPoint({ labels: { visible: true, template: "${value}%", format:"{0:C}" } });
            equal(label.children[0].content, VALUE + "%");
        });

        test("template has category", function() {
            createPoint({ labels: { visible: true, template: "${category}" } });
            equal(point.children[1].children[0].content, CATEGORY);
        });

        test("template has dataItem", function() {
            createPoint({ labels: { visible: true, template: "${dataItem.value}" } });
            equal(point.children[1].children[0].content, VALUE);
        });

        test("template has series", function() {
            createPoint({ labels: { visible: true, template: "${series.name}" } });
            equal(point.children[1].children[0].content, SERIES_NAME);
        });
    })();

    (function() {
        var data = [{
                name: "Category A",
                text: "Alpha",
                value: 0
            }],
            chart,
            label;

        // ------------------------------------------------------------
        module("Step Area Chart / Integration", {
            setup: function() {
                chart = createChart({
                    dataSource: {
                        data: data
                    },
                    seriesDefaults: {
                        labels: {
                            visible: true,
                            template: "${dataItem.text}"
                        }
                    },
                    series: [{
                        name: "Value",
                        type: "area",
                        field: "value"
                    }],
                    categoryAxis: {
                        field: "name"
                    }
                });

                label = chart._plotArea.charts[0].points[0].label;
            },
            teardown: destroyChart
        });

        test("dataItem sent to label template", function() {
            equal(label.children[0].content, "Alpha");
        });

    })();

    (function() {
        var chart,
            segment;

        function getElement(modelElement) {
            return $(dataviz.getElement(modelElement.id));
        }

        function createAreaChart(options) {
            chart = createChart($.extend({
                series: [{
                    type: "area",
                    data: [1, 2]
                }],
                categoryAxis: {
                    categories: ["A", "B"]
                }
            }, options));

            var plotArea = chart._model.children[1],
                lineChart = plotArea.charts[0];

            segment = lineChart._segments[0];
        }

        function areaClick(callback, x, y) {
            createAreaChart({
                seriesClick: callback
            });

            chart._userEvents.press(x, y, getElement(segment));
            chart._userEvents.end(x, y);
        }

        function areaHover(callback, x, y) {
            createAreaChart({
                seriesHover: callback
            });

            triggerEvent("mouseover", getElement(segment), x, y);
        }

        // ------------------------------------------------------------
        module("Step Area Chart / Events / seriesClick", {
            teardown: destroyChart
        });

        test("fires when clicking segment", 1, function() {
            areaClick(function() { ok(true); });
        });

        test("fires for closest point when clicking segment (1)", 1, function() {
            areaClick(function(e) { equal(e.value, 1); }, 0, 0);
        });

        test("fires for closest point when clicking segment (2)", 1, function() {
            areaClick(function(e) { equal(e.value, 2); }, 1000, 0);
        });

        // ------------------------------------------------------------
        module("Step Area Chart / Events / seriesHover", {
            teardown: destroyChart
        });

        test("fires when hovering segment", 1, function() {
            areaHover(function() { ok(true); });
        });

        test("fires for closest point when hovering segment (1)", 1, function() {
            areaHover(function(e) { equal(e.value, 1); }, 0, 0);
        });

        test("fires for closest point when hovering segment (2)", 1, function() {
            areaHover(function(e) { equal(e.value, 2); }, 1000, 0);
        });

    })();
})();
