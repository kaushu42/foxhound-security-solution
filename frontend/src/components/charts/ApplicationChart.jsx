import React, {Component} from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {connect} from "react-redux";


class ApplicationChart extends Component {


    state = {
        data : {
            "data": {
                "mssql-db-unencrypted": [
                    [
                        1552348800,
                        84646
                    ]
                ],
                "netbios-dg": [
                    [
                        1552348800,
                        3705
                    ]
                ],
                "netbios-ns": [
                    [
                        1552348800,
                        1536
                    ]
                ],
                "ntp": [
                    [
                        1552348800,
                        9212
                    ]
                ],
                "ping": [
                    [
                        1552348800,
                        1224
                    ]
                ]
            }
        },


        options : {
            chart:{
                zoomType: 'x'
            },
            title: {
                text: 'Time vs Application chart'
            },
            xAxis : {
                type : 'datetime'

            },
            series: [

            ]
        }
    }

    componentDidMount() {
        this.chart = this.refs.chart.chart;
        this.chart.component = this;
        let dataSeries = [];
        Object.keys(this.state.data.data).forEach(key=>{
            console.log(`${key} : ${this.state.data.data[key]}`);
            let tempSeries = {
                name : key,
                type : 'spline',
                data : this.state.data.data[key]
            }
            dataSeries.push(tempSeries);
        });

        this.chart.update({
            chart:{
                zoomType: 'x'
            },
            title: {
                text: 'Time vs Application chart'
            },
            xAxis : {
                type : 'datetime'

            },
            series: dataSeries
        });

        console.log(this.chart);
    }

    render() {
        return (
            <HighchartsReact
                allowChartUpdate={true}
                highcharts={Highcharts}
                ref = {'chart'}
                options = {this.state.options}
            />
        )
    }
}

export default connect(null,null)(ApplicationChart)