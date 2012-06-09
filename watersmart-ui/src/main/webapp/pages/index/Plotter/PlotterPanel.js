Ext.ns("WaterSMART");

WaterSMART.Plotter = Ext.extend(Ext.Panel, {
    contentPanel : undefined,
    legendDiv : undefined,
    legendPanel : undefined,
    combinedSosData : {},
    plotterData : [],
    plotterTitle : undefined,
    plotterDiv : undefined,
    height : undefined,
    legendWidth : undefined,
    offering : undefined,
    sosStore : undefined,
    observedStore : undefined,
    loadingStatus : undefined,
    graph : undefined,
    ownerWindow : undefined,
    url : undefined,
    vars : [],
    yLabels : [],
    constructor : function (config) {
        config = config || {};
        this.plotterDiv = config.plotterDiv || 'dygraph-content';
        this.legendDiv = config.legendDiv || 'dygraph-legend';
        this.legendWidth = config.legendWidth || 150;
        this.height = config.height || 250;
        this.plotterTitle = config.title || 'Demo';
        this.offering = config.offering;
        this.ownerWindow = config.ownerWindow;
        this.url = config.url;
        this.vars = config.vars;

        this.contentPanel = new Ext.Panel({
            contentEl : this.plotterDiv,
            id : 'contentPanel',
            itemId : 'contentPanel',
            ref : '../contentPanel',
            layout : 'fit',
            region : 'center',
            autoShow : true
        });
        this.legendPanel = new Ext.Panel({
            itemId : 'legendPanel',
            ref : '../legendPanel',
            contentEl : this.legendDiv,
            layout : 'fit',
            region : 'east',
            width : this.legendWidth,
            autoShow : true
        });

        config = Ext.apply({
            items : [this.contentPanel, this.legendPanel],
            ref : 'plotterPanel',
            layout : 'border',
            autoShow : true,
            bufferResize : true,
            split: true
        }, config);

        WaterSMART.Plotter.superclass.constructor.call(this, config);

        this.loadingStatus = {
            modeled : "starting",
            observed : "starting"
        };

        this.loadSOSStore({
            url : this.url,
            vars : this.vars,
            offering : this.offering
        });
        //this.loadingStatus.modeled = "complete";

        this.loadObserved({
            url : CONFIG.OBSERVED_SOS,
            offering : this.offering
        });
    },
    loadSOSStore : function (options) {
        var observedProperties = options.vars.join(",");
        var url = CONFIG.PROXY + options.url + "?service=SOS&request=GetObservation&version=1.0.0&offering=" + encodeURI(options.offering) + "&observedProperty=" + observedProperties;
        this.yLabels = this.yLabels.concat(options.vars);
        this.sosStore = new CIDA.SOSGetObservationStore({
            url : url,
            autoLoad : true,
            proxy : new Ext.data.HttpProxy({
                url: url,
                disableCaching: false,
                method: "GET"
            }),
            baseParams : {},
            listeners : {
                load : function (store) {
                    this.globalArrayUpdate(store, "modeled");
                    this.loadingStatus.modeled = "complete";
                    if (this.loadingStatus.observed === "complete") {
                        this.dygraphUpdateOptions(store);
                        if (this.sosStore.data.items.length) {
                            this.ownerWindow.add(this);
                            this.ownerWindow.show();
                        } else {
                            this.ownerWindow.hide();
                        }
                    }
                },
                exception : function () {
                    LOG.debug('Plotter: SOS store has encountered an exception.');
                    this.loadingStatus.modeled = "failed";
                    // I only want to display this message once per request,
                    if (!this.errorDisplayed) {
                        this.errorDisplayed = true;
                        NOTIFY.warn({msg: 'Unable to contact SOS service'});
                    }
                },
                scope: this
            }
        });
    },
    loadObserved : function (options) {
        var observedProperties = "Discharge";
        var url = CONFIG.PROXY + options.url + "?service=SOS&request=GetObservation&version=1.0.0&offering=MEAN&observedProperty="
            + observedProperties + "&featureId=" + options.offering + "&beginPosition=2000-01-01&endPosition=2000-01-23";
        this.yLabels.push("Observed");
        this.observedStore = new CIDA.SOSGetObservationStore({
            url : url,
            autoLoad : true,
            proxy : new Ext.data.HttpProxy({
                url: url,
                disableCaching: false,
                method: "GET"
            }),
            baseParams : {},
            listeners : {
                load : function (store) {
                    this.globalArrayUpdate(store, "observed");
                    this.loadingStatus.observed = "complete";
                    if (this.loadingStatus.modeled === "complete") {
                        this.dygraphUpdateOptions(store);
                        if (this.sosStore.data.items.length) {
                            this.ownerWindow.add(this);
                            this.ownerWindow.show();
                        } else {
                            this.ownerWindow.hide();
                        }
                    }
                },
                exception : function () {
                    LOG.debug('Plotter: SOS store has encountered an exception.');
                    this.loadingStatus.observed = "failed";
                    // I only want to display this message once per request,
                    if (!this.errorDisplayed) {
                        this.errorDisplayed = true;
                        NOTIFY.warn({msg: 'Unable to contact SOS service'});
                    }
                },
                scope: this
            }
        });
    },
    globalArrayUpdate : function (store, series) {
        LOG.debug('Plotter:globalArrayUpdate()');
        var record = store.getAt(0);
        if (!record) {
            if (!this.errorDisplayed) {
                this.errorDisplayed = true;
                NOTIFY.warn({msg: 'SOS returned with no data'});
            }
            return;
        }

        Ext.each(record.get('values'), function (item, index, allItems) {
            var date;
            var data;
            if (item.length) {
                for (var i=0; i<item.length; i++) {
                    if (i==0) {
                        date = Date.parseISO8601(item[i].split('T')[0]);
                    }
                    else {
                        // sacrificed multiple datatypes here, hoping to get it to work
                        data = parseFloat(item[i]);
                    }
                }
            } else {
                date = Date.parseISO8601(item.time.split('T')[0]);
                data = parseFloat(item.value);
            }
            if (!this.combinedSosData[date]) {
                this.combinedSosData[date] = {};
            }
            this.combinedSosData[date][series] = data;
        }, this);
    },
    combineSeries : function() {
        var returnData = [];
        if (this.loadingStatus.modeled !== "complete") {
            NOTIFY.warn({msg: "Modeled data source loaded incorrectly, try again!"});
            return [];
        } else if (this.loadingStatus.observed !== "complete") {
            NOTIFY.warn({msg: "Observed data source loaded incorrectly"});
        }
        var keys = []; // need to sort dates
        for (var key in this.combinedSosData) {
            if (this.combinedSosData.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        keys.sort(function(a, b) {
            return new Date(a).getTime() - new Date(b).getTime();
        });
        for (var i=0; i<keys.length; i++) {
            var timestep = [];
            var date = keys[i];
            timestep.push(new Date(date));
            if (this.combinedSosData[date]) {
                if (this.combinedSosData[date]["modeled"]) {
                    timestep.push(this.combinedSosData[date]["modeled"]);
                } else {
                    timestep.push(null);
                }
                if (this.combinedSosData[date]["observed"]) {
                    timestep.push(this.combinedSosData[date]["observed"]);
                } else {
                    timestep.push(null);
                }
                returnData.push(timestep);
            } else {
                LOG.debug("Date was somehow: " + date);
            }
        }
        return returnData;
    },
    resizePlotter : function(width, height) {
        LOG.debug('Plotter:resizePlotter(): Incoming width: '+width+', incoming height: ' + height);
        var divPlotter = Ext.fly(this.plotterDiv);
        var divLegend = Ext.fly(this.legendDiv);
        
        LOG.debug('Plotter:resizePlotter(): Setting legend div width to ' + this.legendWidth);
        divLegend.setWidth(this.legendWidth);
        
        LOG.debug('Plotter:resizePlotter(): Setting plotter div width to ' + ((width + 2) - divLegend.getWidth()));
        divPlotter.setWidth((width + 2) - this.legendWidth -20);

        var panelHeight = height;
        var plotterDivHeight = height - 40
        LOG.debug('Plotter:resizePlotter(): Setting plotter PlotterPanel height to ' + panelHeight);
        LOG.debug('Plotter:resizePlotter(): Setting plotter Plotter div height to ' + plotterDivHeight);
        this.setHeight(height);
        divPlotter.setHeight(height - 40); 
        
        if (this.graph) {
            LOG.debug('Plotter:resizePlotter(): Setting graph width ' + divPlotter.getWidth() + ', height: ' + divPlotter.getHeight());
            this.graph.resize(divPlotter.getWidth(), divPlotter.getHeight());
        }
    },
    dygraphUpdateOptions : function(store) {
        var record = store.getAt(0);
        
        var yaxisUnits = "cfs";

        // TODO figure out what to do if dataRecord has more than time and mean
        this.graph = new Dygraph(
            Ext.get(this.plotterDiv).dom,
            this.combineSeries(),
            { // http://dygraphs.com/options.html
                hideOverlayOnMouseOut : false,
                legend: 'always',
                labels: ["Date"].concat(this.yLabels),
                labelsDiv: Ext.get(this.legendDiv).dom,
                labelsDivWidth: this.legendWidth,
                labelsSeparateLines : true,
                labelsDivStyles: {
                    'textAlign': 'right'
                },
                rightGap : 5,
                showRangeSelector: true,
                yAxisLabelWidth: 75,
                ylabel: 'MEAN',
                axes: {
                    x: {
                        valueFormatter: function(ms) {
                            return '<span id="plotter-year-output-display">' + new Date(ms).format('Y-m-d') + '</span>';
                        },
                        axisLabelFormatter: function(d) {
                            return '<span class="plotter-x-label-display">' + d.strftime('%Y') + '</span>';
                        }
                    },
                    y: {
                        valueFormatter: function(y) {
                            return "<span id='plotter-value-output-display'>" + Math.round(y) + " " + yaxisUnits + "</span><br />";
                        }
                    }
                }
            }
        );
    }
});
    