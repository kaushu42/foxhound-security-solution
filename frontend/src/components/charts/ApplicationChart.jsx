import React, {Component} from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {connect} from "react-redux";


class ApplicationChart extends Component {


    state = {
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
                {
                    name: 'SSH',
                    type: 'areaspline',
                    data: [
                        [1573899139,10],
                        [2574899239,30],
                        [2575899339,20],
                        [2576899439,40],

                    ]
                },
                {
                    name: 'ms-sql',
                    type: 'areaspline',
                    data: [
                        [1571899139,10],
                        [1572899239,30],
                        [1573899339,20],
                        [1574899439,40],

                    ]
                }

            ]
        }
    }


    render() {
        return (
            <HighchartsReact
                allowChartUpdate={false}
                highcharts={Highcharts}
                ref = {'chart'}
                options = {this.state.options}
            />
        )
    }
}

export default connect(null,null)(ApplicationChart)