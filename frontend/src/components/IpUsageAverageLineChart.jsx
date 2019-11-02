import React, {Component, Fragment} from "react";
import Chart from "react-apexcharts";
import {ipUsageAverageTrendDataService} from "../services/ipUsageAverageTrendService";
import {connect} from "react-redux";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import moment from "moment";

class IpUsageAverageDailyTrendChart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data : [],
            options: {
                chart: {
                    "zoomType": 'x'
                },
                xAxis: {
                    type: 'string'
                },
                title: {
                    text: `Average Daily Trend of ${this.props.ip_address}`
                },
                series: [
                    {
                        type: 'line',
                        data: []
                    }
                ]
            }
        }
    }


    componentDidMount() {
        const {auth_token,ip_address} = this.props;
        this.chart = this.refs.chart.chart;
        ipUsageAverageTrendDataService(auth_token,ip_address).then(res => {
            const data = res.data;
            this.setState({
                data : data
            });
            console.log('average data',data);

        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevState.data != this.state.data){
            let data = this.state.data.bytes_received;
            data.sort(function(a, b) {
                return a[0] > b[0] ? 1 : -1;
            });
            this.chart.update({
                xAxis: {

                    type:"string",
                    categories : data.map(d=> d[0])
                },
                series: [
                    {
                        name : 'Bytes Received',
                        type : 'spline',
                        data : data.map(d=> d[1])
                    }
                ]
            })
        }
    }

    render() {
        return (
            <Fragment>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={this.state.options}
                    ref = {'chart'}
                />
            </Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,
        ip_address : state.ipSearchBar.ip_address
    }
}

export default connect(mapStateToProps,null)(IpUsageAverageDailyTrendChart);