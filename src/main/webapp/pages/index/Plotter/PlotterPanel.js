Ext.ns("WaterSMART");

WaterSMART.Plotter = Ext.extend(Ext.Panel, {
    contentPanel : undefined,
    legendDiv : undefined,
    legendPanel : undefined,
    plotterData : [],
    plotterTitle : undefined,
    plotterDiv : undefined,
    height : undefined,
    legendWidth : undefined,
    offering : undefined,
    sosStore : undefined,
    graph : undefined,
    ownerWindow : undefined,
    url : undefined,
    vars : undefined,
    yLabels : [],
    constructor : function(config) {
        config = config || {};
        this.plotterDiv = config.plotterDiv || 'dygraph-content';
        this.legendDiv = config.legendDiv || 'dygraph-legend';
        this.legendWidth = config.legendWidth || 100;
        this.height = config.height || 250;
        this.plotterTitle = config.title || 'Demo';
        this.offering = config.offering;
        this.ownerWindow = config.ownerWindow;
        this.url = config.url || "http://cida-wiwsc-gdp1qa.er.usgs.gov:8080/thredds/sos/watersmart/SYE.nc";
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
        
        this.loadSOSStore({
            url : this.url,
            vars : this.vars,
            offering : this.offering
        })
    },
    loadSOSStore : function(options) {
        var url = "proxy/" + options.url + "?service=SOS&request=GetObservation&version=1.0.0&offering=" + encodeURI(options.offering) + "&observedProperty=" + options.vars;
        this.yLabels = options.vars.split(',');
        this.sosStore = new GDP.SOSGetObservationStore({
            url : url, // gmlid is url for now, eventually, use SOS endpoint + gmlid or whatever param
            autoLoad : true,
            proxy : new Ext.data.HttpProxy({
                url: url, 
                disableCaching: false, 
                method: "GET"
            }),
            baseParams : {},
            listeners : {
                load : function(store) {
                    this.globalArrayUpdate(store);
                    if (this.sosStore.data.items.length) {
                        this.ownerWindow.add(this);
                        this.ownerWindow.show();
                    } else {
                        this.ownerWindow.hide();
                    }
                },
                exception : function() {
                    LOG.debug('Plotter: SOS store has encountered an exception.');
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
    globalArrayUpdate : function(store) {
        LOG.debug('Plotter:globalArrayUpdate()');
        var record = store.getAt(0);
        if (!record) {
            if (!this.errorDisplayed) {
                this.errorDisplayed = true;
                NOTIFY.warn({msg: 'SOS returned with no data'});
            }
            return;
        }
        this.plotterData = function(values) {
            Ext.each(values, function(item, index, allItems) {
                for(var i=0; i<item.length; i++) {
                    var value;
                    if (i==0) {
                        value = Date.parseISO8601(item[i].split('T')[0]);
                    }
                    else {
                        value = parseFloat(item[i])
                    }
                    allItems[index][i] = value;
                }
            });
            return values;
        }(record.get('values'));

        this.dygraphUpdateOptions(store);
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
        
        // this is mean for us, probably figure this out better?
        var yaxisUnits = record.get('dataRecord')[1].uom;

        // TODO figure out what to do if dataRecord has more than time and mean
        this.graph = new Dygraph(
            Ext.get(this.plotterDiv).dom,
            this.plotterData,
            { // http://dygraphs.com/options.html
                hideOverlayOnMouseOut : false,
                legend: 'always',
                //customBars: true,
                //errorBars: true,
                //fillAlpha: this.errorBarsOn ? 0.15 : 0.0,
                labels: ["Date"].concat(this.yLabels),
                labelsDiv: Ext.get(this.legendDiv).dom,
                labelsDivWidth: this.legendWidth,
                labelsSeparateLines : true,
                labelsDivStyles: {
                    'textAlign': 'right'
                },
                rightGap : 5,
                showRangeSelector: true,
                //ylabel: record.data.dataRecord[1].name,                            
                yAxisLabelWidth: 75,
                ylabel: 'test',
                //valueRange: [this.plotterYMin - (this.plotterYMin / 10) , this.plotterYMax + (this.plotterYMax / 10)],
                //visibility : this.visibility,
                axes: {
                    x: {
                        valueFormatter: function(ms) {
                            return '<span style="font-weight: bold; text-size: big">' +
                            new Date(ms).strftime('%Y') +
                            '</span>';
                        },
                        axisLabelFormatter: function(d) {
                            return d.strftime('%Y');
                        }
                    },
                    y: {
                        valueFormatter: function(y) {
                            return Math.round(y) + " " + yaxisUnits + "<br />";
                        }
                    }
                }
            }
            );
    }
});
    