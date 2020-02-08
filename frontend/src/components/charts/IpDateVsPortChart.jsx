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
                        data: [{
                            x: 'A',
                            y: 3,
                            value: 10,
                            name: "Point2",
                        }, {
                            x: 'A',
                            y: 7,
                            value: 10,
                            name: "Point1",
                        }],
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


