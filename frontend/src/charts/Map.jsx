import React, { Component } from 'react'
import { findDOMNode } from 'react-dom';
import Highcharts from 'highcharts';
import HighMaps from 'highcharts/highmaps'
import drilldown from 'highcharts/modules/drilldown';



class CustomHighMap extends Component{


    componentDidMount() {
// load modules
        drilldown(Highcharts);

        const options = {
            title: {
                text: 'Fruit Consumption'
            },
            plotOptions: {
                map: {
                    states: {
                        hover: {
                            color: '#EEDD66'
                        }
                    }
                }
            },
            colorAxis: {
                min: 0,
                minColor: '#E6E7E8',
                maxColor: '#005645'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            subtitle: {
                text: 'USA',
                floating: true,
                align: 'right',
                y: 50,
                style: {
                    fontSize: '16px'
                }
            },
            series: [{
                data: Highcharts.geojson(Highcharts.maps['https://code.highcharts.com/mapdata/countries/us/us-all.js']),
                name: 'USA',
                dataLabels: {
                    enabled: true,
                    format: '{point.properties.postal-code}'
                }
            }]
        };

        this.chart = new Highcharts['Map'](
            findDOMNode(this),
            options
        );
    }

    componentWillUnmount () {
        this.chart.destroy();
    }

    render() {
        return (
            <div className="in-highchart"></div>
        )
    }
}

export default CustomHighMap;