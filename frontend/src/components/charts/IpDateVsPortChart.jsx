import React, {Component, Fragment} from "react";
import Highcharts from "highcharts";
require('highcharts/modules/heatmap')(Highcharts);
require("highcharts/modules/exporting")(Highcharts);
import {connect} from "react-redux";
import HighchartsReact from "highcharts-react-official";
import {Card, DatePicker, Select, Spin} from "antd";


class IpDateVsPortChart extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading:false,
            options : {
                chart: {
                        type: 'heatmap',
                        marginTop: 40,
                        marginBottom: 80,
                        plotBorderWidth: 1
                    },

                    title: {
                        text: 'Port Usage'
                    },

                    xAxis: {
                        categories: ['1/1/2020', '1/2/2020', '1/3/2020', '1/4/2020', '1/5/2020', '1/6/2020', '1/7/2020', '1/8/2020', '1/9/2020', '1/10/2020','1/11/2020','1/12/2020']
                    },

                    yAxis: {
                        categories: ['PORT 22', 'PORT 25', 'PORT 80', 'PORT 443', 'PORT 1521','PORT 8000','PORT 8888','PORT 8080','PORT 1234','PORT 12321'],
                        title: null,
                        reversed: true
                    },

                    colorAxis: {
                        min: 0,
                        minColor: '#FFFFFF',
                        maxColor: Highcharts.getOptions().colors[0]
                    },

                    legend: {
                        align: 'right',
                        layout: 'vertical',
                        margin: 0,
                        verticalAlign: 'top',
                        y: 25,
                        symbolHeight: 280
                    },

                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> sold <br><b>' +
                                this.point.value + '</b> items on <br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
                        }
                    },

                    series: [{
                        name: 'Sales per employee',
                        borderWidth: 1,
                        data: [[0, 0, 10], [0, 1, 19], [0, 2, 8], [0, 3, 24], [0, 4, 67], [1, 0, 92], [1, 1, 58], [1, 2, 78], [1, 3, 117], [1, 4, 48], [2, 0, 35], [2, 1, 15], [2, 2, 123], [2, 3, 64], [2, 4, 52], [3, 0, 72], [3, 1, 132], [3, 2, 114], [3, 3, 19], [3, 4, 16], [4, 0, 38], [4, 1, 5], [4, 2, 8], [4, 3, 117], [4, 4, 115], [5, 0, 88], [5, 1, 32], [5, 2, 12], [5, 3, 6], [5, 4, 120], [6, 0, 13], [6, 1, 44], [6, 2, 88], [6, 3, 98], [6, 4, 96], [7, 0, 31], [7, 1, 1], [7, 2, 82], [7, 3, 32], [7, 4, 30], [8, 0, 85], [8, 1, 97], [8, 2, 123], [8, 3, 64], [8, 4, 84], [9, 0, 47], [9, 1, 114], [9, 2, 31], [9, 3, 48], [9, 4, 91]],
                        dataLabels: {
                            enabled: true,
                            color: '#000000'
                        }
                    }],

                    responsive: {
                        rules: [{
                            condition: {
                                maxWidth: 500
                            },
                            chartOptions: {
                                yAxis: {
                                    labels: {
                                        formatter: function () {
                                            return this.value.charAt(0);
                                        }
                                    }
                                }
                            }
                        }]
                    }
            }
        }
    }
  render() {
        return (
            <Fragment>
                <Card
                    title = {
                            <Fragment>
                                <div>
                                {`Port Usage Chart`}
                                <Select
                                    onChange={value => this.setState({ basis: value })}
                                    size={"default"}
                                    style={{ width: "35%", float:"right", paddingRight: 5, paddingLeft: 5 }}
                                    defaultValue={"bytes"}
                                >
                                    <Select.Option key={"bytes"}>Bytes</Select.Option>
                                    <Select.Option key={"packets"}>Packets</Select.Option>
                                    <Select.Option key={"count"}>Count</Select.Option>
                                </Select>
                                </div>
                              </Fragment>
                    }>
                    <Spin tip="Loading..." spinning={this.state.loading}>
                            <HighchartsReact
                                allowChartUpdate={false}
                                highcharts={Highcharts}
                                ref = {'chart'}
                                options = {this.state.options}
                            />
                    </Spin>
                </Card>
            </Fragment>
        )
    }
}


const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,
        ip_address : state.ipSearchBar.ip_address,
        date_range : state.filter.date_range,
        firewall_rule : state.filter.firewall_rule,
        application : state.filter.application,
        protocol : state.filter.protocol,
        source_zone : state.filter.source_zone,
        destination_zone : state.filter.destination_zone
    }
}

export default connect(mapStateToProps,null)(IpDateVsPortChart);


