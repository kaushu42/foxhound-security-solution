import React, {Component} from "react";
import Highcharts from "highcharts";
import Chart from "./Chart";
require('highcharts/modules/sankey')(Highcharts);
require("highcharts/modules/exporting")(Highcharts);

const chartOptions = {

    chart : {
        margin : 50,

    },
    title: {
        text: "IP ADDRESS AS SOURCE"
    },
    series: [
        {
            keys: ['from', 'to', 'weight'],
            data: [
                ['192.168.10.10', '192.168.10.100', 94],
                ['192.168.10.10', '192.168.10.110', 194],
                ['192.168.10.10', '192.168.10.120', 294],
                ['192.168.10.10', '192.168.10.130', 394]
            ],
            type: "sankey"
        }
    ]
};



class SankeyChart extends Component {
    render() {
        return (
            <Chart options={chartOptions} highcharts={Highcharts} />
        )
    }
}

export default SankeyChart;