import React, {Component, Fragment} from 'react';
import HighchartsReact from "highcharts-react-official";
import { Card, Select} from "antd";
import {connect} from "react-redux";
const { Option } = Select;


class TopDestinationPortChart extends Component {

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
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Top Destination Ports | Bytes Received',
                style : {
                    fontSize: '15px'
                }
            },
            legend: {
                enabled: true
            },
            tooltip: {
                pointFormat: 'Bytes Received: <b>{point.y:.1f} MB</b>'
            },
            series: [{
                name: 'Applications',
                data: [
                    ['Port 80', 2420],
                    ['Port 443', 2080],
                    ['Port 137', 1490],
                    ['Port 22', 13.7],
                    ['Port 8000', 13.1],
                ]
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

export default connect(mapStateToProps,null)(TopDestinationPortChart);