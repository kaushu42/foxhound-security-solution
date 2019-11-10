import React, {Component, Fragment} from 'react';
import HighchartsReact from "highcharts-react-official";
import { Card, Select} from "antd";
const { Option } = Select;



class Test extends Component {

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
                text: 'Top 10 Source Address on the basis of Bytes Received'
            },
            subtitle: {
                text: 'Source: <a href="#">Sunrise Bank Pvt Ltd</a>'
            },
            xAxis: {
                type: 'category',
                labels: {
                    style: {
                        fontSize: '12px',
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
                enabled: false
            },
            tooltip: {
                pointFormat: 'Bytes Received: <b>{point.y:.1f} MB</b>'
            },
            series: [{
                name: 'Population',
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
                        fontSize: '12px',
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
                            <span style={{}}>Top Source Address</span>
                            <Select
                                size={'large'}
                                style={{width:'200px',float:'right',paddingRight:10,paddingLeft:10}}
                                defaultValue={"10"}>
                                    <Option key="10">Top 10</Option>
                                    <Option key="15">Top 15</Option>
                                    <Option key="20">Top 20</Option>
                            </Select>
                            <Select
                                size={'large'}
                                style={{width:'200px',float:'right',paddingRight:10,paddingLeft:10}}
                                defaultValue={'BytesReceived'}>
                                    <Option key={'BytesSent'}>Bytes Sent</Option>
                                    <Option key={'BytesReceived'}>Bytes Received</Option>
                                    <Option key={'PacketsSent'}>Packets Sent</Option>
                                    <Option key={'PacketsReceived'}>Packets Received</Option>
                                    <Option key={'RepeatCount'}>Repeat Count</Option>
                            </Select>
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

export default Test;