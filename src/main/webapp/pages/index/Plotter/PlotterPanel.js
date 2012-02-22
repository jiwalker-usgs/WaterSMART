Ext.ns("WaterSMART");

WaterSMART.Plotter = Ext.extend(Ext.Panel, {
    plotterData : [],
    plotterTitle : undefined,
    plotterDiv : undefined,
    legendDiv : undefined,
    height : undefined,
    legendWidth : undefined,
    sosStore : undefined,
    graph : undefined,
    yLabels : [],
    constructor : function(config) {
        config = config || {};
        this.plotterDiv = config.plotterDiv || 'dygraph-content';
        this.legendDiv = config.legendDiv || 'dygraph-legend';
        this.legendWidth = config.legendWidth || 100;
        this.height = config.height || 200;
        this.plotterTitle = config.title || 'Demo';
        
        var contentPanel = new Ext.Panel({
            contentEl : this.plotterDiv,
            itemId : 'contentPanel',
            ref : '../contentPanel',
            layout : 'fit',
            region : 'center',
            autoShow : true
        });
        var legendPanel = new Ext.Panel({
            itemId : 'legendPanel',
            ref : '../legendPanel',
            contentEl : this.legendDiv,
            layout : 'fit', 
            region : 'east',
            width : this.legendWidth,
            autoShow : true
        });
        
        config = Ext.apply({
            items : [contentPanel, legendPanel],
            layout : 'border',
            autoShow : true,
            //tbar : this.toolbar,
            bufferResize : true,
            split: true
        }, config);
        
        WaterSMART.Plotter.superclass.constructor.call(this, config);
    },
    loadSOSStore : function(meta, offering) {
        var url = "proxy/" + meta.url + "?service=SOS&request=GetObservation&version=1.0.0&offering=" + encodeURI(offering) + "&observedProperty=" + meta.vars;
        this.yLabels = meta.vars.split(',');
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
                    this.globalArrayUpdate(store, meta);
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
    globalArrayUpdate : function(store, meta) {
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
    resizePlotter : function() {
        LOG.debug('Plotter:resizePlotter()');
        var divPlotter = Ext.get(this.plotterDiv);
        var divLegend = Ext.get(this.legendDiv);
        
        divLegend.setWidth(this.legendWidth);
        divPlotter.setWidth(this.getWidth() - (this.legendWidth + 2));
        divPlotter.setHeight(this.getHeight()); 
        if (this.graph) {
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
    