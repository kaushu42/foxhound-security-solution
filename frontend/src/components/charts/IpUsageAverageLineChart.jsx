import React, {Component, Fragment} from "react";
import {ipUsageAverageTrendDataService} from "../../services/ipUsageAverageTrendService";
import {connect} from "react-redux";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
NoDataToDisplay(Highcharts);
import '../../charts/chart.css';
import {Card, Spin, DatePicker} from "antd";

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

class IpUsageAverageDailyTrendChart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            average_daily_data : [],
            recent_data : [],
            unit : "",
            options: {
                chart: {
                    zoomType: 'x'
                },
                xAxis: {
                    type: "datetime",
                    labels: {
                        format: '{value:%H:%M}'
                    },
                    dateTimeLabelFormats: {
                    //   day: "%Y-%b-%d"
                    day: "%H-%M"
                    }
                },
                yAxis:{
                    labels :{
                        formatter: function () {
                            return this.value + ' MB';
                        }
                    }
                },
                title: {
                    text: `Average Daily Trend for Bytes Received of ${this.props.ip_address}`
                },
                series: [
                    {
                        type: 'spline',
                        data: []
                    },
                    {
                        type: 'spline',
                        data: []
                    }
                ],
                tooltip: {
                    valueDecimals: 2,
                    shared: true,
                    xDateFormat: "%H-%M"
                },
            }
        }
    }


    componentDidMount() {
        this.handleFetchData();
        this.chart = this.refs.chart.chart;
        if (document.addEventListener) {
            document.addEventListener('webkitfullscreenchange', this.exitHandler, false);
            document.addEventListener('mozfullscreenchange', this.exitHandler, false);
            document.addEventListener('fullscreenchange', this.exitHandler, false);
            document.addEventListener('MSFullscreenChange', this.exitHandler, false);
        }
    }

    handleFetchData = (selectedDate = undefined) => {
        this.setState({
            loading : true
        });

        const {auth_token,ip_address} = this.props;
        ipUsageAverageTrendDataService(auth_token,ip_address,selectedDate).then(res => {
            console.log('fetching average data for ip',ip_address)
            const average_daily_data = res[0].data;
            const recent_data = res[1].data;
            if(average_daily_data["bytes_received_max"]>1000000000){
                average_daily_data["bytes_received"] = average_daily_data["bytes_received"].map(e => [((e[0]*1000)),e[1]/(1024*1024*1024)])
                recent_data["bytes_received"] = recent_data["bytes_received"].map(e => [((e[0]*1000)),e[1]/(1024*1024*1024)])
                this.setState({
                    average_daily_data : average_daily_data,
                    recent_data : recent_data,
                    unit: "GB"
                })
            }
            else if(average_daily_data["bytes_received_max"]>1000000 && average_daily_data["bytes_received_max"]<1000000000){
                  average_daily_data["bytes_received"] = average_daily_data["bytes_received"].map(e => [((e[0]*1000)),e[1]/(1024*1024)])
                  recent_data["bytes_received"] = recent_data["bytes_received"].map(e => [((e[0]*1000)),e[1]/(1024*1024)])
                  this.setState({
                      average_daily_data : average_daily_data,
                      recent_data : recent_data,
                      unit: "MB"
                  })
              }
            else if(average_daily_data["bytes_received_max"]>1000 && average_daily_data["bytes_received_max"]<1000000){
                  average_daily_data["bytes_received"] = average_daily_data["bytes_received"].map(e => [((e[0]*1000)),e[1]/(1024)])
                  recent_data["bytes_received"] = recent_data["bytes_received"].map(e => [((e[0]*1000)),e[1]/(1024)])
                  this.setState({
                      average_daily_data : average_daily_data,
                      recent_data : recent_data,
                      unit: "KB"
                  })
              }
            else{
                  this.setState({
                      average_daily_data : average_daily_data,
                      recent_data : recent_data,
                      unit: "Bytes"
                  })
            }            
            console.log('fetched data ',recent_data);
        })

    }


    exitHandler = () => {
        if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) {
            console.log('Inside fullscreen. Doing chart stuff.');
            this.chart = this.refs.chart.chart;
            this.chart.update({
                chart:{
                    height: null
                }
            })
        }

        if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
            console.log('Exiting fullscreen. Doing chart stuff.');
            this.chart = this.refs.chart.chart;
            this.chart.update({
                chart:{
                    height:'400px'
                }
            })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            (String(prevProps.ip_address)!==String(this.props.ip_address))
            // (String(prevProps.date_range[0])!==String(this.props.date_range[0])) ||
            // (String(prevProps.date_range[1])!==String(this.props.date_range[1])) ||
            // (String(prevProps.firewall_rule)!==String(this.props.firewall_rule)) ||
            // (String(prevProps.application)!==String(this.props.application)) ||
            // (String(prevProps.protocol)!==String(this.props.protocol)) ||
            // (String(prevProps.source_zone)!==String(this.props.source_zone)) ||
            // (String(prevProps.destination_zone)!==String(this.props.destination_zone))
        ){
            this.handleFetchData();
        }
        if(prevState.average_daily_data!==this.state.average_daily_data){
            let averageDataSeries = this.state.average_daily_data["bytes_received"]
            let recentDataSeries = this.state.recent_data["bytes_received"]
            this.updateChart(averageDataSeries, recentDataSeries, this.state.unit);
        }
    }
    updateChart = (average_daily_data, recent_data, unit) => {
        let bytesReceived = this.state.average_daily_data.bytes_received;
        if (bytesReceived.length == 0){
            Highcharts.setOptions({
                lang: {
                    noData: 'No data is available in the chart'
                }
            });
            this.chart.update({
                series : []
            })
        }
        // bytesReceived.sort(function(a, b) {
        //     return a[0] > b[0] ? 1 : -1;
        // });
        this.chart.update({
            title : {
              text : `Average Daily Trend for Bytes Received of ${this.props.ip_address}`
            },
            series: [
                {
                    name : 'Bytes Received' + '(' + unit + ')',
                    type : 'spline',
                    data : recent_data
                },
                {
                    name : 'Average Bytes Received' + '(' + unit + ')',
                    type : 'spline',
                    data : average_daily_data
                },
            ],
            yAxis:{
                title:{
                    text:"Bytes Received",
                  },
                  labels :{
                      formatter: function () {
                          return this.value + " " + unit;
                      }
                  }
            },
            tooltip: {
                valueSuffix: unit
            },
        })
        this.setState({
            loading : false
        });

    }

    onChange = (date, dateString) => {
        console.log(" printing date", dateString)
        this.handleFetchData(dateString)
    }

    render() {
        console.log("loading",this.state.loading);
        return (
            <Fragment>
                <Card
                    title = {
                            <DatePicker 
                                style={{ width: "50%", float: "right" }}
                                onChange = {this.onChange}/>
                    }>
                    <Spin tip="Loading..." spinning={this.state.loading}>
                        <div id={"container"}>
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={this.state.options}
                                ref={'chart'}
                            />
                        </div>
                    </Spin>
                </Card>
            </Fragment>
        );
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

export default connect(mapStateToProps,null)(IpUsageAverageDailyTrendChart);