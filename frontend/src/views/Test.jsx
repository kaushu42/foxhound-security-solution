import React, {Component, Fragment} from 'react';
import HighchartsReact from "highcharts-react-official";
import {Button, Card, Select} from "antd";
const { Option } = Select;


class CardTitleFilter extends Component {
    render() {
        return (
            <Fragment>

            </Fragment>
        )
    }
}



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
                text: 'Top 10 Source address'
            },
            subtitle: {
                text: 'Source: <a href="#">Sunrise Banks</a>'
            },
            xAxis: {
                type: 'category',
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Population (millions)'
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                pointFormat: 'Population in 2017: <b>{point.y:.1f} millions</b>'
            },
            series: [{
                name: 'Population',
                data: [
                    ['Shanghai', 24.2],
                    ['Beijing', 20.8],
                    ['Karachi', 14.9],
                    ['Shenzhen', 13.7],
                    ['Guangzhou', 13.1],
                    ['Istanbul', 12.7],
                    ['Mumbai', 12.4],
                    ['Moscow', 12.2],
                    ['São Paulo', 12.0],
                    ['Delhi', 11.7],
                    ['Kinshasa', 11.5],
                    ['Tianjin', 11.2],
                    ['Lahore', 11.1],
                    ['Jakarta', 10.6],
                    ['Dongguan', 10.6],
                    ['Lagos', 10.6],
                    ['Bengaluru', 10.3],
                    ['Seoul', 9.8],
                    ['Foshan', 9.3],
                    ['Tokyo', 9.3]
                ],
                dataLabels: {
                    enabled: true,
                    rotation: -90,
                    color: '#FFFFFF',
                    align: 'right',
                    format: '{point.y:.1f}', // one decimal
                    y: 10, // 10 pixels down from the top
                    style: {
                        fontSize: '13px',
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
                            <span style={{}}>Top Demographic</span>
                            <Select
                                style={{width:'200px',float:'right',paddingRight:10,paddingLeft:10}}
                                defaultValue={"10"}>
                                    <option key="10">Top 10</option>
                                    <option key="15">Top 15</option>
                                    <option key="20">Top 20</option>
                            </Select>
                            <Select
                                style={{width:'200px',float:'right',paddingRight:10,paddingLeft:10}}
                                defaultValue={'SourceAddress'}>
                                <option key={'SourceAddress'}>Source Address</option>
                                <option key={'DestinationAddress'}>Destination Address</option>
                                <option key={'Applications'}>Applications</option>
                                <option key={'Ports'}>Ports</option>
                            </Select>
                            <Select
                                style={{width:'200px',float:'right',paddingRight:10,paddingLeft:10}}
                                defaultValue={'BytesReceived'}>
                                    <option key={'BytesSent'}>Bytes Sent</option>
                                    <option key={'BytesReceived'}>Bytes Received</option>
                                    <option key={'PacketsSent'}>Packets Sent</option>
                                    <option key={'PacketsReceived'}>Packets Received</option>
                                    <option key={'RepeatCount'}>Repeat Count</option>
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