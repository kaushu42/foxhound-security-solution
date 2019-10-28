import React, {Component, Fragment} from "react";
import Chart from "react-apexcharts";


class IpUsageAverageDailyTrendChart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            options: {
                chart: {
                    toolbar: {
                        show: true,
                        tools: {
                            download: true,
                            selection: true,
                            zoom: true,
                            zoomin: true,
                            zoomout: true,
                            pan: true,
                            reset: true | '<img src="/static/icons/reset.png" width="20">',
                            customIcons: []
                        },
                        autoSelected: 'zoom'
                    },

                },
                plotOptions: {
                    line: {
                        curve: 'smooth',
                    }
                },
                dataLabels: {
                    enabled: false
                },

                markers: {
                    size: 0,
                    style: 'full',
                },
                //colors: ['#0165fc'],
                title: {
                    text: 'Average Daily Trend',
                    align: 'center'
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        inverseColors: false,
                        opacityFrom: 0.5,
                        opacityTo: 0,
                        stops: [0, 90, 100]
                    },
                },
                xaxis: {
                    categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
                },
            },
            series: [
                {
                    name: "Bytes Recieved",
                    data: [30, 40, 45, 500, 49, 60, 70, 91]
                },
                {
                    name: "Bytes Sent",
                    data: [3, 4, 4, 5, 4, 6, 7, 9]
                }

            ]
        }
    }

    render() {
        return (
            <Fragment>
                <Chart options={this.state.options} series={this.state.series} type="area" height="350" />
            </Fragment>
        );
    }
}

export default IpUsageAverageDailyTrendChart;