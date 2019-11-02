import React, {Component, Fragment} from "react";
import Chart from "react-apexcharts";
import {ipUsageAverageTrendDataService} from "../services/ipUsageAverageTrendService";
import {connect} from "react-redux";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

class IpUsageAverageDailyTrendChart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data : [],
            options: {
                chart: {
                },
                xAxis: {
                    type: 'datetime'
                },
                title: {
                    text: 'Average Daily Trend'
                },
                series: [
                    {
                        type: 'spline',
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
        const {auth_token,ip_address} = this.props;
        if(prevState.data != this.state.data){
            const d = this.state.data.bytes_received;
            console.log('average data',d);
            this.chart.update({
                xAxis: {
                    type: 'datetime',
                    labels: {
                        enabled: true,
                        formatter: function() { return d[this.value][0];},
                    }
                },
                series: [
                    {
                        type: 'spline',
                        data: d
                    }
                ]
            })
        }
    }


    handleFetchData = () => {

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