(function (window, go, $, _) {
    "use strict";

    /**
     * ServerMap
     *
     * @class ServerMap
     * @version 1.0.0
     * @since Sep, 2013
     * @author Denny Lim<hello@iamdenny.com, iamdenny@nhn.com>
     * @license MIT License
     * @copyright 2014 NAVER Corp.
     */
    window.ServerMap = $.Class({

        /**
         * constructor
         *
         * @constructor
         * @method $init
         * @param {Hash Table} options
         */
        $init: function (htOption, $location) {
        	this._query = "";
            this.option({
                "sContainerId": '',
                "sOverviewId": '',
                "sBigFont": "11pt avn85,NanumGothic,ng,dotum,AppleGothic,sans-serif",
                "sSmallFont": "10pt avn55,NanumGothic,ng,dotum,AppleGothic,sans-serif",
                "sImageDir": './images/',
                "sBoldKey": null,
                "htIcons": {
                    'APACHE': 'APACHE.png',
                    'ARCUS': 'ARCUS.png',
                    'BACKEND': 'BACKEND.png',
                    'BLOC': 'BLOC.png',
                    'CASSANDRA': 'CASSANDRA.png',
                    'CUBRID': 'CUBRID.png',
                    'JAVA': 'JAVA.png',
                    'MEMCACHED': 'MEMCACHED.png',
                    'MONGODB': 'MONGODB.png',
                    'MSSQLSERVER': 'MSSQLSERVER.png',
                    'MSSQLSERVER_GROUP': 'MSSQLSERVER.png',
                    'MYSQL': 'MYSQL.png',
                    'MYSQL_GROUP': 'MYSQL.png',
                    'NBASE': 'NBASE.png',
                    'NGINX': 'NGINX.png',
                    'ORACLE': 'ORACLE.png',
                    'QUEUE': 'QUEUE.png',
                    'STAND_ALONE': 'STAND_ALONE.png',
                    'TOMCAT': 'TOMCAT.png',
                    'UNDEFINED': 'UNDEFINED.png',
                    'UNDEFINED_GROUP': 'UNDEFINED.png',
                    'UNKNOWN': 'UNKNOWN.png',
                    'UNKNOWN_GROUP': 'UNKNOWN_GROUP.png',
                    'REDIS': 'REDIS.png',
                    'NBASE_ARC': 'NBASE_ARC.png',
                    'USER': 'USER.png'
                },
                "htNodeTheme": {
                    "default": {
                        "backgroundColor": "#ffffff",
                        "borderColor": "#C5C5C5",
                        "borderWidth": 1,
                        "fontColor": "#000000"
                    },
                    "bold": {
                        "backgroundColor": "#f2f2f2",
                        "borderColor": "#666975",
                        "borderWidth": 2,
                        "fontColor": "#000000"
                    }
                },
                "htLinkType": {
                    "sRouting": "AvoidsNodes", // Normal, Orthogonal, AvoidNodes
                    "sCurve": "JumpGap" // Bezier, JumpOver, JumpGap
                },
                "htLinkTheme": {
                    "default": {
                        "backgroundColor": "#ffffff",
                        "borderColor": "#c5c5c5",
                        "fontFamily": "11pt avn55,NanumGothic,ng,dotum,AppleGothic,sans-serif",
                        "fontColor": "#000000",
                        "fontAlign": "center",
                        "margin": 1,
                        "strokeWidth": 1
                    },
                    "bad": {
                        "backgroundColor": "#ffc9c9",
                        "borderColor": "#7d7d7d",
                        "fontFamily": "11pt avn55,NanumGothic,ng,dotum,AppleGothic,sans-serif",
                        "fontColor": "#FF1300",
                        "fontAlign": "center",
                        "margin": 1,
                        "strokeWidth": 1
                    }
                },
                "htHighlightNode": {
                    //"borderColor": "#25AFF4",
                	"borderColor": "#53069B",
                    "backgroundColor": "#289E1D",
                    //"fontColor": "#5cb85c"
                    "fontColor": "#53069B"
                },
                "htHighlightLink": {
                	"fontFamily": "bold 12pt avn55,NanumGothic,ng,dotum,AppleGothic,sans-serif",
                    //"borderColor": "#25AFF4",
                	"borderColor": "#53069B",
                    "strokeWidth": 2
                },
                "htPadding": {
                    "top": 10,
                    "right": 10,
                    "bottom": 10,
                    "left": 10
                },
                "unknownGroupName" : "UNKNOWN_GROUP",
                "fOnNodeClicked": function (eMouseEvent, htData) {
                },
                "fOnNodeContextClicked": function (eMouseEvent, htData) {
                },
                "fOnLinkClicked": function (eMouseEvent, htData) {
                },
                "fOnLinkContextClicked": function (eMouseEvent, htData) {
                },
                "fOnBackgroundClicked": function (eMouseEvent, htData) {
                },
                "fOnBackgroundDoubleClicked": function (eMouseEvent, htData) {
                },
                "fOnBackgroundContextClicked": function (eMouseEvent, htData) {
                }
            });

            this.option(htOption);
            this._initVariables();
            this._initNodeTemplates();
            this._initLinkTemplates();
            this._initDiagramEnvironment();
            this._initOverview( $location );
        },

        /**
         * initialize variables
         *
         * @method _initVariables
         */
        _initVariables: function () {
            this.$ = go.GraphObject.make;
            this.nodeClickEventOnce = false;
            this._oDiagram = this.$(
                go.Diagram,
                this.option('sContainerId'),
                {
                    initialContentAlignment: go.Spot.Center,
                    maxSelectionCount: 1,
                    allowDelete: false
                }
            );
        },

        /**
         * initialize node templates
         *
         * @method _initNodeTemplates
         */
        _initNodeTemplates: function () {
            var self = this,
                sImageDir = this.option('sImageDir'),
                htIcons = this.option('htIcons');

            var infoTableTemplate = self.$(
                go.Panel,
                go.Panel.TableRow,
                {

                },
                self.$(
                    go.TextBlock,
                    {
                        margin: new go.Margin(0, 2),
                        column: 1,
                        stroke: "#848484",
                        font: self.option('sSmallFont')
                    },
                    new go.Binding('text', 'k')
                ),
                self.$(
                    go.TextBlock,
                    {
                        margin: new go.Margin(0, 2),
                        column: 2,
                        stroke: "#848484",
                        font: self.option('sSmallFont')
                    },
                    new go.Binding('text', 'v')
                )
            );

            var getNodeTemplate = function (sImageName) {
                return self.$(
                    go.Node,
                    new go.Binding("category", "serviceType"),
                    go.Panel.Auto,
                    {
                        selectionAdorned: false,
                        cursor: "pointer",
                        name: "NODE",
                        click: function (e, obj) {
                            self._onNodeClicked(e, obj);
                        },
                        contextClick: self._onNodeContextClicked.bind(self)
                    },
                    self.$(
                        go.Shape,
                        {
                            alignment: go.Spot.TopLeft,
                            alignmentFocus: go.Spot.TopLeft,
                            figure: "RoundedRectangle",
                            strokeWidth: 1,
//                            margin: new go.Margin(10, 10, 10, 10),
                            margin: 0,
                            isPanelMain: true,
//                            maxSize: new go.Size(150, NaN),
                            minSize: new go.Size(120, NaN),
                            name: "NODE_SHAPE",
                            portId: ""
                        },
                        new go.Binding("strokeWidth", "key", function (key) {
                            var type = 'default';
                            if (self.option('sBoldKey') && self.option('sBoldKey') === key) {
                                type = 'bold';
                            }
                            return self.option('htNodeTheme')[type].borderWidth;
                        }),
                        new go.Binding("stroke", "key", function (key) {
                            var type = 'default';
                            if (self.option('sBoldKey') && self.option('sBoldKey') === key) {
                                type = 'bold';
                            }
                            return self.option('htNodeTheme')[type].borderColor;
                        }),
                        new go.Binding("fill", "key", function (key) {
                            var type = 'default';
                            if (self.option('sBoldKey') && self.option('sBoldKey') === key) {
                                type = 'bold';
                            }
                            return self.option('htNodeTheme')[type].backgroundColor;
                        }),
                        new go.Binding("key", "key")
                    ),
                    self.$(
                        go.Panel,
                        go.Panel.Spot,
                        {
                        	name: "NODE_PANEL",
                            alignment: go.Spot.TopLeft,
                            alignmentFocus: go.Spot.TopLeft
                        },
                        self.$(
                            go.Panel,
                            go.Panel.Vertical,
                            {
                                alignment: go.Spot.TopLeft,
                                alignmentFocus: go.Spot.TopLeft,
                                minSize: new go.Size(120, NaN)
                            },
                            self.$(
                                go.Picture,
                                {
                                    source: sImageDir + sImageName,
                                    margin: new go.Margin(18, 0, 5, 0),
                                    desiredSize: new go.Size(80, 40),
                                    imageStretch: go.GraphObject.Uniform
                                }
                            ),
                            self.$(
                                go.TextBlock,
                                new go.Binding("text", "applicationName").makeTwoWay(),
                                {
                                    alignment: go.Spot.Center,
                                    name: "NODE_TEXT",
                                    margin: 6,
                                    font: self.option('sBigFont'),
//                                    wrap: go.TextBlock.WrapFit,
//                                    width: 130,
                                    editable: false
                                }
                            ),

                            // http://www.gojs.net/latest/samples/entityRelationship.html
                            // http://www.gojs.net/latest/samples/records.html
                            self.$(
                                go.Panel,
                                go.Panel.Table,
                                {
                                    padding: 2,
                                    minSize: new go.Size(100, 10),
                                    defaultStretch: go.GraphObject.Horizontal,
                                    itemTemplate: infoTableTemplate
                                },
                                new go.Binding("itemArray", "infoTable")
                            )
                        ),
                        self.$(
                            go.Panel,
                            go.Panel.Horizontal,
                            {
                                alignment: go.Spot.TopLeft,
                                alignmentFocus: go.Spot.TopLeft,
                                margin: 0
                            },
                            self.$(
                                go.Picture,
                                {
                                    source: sImageDir + 'ERROR.png',
                                    desiredSize: new go.Size(20, 20),
//                                    visible: false,
                                    imageStretch: go.GraphObject.Uniform,
                                    margin: new go.Margin(1, 5, 0, 1)
                                },
                                new go.Binding("visible", "hasAlert")
                            ),
                            self.$(
                                go.Picture,
                                {
                                    source: sImageDir + 'FILTER.png',
                                    desiredSize: new go.Size(17, 17),
                                    visible: false,
                                    imageStretch: go.GraphObject.Uniform
                                },
                                new go.Binding("visible", "isFiltered")
                            )
                        ),
                        self.$(
                            go.Panel,
                            go.Panel.Auto,
                            {
                                alignment: go.Spot.TopRight,
                                alignmentFocus: go.Spot.TopRight,
                                visible: false
                            },
                            new go.Binding("visible", "instanceCount", function (v) {
                                return v > 1 ? true : false;
                            }),
                            self.$(
                                go.Shape,
                                {
                                    figure: "RoundedRectangle",
                                    fill: "#848484",
                                    strokeWidth: 1,
                                    stroke: "#848484"
                                }
                            ),
                            self.$(
                                go.Panel,
                                go.Panel.Auto,
                                {
                                    margin: new go.Margin(0, 3, 0, 3)
                                },
                                self.$(
                                    go.TextBlock,
                                    new go.Binding("text", "instanceCount"),
                                    {
                                        stroke: "#FFFFFF",
                                        textAlign: "center",
                                        height: 16,
                                        font: self.option('sSmallFont'),
                                        editable: false
                                    }
                                )
                            )
                        )
                    )
                );
            };

            var unknownTableTemplate = self.$(
                go.Panel,
                go.Panel.TableRow,
                {
                },
                self.$(
                    go.Picture,
                    {
                        source: sImageDir + 'ERROR.png',
                        margin: new go.Margin(1, 2),
                        desiredSize: new go.Size(10, 10),
                        visible: false,
                        column: 1,
                        imageStretch: go.GraphObject.Uniform
                    },
                    new go.Binding("visible", "hasAlert")
                ),
                self.$(
                    go.TextBlock,
                    {
                    	name: "NODE_APPLICATION_NAME",
                        margin: new go.Margin(1, 2),
                        column: 2,
                        font: self.option('sSmallFont'),
//                        height:30,
                        alignment: go.Spot.Left
                    },
                    new go.Binding('text', 'applicationName'),
                    new go.Binding('click', 'key', function (key) {
                        return function (e, obj) {
                            e.bubbles = false;
                            self._onNodeClicked(e, obj, key);
                            return false;
                        };
                    })
                ),
                self.$(
                    go.TextBlock,
                    {
                        margin: new go.Margin(1, 2),
                        column: 3,
                        alignment: go.Spot.Right,
                        font: self.option('sSmallFont')
                    },
                    new go.Binding('text', 'totalCount', function (val) {
                        return Number(val, 10).toLocaleString();
                    })
                )
            );

            var getUnknownGroupTemplate = function (sImageName) {
                return self.$(
                    go.Node,
                    go.Panel.Auto,
                    {
                        selectionAdorned: false,
                        cursor: "pointer",
                        name: "NODE",
                        click: function (e, obj) {
                            if (e.bubbles) {
                                self._onNodeClicked(e, obj);
                            }
                        },
                        contextClick: self._onNodeContextClicked.bind(self)
                    },
                    self.$(
                        go.Shape,
                        {
                            figure: "RoundedRectangle",
//                            margin: new go.Margin(10, 10, 10, 10),
                            isPanelMain: true,
//                            maxSize: new go.Size(150, NaN),
                            minSize: new go.Size(100, 100),
                            name: "NODE_SHAPE",
                            portId: "",
                            strokeWidth: self.option('htNodeTheme').default.borderWidth,
                            stroke: self.option('htNodeTheme').default.borderColor,
                            fill: self.option('htNodeTheme').default.backgroundColor
                        },
                        new go.Binding("key", "key")
                    ),
                    self.$(
                        go.Panel,
                        go.Panel.Spot,
                        {
                        	name: "NODE_1SUB_PANEL",
                        },
                        self.$(
                            go.Panel,
                            go.Panel.Vertical,
                            {
                            	name: "NODE_2SUB_PANEL",
                                alignment: go.Spot.TopLeft,
                                alignmentFocus: go.Spot.TopLeft,
                                minSize: new go.Size(130, NaN)
                            },
                            self.$(
                                go.Picture,
                                {
                                    source: sImageDir + sImageName,
                                    margin: new go.Margin(0, 0, 5, 0),
                                    desiredSize: new go.Size(100, 40),
                                    imageStretch: go.GraphObject.Uniform
                                }
                            ),
                            self.$(
                                go.Panel,
                                go.Panel.Table,
                                {
                                    padding: 2,
                                    minSize: new go.Size(100, 10),
                                    defaultStretch: go.GraphObject.Horizontal,
                                    itemTemplate: unknownTableTemplate,
                                    name: "NODE_TEXT"
                                },
                                new go.Binding("itemArray", "unknownNodeGroup")
                            )
                        )
                    ),
                    self.$(
                        go.Panel,
                        go.Panel.Auto,
                        {
                            alignment: go.Spot.TopRight,
                            alignmentFocus: go.Spot.TopRight,
                            visible: false
                        },
                        new go.Binding("visible", "instanceCount", function (v) {
                            return v > 1 ? true : false;
                        }),
                        self.$(
                            go.Shape,
                            {
                                figure: "RoundedRectangle",
                                fill: "#848484",
                                strokeWidth: 1,
                                stroke: "#848484"
                            }
                        ),
                        self.$(
                            go.Panel,
                            go.Panel.Auto,
                            {
                                margin: new go.Margin(0, 3, 0, 3)
                            },
                            self.$(
                                go.TextBlock,
                                new go.Binding("text", "instanceCount"),
                                {
                                    stroke: "#FFFFFF",
                                    textAlign: "center",
                                    height: 16,
                                    font: self.option('sSmallFont'),
                                    editable: false
                                }
                            )
                        )
                    )
                );
            };

            _.each(htIcons, function (sVal, sKey) {
            	if ( sKey.indexOf( "_GROUP" ) != -1 ) {
                    this._oDiagram.nodeTemplateMap.add(sKey, getUnknownGroupTemplate(sVal));
                } else {
                    this._oDiagram.nodeTemplateMap.add(sKey, getNodeTemplate(sVal));
                }
            }, this);

        },

        /**
         * initialize link templates
         *
         * @method _initLinkTemplates
         */
        _initLinkTemplates: function () {
            var self = this,
                htLinkType = this.option('htLinkType'),
                option = {
                    selectionAdorned: false,
                    // selectionAdornmentTemplate: this._oDefaultAdornmentForLink,
//                    click: this._onLinkClicked.bind(this),
                    contextClick: this._onLinkContextClicked.bind(this),
                    layerName: "Foreground",
                    reshapable: false, // to disable reshape on links

                    // fromSpot: go.Spot.RightSide,
                    // toSpot: go.Spot.LeftSide,

                    // routing: go.Link[htLinkType.sRouting],
                    // routing : go.Link.Normal,
                    // routing: go.Link.Orthogonal,
                    // routing: go.Link.AvoidsNodes,

                    corner: 10,
                    cursor: "pointer"

                    // curve: go.Link[htLinkType.sCurve],
                    // curve: go.Link.JumpOver
                    // curve: go.Link.JumpGap
                    // curve: go.Link.Bezier
                },
                htLinkTheme = this.option("htLinkTheme"),
                sImageDir = this.option('sImageDir'),
                htDefault = htLinkTheme.default,
                bad = htLinkTheme.bad;

            var getLinkTemplate = function (htOption) {
                return self.$(
                    go.Link,  // the whole link panel
                    // { routing: go.Link.Normal, curve: go.Link.Bezier, toShortLength: 2 },
                    option,
                    new go.Binding("routing", "routing", function (val) {
                        return go.Link[val];
                    }),
                    new go.Binding("curve", "curve", function (val) {
                        return go.Link[val];
                    }),
                    new go.Binding("curviness", "curviness"),
                    self.$(
                        go.Shape,  // the link shape
                        {
                            name: "LINK",
                            isPanelMain: true,
                            stroke: htOption.borderColor,
                            strokeWidth: 1.5
                        }
                    ),
                    self.$(
                        go.Shape,  // the arrowhead
                        {
                            name: "ARROW",
                            toArrow: "standard",  // toArrow : kite, standard, OpenTriangle
                            fill: htOption.borderColor,
                            stroke: null,
                            scale: 1.5
                        }
                    ),
                    self.$(
                        go.Panel,
                        go.Panel.Auto,
                        self.$(
                            go.Shape,  // the link shape
                            "RoundedRectangle",
                            {
                                name: "LINK2",
                                fill: "#ffffff",
                                stroke: "#ffffff",
                                portId: "",
                                fromLinkable: true,
                                toLinkable: true
                            }
                        ),
                        self.$(
                            go.Panel,
                            go.Panel.Horizontal,
                            {
                                margin: 4
                            },
                            self.$(
                                go.Picture,
                                {
                                    source: sImageDir + 'FILTER.png',
                                    width: 14,
                                    height: 14,
                                    margin: 1,
                                    visible: false,
                                    imageStretch: go.GraphObject.Uniform
                                },
                                new go.Binding("visible", "isFiltered")
                            ),
                            self.$(
                                go.TextBlock,  // the label
                                {
                                	name: "LINK_TEXT",
                                    textAlign: htOption.fontAlign,
                                    font: htOption.fontFamily,
                                    margin: htOption.margin
                                },
//                                new go.Binding("text", "count", function (val) {
                                new go.Binding("text", "totalCount", function (val) {
                                    return Number(val, 10).toLocaleString();
                                }) ,
                                new go.Binding("stroke", "hasAlert", function (hasAlert) {
                                    return (hasAlert) ? bad.fontColor : htDefault.fontColor;
                                })
                            )
                        )
                    )
                );
            };

            this._oDiagram.linkTemplate = getLinkTemplate(htDefault);

            _.each(htLinkTheme, function (sVal, sKey) {
                if (sKey === "default") {
                    return;
                }
                this._oDiagram.linkTemplateMap.add(sKey, getLinkTemplate(sVal));
            }, this);
        },

        /**
         * initialize diagrams
         *
         * @method _initDiagramEnvironment
         */
        _initDiagramEnvironment: function () {
            var htPadding = this.option('htPadding');
            // have mouse wheel events zoom in and out instead of scroll up and
            // down
            this._oDiagram.toolManager.mouseWheelBehavior = go.ToolManager.WheelZoom;
            this._oDiagram.allowDrop = false;

            // read in the JSON-format data from the "mySavedModel" element
            this._oDiagram.initialAutoScale = go.Diagram.Uniform; // None,
            // Uniform,
            // UniformToFill
            // this._oDiagram.toolManager.linkingTool.direction =
            // go.LinkingTool.ForwardsOnly;
            this._oDiagram.toolManager.draggingTool.doCancel();
            this._oDiagram.toolManager.draggingTool.doDeactivate();
            this._oDiagram.toolManager.dragSelectingTool.isEnabled = false;
            this._oDiagram.initialContentAlignment = go.Spot.Center;
            this._oDiagram.padding = new go.Margin(htPadding.top, htPadding.right, htPadding.bottom, htPadding.left);
            this._oDiagram.layout = this.$(
                go.LayeredDigraphLayout,
                { // rdirection: 90,
                    isOngoing: false,
                    layerSpacing: 100,
                    columnSpacing: 30,
                    setsPortSpots: false
                    // packOption : 7 // sum of 1(PackExpand), 2(PackStraighten), 4(PackMedian)

// direction : 0,
// cycleRemoveOption : go.LayeredDigraphLayout.CycleDepthFirst,
// layeringOption : go.LayeredDigraphLayout.LayerOptimalLinkLength,
// initializeOption : go.LayeredDigraphLayout.InitDepthFirstOut,
// aggressiveOption : go.LayeredDigraphLayout.AggressiveLess,
// packOption : 7,
// setsPortSpots : true
                }
            );

            var self = this;
            // whenever selection changes, run updateHighlights
            this._oDiagram.addDiagramListener("ChangedSelection", function (e) {
                var selection = self._oDiagram.selection.first();
                if (selection) {
                    if (selection instanceof go.Node) {
                        if (!self.nodeClickEventOnce) {
                            self._onNodeClicked(e, selection);
                            self.nodeClickEventOnce = true;
                        }
                    } else if (selection instanceof go.Link) {
                        self._onLinkClicked(e, selection);
                    }
                }
                self._updateHightlights();
            });
            this._oDiagram.addDiagramListener("BackgroundSingleClicked", function (e) {
                var fOnBackgroundClicked = self.option('fOnBackgroundClicked');
                if (_.isFunction(fOnBackgroundClicked)) {
                    fOnBackgroundClicked.call(self, e);
                }
            });
            this._oDiagram.addDiagramListener("BackgroundDoubleClicked", function (e) {
                var fOnBackgroundDoubleClicked = self.option('fOnBackgroundDoubleClicked');
                if (_.isFunction(fOnBackgroundDoubleClicked)) {
                    fOnBackgroundDoubleClicked.call(self, e);
                }
            });
            this._oDiagram.addDiagramListener("BackgroundContextClicked", function (e) {
                var fOnBackgroundContextClicked = self.option('fOnBackgroundContextClicked');
                if (_.isFunction(fOnBackgroundContextClicked)) {
                    fOnBackgroundContextClicked.call(self, e);
                }
            });
        },
        /**
         * initialize Overview
         *
         * @method _initOverview
         */
        _initOverview: function ( $location ) {
        	
        	if ( /^\/main/.test( $location.path() ) ) {
	            this._oOverview = this.$( go.Overview,
	            		this.option('sOverviewId'),
	            		{ observed: this._oDiagram }
	            );
	            this._oOverview.box.elt(0).figure = "RoundedRectangle";
	            this._oOverview.box.elt(0).stroke = "#53069B";
	            this._oOverview.box.elt(0).strokeWidth = 4;
	        } else {
	        	$( "#" + this.option('sOverviewId') ).hide();
	        }
        },

        /**
         * load
         *
         * @method load
         * @param {Hash Table} str
         */
        load: function (str) {
            this.nodeClickEventOnce = false;
            this._sLastModelData = str;
            this._oDiagram.model = go.Model.fromJson(str);
            this._oDiagram.undoManager.isEnabled = true;
        },

        /**
         * clear diagram
         *
         * @method clear
         */
        clear: function () {
            this._oDiagram.model = go.Model.fromJson({});
        },

        /**
         * reset highlights
         *
         * @method _resetHighlights
         */
        _resetHighlights: function () {
        	var allNodes = this._oDiagram.nodes;
            var allLinks = this._oDiagram.links;
            while (allNodes.next()) {
                allNodes.value.highlight = false;
            }
            while (allLinks.next()) {
                allLinks.value.highlight = false;
            }
        },

        /**
         * update highlights
         *
         * @method _updateHighlights
         * @param {go.Node} selection
         */
        _updateHightlights: function (selection) {
            selection = selection || this._oDiagram.selection.first();
            if (selection === null) {
                return;
            }

            this._resetHighlights();
            selection.highlight = 'self';
            if (selection instanceof go.Node) {
                this._linksTo(selection, 'from');
                this._linksFrom(selection, 'to');
            } else if (selection instanceof go.Link) {
                this._nodesTo(selection, 'from');
                this._nodesFrom(selection, 'to');
            }

            // iterators containing all nodes and links in the diagram
            var allNodes = this._oDiagram.nodes,
                allLinks = this._oDiagram.links;

            // nodes, including groups
            while (allNodes.next()) {
                this._highlightNode(allNodes.value.findObject("NODE_SHAPE"), allNodes.value.findObject("NODE_TEXT"), allNodes.value.highlight);
            }
            // links
            while (allLinks.next()) {
                this._highlightLink(allLinks.value.findObject("LINK"), allLinks.value.highlight);
//                this._highlightLink(allLinks.value.findObject("LINK2"), allLinks.value.highlight);
                this._highlightLink(allLinks.value.findObject("ARROW"), allLinks.value.highlight, true);
                this._highlightLinkText(allLinks.value.findObject("LINK_TEXT"), allLinks.value.highlight);
            }
        },

        /**
         * highlight node by node key
         *
         * @method highlightNodeByKey
         * @param {String} sKey node key
         */
        highlightNodeByKey: function (sKey) {
            var node = this._oDiagram.findNodeForKey(sKey);
            if (node) {
                var part = this._oDiagram.findPartForKey(sKey);
                this._oDiagram.select(part);
                this._updateHightlights(node);
            }
        },

        /**
         * highlight link by from, to objects
         *
         * @method highlightLinkByFromTo
         * @param {String,Number} from
         * @param {String,Number} to
         */
        highlightLinkByFromTo: function (from, to) {
            var htLink = this._getLinkObjectByFromTo(from, to);
            if (htLink) {
                this._oDiagram.select(this._oDiagram.findPartForData(htLink));
                this._updateHightlights(this._oDiagram.findLinkForData(htLink));
            }
        },

        /**
         * get link by from, to objects
         *
         * @method _getLinkObjectByFromTo
         * @param {String,Number} from
         * @param {String,Number} to
         */
        _getLinkObjectByFromTo: function (from, to) {
            var aLink = this._oDiagram.model.linkDataArray;
            for (var i = 0, len = aLink.length; i < len; i += 1) {
                var htLink = aLink[i];
                if (htLink.from === from && htLink.to === to) {
                    return htLink;
                }
            }
            return false;
        },

        /**
         * highlight node
         * @param nodeShape
         * @param nodeText
         * @param theme
         * @private
         */
        _highlightNode: function (nodeShape, nodeText, theme) {
            if (nodeShape === null || nodeText === null) {
                return;
            }
            if (theme) {
                nodeShape.stroke = this.option('htHighlightNode').borderColor;
                nodeShape.strokeWidth = 2;
                nodeShape.part.isShadowed = true;
                
                if ( this._query != "" ) {
	                if ( nodeText.type === go.Panel.Table ) {
	                	for( var i = 0 ; i < nodeText.rowCount ; i++ ) {
	                		if ( new RegExp( this._query, "i" ).test( nodeText.elt(i).elt(1).text ) ) {
	                			nodeText.elt(i).elt(1).stroke = this.option('htHighlightNode').fontColor;
	                		}
	                	}
	                } else {
	                	if ( new RegExp( this._query, "i" ).test( nodeText.text ) ) {
	                		nodeText.stroke = this.option('htHighlightNode').fontColor;
	                	}
	                }
                }
//                nodeText.stroke = this.option('htHighlightNode')[theme].fontColor;
            } else {
                var type = (nodeShape.key === this.option('sBoldKey')) ? 'bold' : 'default';
                nodeShape.stroke = this.option('htNodeTheme')[type].borderColor;
                nodeShape.strokeWidth = 1;
                nodeShape.part.isShadowed = false;

                if ( nodeText.type === go.Panel.Table ) {                	
                	for( var i = 0 ; i < nodeText.rowCount ; i++ ) {
                		nodeText.elt(i).elt(1).stroke = this.option('htNodeTheme')[type].fontColor;
                	}
                } else {
                	nodeText.stroke = this.option('htNodeTheme')[type].fontColor;
                }

//                nodeText.stroke = this.option('htNodeTheme').default.fontColor;
            }
        },

        /**
         * highlight link
         * @param shape
         * @param theme
         * @private
         */
        _highlightLink: function (shape, theme, toFill) {
            if (shape === null) {
                return;
            }
            var color;
            if (theme) {
                color = this.option('htHighlightLink').borderColor;
                shape.strokeWidth = this.option('htHighlightLink').strokeWidth;
            } else {
                color = this.option('htLinkTheme').default.borderColor;
                shape.strokeWidth = this.option('htLinkTheme').default.strokeWidth;
            }
            if (toFill) {
                shape.fill = color;
            } else {
                shape.stroke = color;
            }
        },
        _highlightLinkText: function( nodeText, highlight ) {
        	if ( highlight ) {
        		nodeText.font = this.option('htHighlightLink').fontFamily;
        	} else {
        		nodeText.font = this.option('htLinkTheme').default.fontFamily;
        	}
        },

        /**
         * if the link connects to this node, highlight it
         *
         * @method _linksTo
         * @param {go.Node} x
         * @param {Number} i
         */
        _linksTo: function (x, i) {
            if (x instanceof go.Node) {
                var links = x.findLinksInto();
                while (links.next()) {
                    links.value.highlight = i;
                }
            }
        },

        /**
         * if the link comes from this node, highlight it
         *
         * @method _linksFrom
         * @param {go.Node} x
         * @param {Number} i
         */
        _linksFrom: function (x, i) {
            if (x instanceof go.Node) {
                var links = x.findLinksOutOf();
                while (links.next()) {
                    links.value.highlight = i;
                }
            }
        },

        /**
         * if selected object is a link, highlight its fromNode, otherwise,
         * highlight the fromNode of each link coming into the selected node
         *
         * @method _nodesTo
         * @param {go.Node} x
         * @param {Number} i
         * @return a List of the keys of the nodes
         */
        _nodesTo: function (x, i) {
            var nodesToList = new go.List("string");
            if (x instanceof go.Link) {
                x.fromNode.highlight = i;
                nodesToList.add(x.data.from);
            } else {
                var nodes = x.findNodesInto();
                while (nodes.next()) {
                    nodes.value.highlight = i;
                    nodesToList.add(nodes.value.data.key);
                }
            }
            return nodesToList;
        },

        /**
         * same as nodesTo, but from instead of to
         *
         * @method _nodesFrom
         * @param {go.Node} x
         * @param {Number} i
         */
        _nodesFrom: function (x, i) {
            var nodesFromList = new go.List("string");
            if (x instanceof go.Link) {
                x.toNode.highlight = i;
                nodesFromList.add(x.data.to);
            } else {
                var nodes = x.findNodesOutOf();
                while (nodes.next()) {
                    nodes.value.highlight = i;
                    nodesFromList.add(nodes.value.data.key);
                }
            }
            return nodesFromList;
        },

        /**
         * event of node click
         *
         * @method _onNodeClicked
         * @param {Event} e
         * @param {ojb} ojb
         * @param {String} unknownKey
         */
        _onNodeClicked: function (e, obj, unknownKey) {
            var node = obj.part,
                htData = node.data,
                fOnNodeClicked = this.option('fOnNodeClicked');
            if (_.isFunction(fOnNodeClicked)) {
                fOnNodeClicked.call(this, e, htData, unknownKey);
            }
            // node.diagram.startTransaction("onNodeClick");
            // node.diagram.commitTransaction("onNodeClick");
        },

        /**
         * event of node context click
         *
         * @method _onNodeContextClick
         * @param {Event} e
         * @param {ojb} ojb
         */
        _onNodeContextClicked: function (e, obj) {
        	console.log( "nodeContextClicked : ", this );
            var node = obj.part,
                htData = node.data,
                fOnNodeContextClicked = this.option('fOnNodeContextClicked');
            if (_.isFunction(fOnNodeContextClicked)) {
                fOnNodeContextClicked.call(this, e, htData);
            }
        },

        /**
         * event of link click
         *
         * @method _onLinkClicked
         * @param {Event} e
         * @param {ojb} ojb
         */
        _onLinkClicked: function (e, obj) {
            var link = obj.part,
                htData = link.data,
                fOnLinkClicked = this.option('fOnLinkClicked');
            if (_.isFunction(fOnLinkClicked)) {
                htData.fromNode = obj.fromNode.part.data;
                htData.toNode = obj.toNode.part.data;
                fOnLinkClicked.call(this, e, htData);
            }
        },

        /**
         * event of link context click
         *
         * @method _onLinkContextClicked
         * @param {Event} e
         * @param {ojb} ojb
         */
        _onLinkContextClicked: function (e, obj) {
            var link = obj.part,
                htData = link.data,
                fOnLinkContextClicked = this.option('fOnLinkContextClicked');
            if (_.isFunction(fOnLinkContextClicked)) {
                htData.fromNode = obj.fromNode.part.data;
                htData.toNode = obj.toNode.part.data;
                fOnLinkContextClicked.call(this, e, htData);
            }
        },

        /**
         * refresh
         */
        refresh: function () {
//            while (this._oDiagram.undoManager.canUndo()) {
//                this._oDiagram.undoManager.undo();
//            }
//            this._oDiagram.zoomToFit();
            this.load(this._sLastModelData);
        },

        /**
         * zoom to fit
         */
        zoomToFit: function () {
            this._oDiagram.zoomToFit();
            this._oDiagram.contentAlignment = go.Spot.Center;
            this._oDiagram.contentAlignment = go.Spot.None;
        },
        clearQuery: function() {
        	this._query = "";
        },
        /**
         * search node
         */
        searchNode: function( query, nodeServiceType ) {
        	this._query = query;
        	var allNodes = this._oDiagram.nodes,
        		selectedNode = null,
        		selectedIndex = 0,
        		similarNodeList = [],
        		returnNodeDataList = [];
        	
            while (allNodes.next()) {
                var node = allNodes.value;
                if ( node.data.unknownNodeGroup ) {
                	var unknownNodeGroup = node.data.unknownNodeGroup;
                	for( var i = 0; i < unknownNodeGroup.length ; i++ ) {
                		if ( new RegExp( query, "i" ).test( unknownNodeGroup[i].applicationName ) ) {
                			this._addNodeToTemporaryList( similarNodeList, returnNodeDataList, node, unknownNodeGroup[i], this.option("unknownGroupName") );
	                		break;
                		}
                	}
                } else {
	                if ( !angular.isUndefined( node.data.applicationName ) ) {
		                if ( new RegExp( query, "i" ).test( node.data.applicationName ) ) {
		                	this._addNodeToTemporaryList( similarNodeList, returnNodeDataList, node, node.data );
		                	if ( new RegExp( nodeServiceType, "i" ).test( node.data.serviceType ) ) {
		                		selectedIndex = similarNodeList.length - 1;
		                	}
		                }
	                }
                }
            }
         
            if ( similarNodeList.length != 0 ) {
            	this._selectAndHighlight( similarNodeList[selectedIndex] );
	        }
            if ( angular.isUndefined ( nodeServiceType ) ) {
            	return returnNodeDataList;
            }
        },
        _addNodeToTemporaryList : function( similarNodeList, returnNodeDataList, node, nodeData, serviceType ) {
        	similarNodeList.push( node );
    		returnNodeDataList.push({
        		applicationName: nodeData.applicationName,
        		serviceType: serviceType || nodeData.serviceType
        	});
        },
        _selectAndHighlight : function( selectedNode ) {
        	this._oDiagram.select( selectedNode );
            this._oDiagram.centerRect( selectedNode.actualBounds );
            this._onNodeClicked(null, selectedNode );
        }
    });

})(window, go, jQuery, _);