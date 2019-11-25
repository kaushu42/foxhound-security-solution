import React, {Component, Fragment} from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import {Card, Row, Spin} from "antd";
import {connect} from "react-redux";
import axios from "axios";
import {ROOT_URL} from "../utils";
require("highcharts/modules/exporting")(Highcharts);
import './chart.css';
const FETCH_API = `${ROOT_URL}dashboard/usage/`;
import moment from "moment";


class BandwidthUsageChart extends Component{

    constructor(props){
        super(props);
        this.state = {
            loading : true,
            data : [],
            unit : "",
            options : {
                title: {
                    text: 'Bandwidth Usage View | Bytes Received'
                },
                chart :{
                    zoomType : 'x',
                    events :{
                        click: function(e) {
                            console.log(
                                Highcharts.dateFormat('%Y-%m-%d %H:%M', e.xAxis[0].value),
                                e.yAxis[0].value
                            );
                        },
                    }
                },
                xAxis : {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        day: '%Y-%b-%d',
                    }
                },
                time: {
                    timezoneOffset: -6 * 60
                },
                series: [
                    {
                        type: 'spline',
                        name : 'Bytes Received',
                        data: []
                    }
                ],
                tooltip: {
                    valueDecimals: 2
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

        const {auth_token} = this.props;

        const authorization = `Token ${auth_token}`;

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authorization,
        };

        let bodyFormData = new FormData();
        bodyFormData.set('start_date', this.props.date_range[0]);
        bodyFormData.set('end_date', this.props.date_range[1]);
        bodyFormData.set('ip_address', this.props.ip_address);
        bodyFormData.set('firewall_rule', this.props.firewall_rule);
        bodyFormData.set('application', this.props.application);
        bodyFormData.set('protocol', this.props.protocol);
        bodyFormData.set('source_zone', this.props.source_zone);
        bodyFormData.set('destination_zone', this.props.destination_zone);


        axios.post(FETCH_API,bodyFormData,{headers}).
        then(res => {
            const response = res.data;
            console.log('api data',response);
            if(response["bytes_sent_max"]>1000000000){
                response["bytes_sent"] = response["bytes_sent"].map(e => [((e[0]*1000)),e[1]/(1024*1024*1024)])
                this.setState({
                    data : response,
                    unit: "GB"
                })
            }
            if(response["bytes_sent_max"]>1000000 && response["bytes_sent_max"]<1000000000){
                response["bytes_sent"] = response["bytes_sent"].map(e => [((e[0]*1000)),e[1]/(1024*1024)])
                this.setState({
                    data : response,
                    unit: "MB"
                })
            }
            if(response["bytes_sent_max"]>1000 && response["bytes_sent_max"]<1000000){
                response["bytes_sent"] = response["bytes_sent"].map(e => [((e[0]*1000)),e[1]/(1024)])
                this.setState({
                    data : response,
                    unit: "KB"
                })
            }
            else{
                this.setState({
                    data : response,
                    unit: "Bytes"
                })
            }
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
            (String(prevProps.date_range[0])!==String(this.props.date_range[0])) ||
            (String(prevProps.date_range[1])!==String(this.props.date_range[1])) ||
            (String(prevProps.firewall_rule)!==String(this.props.firewall_rule)) ||
            (String(prevProps.application)!==String(this.props.application)) ||
            (String(prevProps.protocol)!==String(this.props.protocol)) ||
            (String(prevProps.source_zone)!==String(this.props.source_zone)) ||
            (String(prevProps.destination_zone)!==String(this.props.destination_zone))
        ){
            this.handleFetchData();
        }
        if(prevState.data!==this.state.data){
            let dataSeries = this.state.data["bytes_sent"]
            // .map(e => [((e[0]*1000)),e[1]/1024/1024])
            console.log("Bandwidth chart dataseries", dataSeries)
            this.updateChart(dataSeries, this.state.unit);
        }
    }


    updateChart = (data, unit) => {
        if (data!=undefined){
            console.log('final data',data);
            this.chart.update({
                series: [
                    {
                        id: 'bytes',
                        type: 'spline',
                        name : 'Bytes Received' + '(' + unit + ')',
                        data: data
                    }
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
            });
            this.setState({
                loading : false
            });
        }
    }


    render() {
        return (
            <Fragment>
                <Card>
                    <Spin tip={"loading..."} spinning={this.state.loading}>
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={this.state.options}
                            ref={'chart'}
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

        ip_address : state.filter.ip_address,

        date_range : state.filter.date_range,
        firewall_rule : state.filter.firewall_rule,
        application : state.filter.application,
        protocol : state.filter.protocol,
        source_zone : state.filter.source_zone,
        destination_zone : state.filter.destination_zone
    }
}
export default connect(mapStateToProps,null)(BandwidthUsageChart);
