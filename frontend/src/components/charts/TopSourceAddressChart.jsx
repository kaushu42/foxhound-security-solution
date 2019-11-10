import React, {Component, Fragment} from 'react';
import HighchartsReact from "highcharts-react-official";
import { Card, Select} from "antd";
import {connect} from "react-redux";
const { Option } = Select;


class TopSourceAddressChart extends Component {

    constructor(props) {
        super(props);
        this.state = { seconds: 0 };
    }
    componentDidMount = () => {
        this.chart = this.refs.chart.chart;
    }


    render(){
        const options = {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Top Source Address | Bytes Received',
                style : {
                    fontSize: '15px'
                }
            },
            xAxis: {
                type: 'category',
                labels: {
                    style: {
                        fontSize: '10px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Bytes Received (MB)'
                }
            },
            legend: {
                enabled: true
            },
            tooltip: {
                pointFormat: 'Bytes Received: <b>{point.y:.1f} MB</b>'
            },
            series: [{
                name: 'Source Address',
                data: [
                    ['192.168.10.10', 242000],
                    ['192.168.114.4', 208000],
                    ['192.168.23.1', 149000],
                    ['192.168.23.10', 13.7],
                    ['202.53.3.65', 13.1],
                    ['202.53.3.79', 5.7],
                    ['202.53.3.34', 12.7],
                    ['202.100.3.12', 12.7],
                    ['202.53.3.79', 15.7],
                    ['202.53.3.79', 110.7]
                ],
                dataLabels: {
                    enabled: true,
                    rotation: -90,
                    color: '#FFFFFF',
                    align: 'right',
                    format: '{point.y:.1f}', // one decimal
                    y: 10, // 10 pixels down from the top
                    style: {
                        fontSize: '10px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            }]
        }
        return (
            <Fragment>
                <div>
                    <Card title={
                        <Fragment>
                            <div>
                                <Select
                                    size={'default'}
                                    style={{width:'50%',paddingRight:10,paddingLeft:10}}
                                    defaultValue={"10"}>
                                    <Option key="5">Top 5</Option>
                                    <Option key="10">Top 10</Option>
                                    <Option key="15">Top 15</Option>
                                </Select>
                                <Select
                                    size={'default'}
                                    style={{width:'50%',paddingRight:10,paddingLeft:10}}
                                    defaultValue={'BytesReceived'}>
                                    <Option key={'BytesSent'}>Bytes Sent</Option>
                                    <Option key={'BytesReceived'}>Bytes Received</Option>
                                    <Option key={'PacketsSent'}>Packets Sent</Option>
                                    <Option key={'PacketsReceived'}>Packets Received</Option>
                                    <Option key={'RepeatCount'}>Repeat Count</Option>
                                </Select>
                            </div>
                        </Fragment>
                    }>
                        <HighchartsReact
                            highcharts={this.props.highcharts}
                            constructorType={"chart"}
                            options={options}
                            ref={"chart"}
                        />
                    </Card>
                </div>
            </Fragment>
        )
    }
}


const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token
    }
}

export default connect(mapStateToProps,null)(TopSourceAddressChart);