import React, {Component, Fragment} from "react";
import {ipUsageAverageTrendDataService} from "../../services/ipUsageAverageTrendService";
import {connect} from "react-redux";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
NoDataToDisplay(Highcharts);
import '../../charts/chart.css';
import {Card, Spin, DatePicker, Select} from "antd";
import {getDivisionFactorUnitsFromBasis} from '../../utils'
import axios from "axios";
import {ROOT_URL} from  "../../utils"


class IpUsageAverageDailyTrendChart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            average_daily_data : [],
            recent_data : [],
            unit : "",
            basis: "bytes",
            date:"",
            options: {
                chart: {
                    zoomType: 'x'
                },
                xAxis: {
                    crosshair:true,
                    title:{
                        text: "time"
                    }
                },
                yAxis:{
                    crosshair:true,
                    labels :{
                        formatter: function () {
                            return this.value + ' MB';
                        }
                    }
                },
                title: {
                    text: null
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

    handleFetchData = () => {
        this.setState({
            loading : true
        });
        const {auth_token, ip_address} = this.props;
        const authorization = `Token ${auth_token}`;
        const FETCH_API = `${ROOT_URL}profile/average-daily/`;
        let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authorization
        };

        let bodyFormData = new FormData();
        bodyFormData.set("ip", ip_address);
        bodyFormData.set("basis", this.state.basis);
        bodyFormData.set("date", this.state.date);
        console.log("date", this.state.date)

        axios.post(FETCH_API, bodyFormData, { headers }).then(res => {
            const response = res.data;
            const average_daily_data = response.average;
            const recent_data = response.daily;
            if(response.max != 0){
                for(var i=0;i<24;i++){
                    if(average_daily_data[i] == undefined){
                        average_daily_data[i] = 0
                    }
                    if(recent_data[i] == undefined){
                        recent_data[i] = 0
                    }
                }
            }
            const max = response.max;
            var recent_data_arr = []
            var average_daily_data_arr = []
            for (var key in average_daily_data) {
                average_daily_data_arr.push(average_daily_data[key]);
            }
            for (var key in recent_data) {
                recent_data_arr.push(recent_data[key]);
            }
            console.log("api data", recent_data_arr);
            const averageData = [];
            const dailyData = [];
            const v = getDivisionFactorUnitsFromBasis(max, this.state.basis)
            const division_factor = v["division_factor"];
            const unit = v["unit"];
            for (var i = 0; i<average_daily_data_arr.length; i++){
                averageData.push((average_daily_data_arr[i])/division_factor)
            }
            for (var i = 0; i<recent_data_arr.length; i++){
                dailyData.push((recent_data_arr[i])/division_factor)
            }
            this.setState({
                average_daily_data: averageData,
                recent_data:dailyData,
                unit: unit
            })
          });
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
            (String(prevProps.ip_address)!==String(this.props.ip_address)) ||
            (String(prevState.basis)!==String(this.state.basis)) || 
            (String(prevState.date)!==String(this.state.date))
        ){
            this.handleFetchData();
        }
        if(prevState.average_daily_data!==this.state.average_daily_data){
            let averageDataSeries = this.state.average_daily_data
            let recentDataSeries = this.state.recent_data
            this.updateChart(averageDataSeries, recentDataSeries, this.state.unit);
        }
    }
    updateChart = (average_daily_data, recent_data, unit) => {
        let bytes = this.state.average_daily_data
        if (bytes.length == 0){
            Highcharts.setOptions({
                lang: {
                    noData: 'No data is available in the chart'
                }
            });
            this.chart.update({
                series : []
            })
        }
        this.chart.update({
            title : {
              text : null
            },
            series: [
                {
                    name : 'Daily ' + this.state.basis,
                    type : 'spline',
                    data : recent_data
                },
                {
                    name : 'Average ' + this.state.basis,
                    type : 'spline',
                    data : average_daily_data
                },
            ],
            yAxis:{
                title:{
                    text: this.state.basis
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
        this.setState({
            date: dateString
        })

        this.handleFetchData()
    }

    render() {
        console.log("loading",this.state.loading);
        return (
            <Fragment>
                <Card
                    title = {
                            <Fragment>
                                <div>
                                {`Average Daily Trend`}
                                <DatePicker 
                                    style={{ width: "35%", float:"right", paddingRight: 5, paddingLeft: 5 }}
                                    onChange = {this.onChange}/>
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