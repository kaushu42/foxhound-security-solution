import React, {Component, Fragment} from 'react';
import HighchartsReact from "highcharts-react-official";
import { Card, Select, Spin} from "antd";
import {connect} from "react-redux";
import axios from "axios";
import {ROOT_URL} from "../../utils";
import Highcharts from "highcharts";
const { Option } = Select;


const FETCH_API = `${ROOT_URL}dashboard/top/application/`;

class ApplicationLineChart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            seconds: 0,
            loading : true,
            data : [],
            top_count: 5,
            basis : 'bytes_received'

        };
    }

    componentDidMount = () => {
        this.handleFetchData();
        this.chart = this.refs.chart.chart;
        if (document.addEventListener) {
            document.addEventListener('webkitfullscreenchange', this.exitHandler, false);
            document.addEventListener('mozfullscreenchange', this.exitHandler, false);
            document.addEventListener('fullscreenchange', this.exitHandler, false);
            document.addEventListener('MSFullscreenChange', this.exitHandler, false);
        }
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


    handleFetchData = () => {

        this.setState({
            loading : true
        });

        const token = `Token ${this.props.auth_token}`;
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Authorization" : token
        };

        let bodyFormData = new FormData();
        bodyFormData.set('topcount', this.state.top_count);
        bodyFormData.set('basis', this.state.basis);
        bodyFormData.set('start_date', this.props.date_range[0]);
        bodyFormData.set('end_date', this.props.date_range[1]);
        bodyFormData.set('firewall_rule', this.props.firewall_rule);
        bodyFormData.set('application', this.props.application);
        bodyFormData.set('protocol', this.props.protocol);
        bodyFormData.set('source_zone', this.props.source_zone);
        bodyFormData.set('destination_zone', this.props.destination_zone);

        axios.post(FETCH_API,null,{headers})
            .then(res => this.setState({data:res.data.data}));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(
            (String(prevState.top_count)!==String(this.state.top_count)) ||
            (String(prevState.basis)!==String(this.state.basis)) ||
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
            let dataSeries = [];
            Object.keys(this.state.data).forEach(key=>{
                let tempSeries = {
                    name : key,
                    type : 'spline',
                    data : this.state.data[key]
                }
                dataSeries.push(tempSeries)
            });
            this.updateChart(dataSeries);
        }
    }

    updateChart = (data) => {
        const seriesLength = this.chart.series.length;
        for(let i = seriesLength - 1; i > -1; i--)
        {
            this.chart.series[i].remove()
        }
        this.chart.redraw();
        for(let i = 0; i< data.length;i++){
            this.chart.addSeries({
                name: data[i].name,
                type: 'spline',
                data: data[i].data,
                showInNavigator: true
            });

        }
        this.chart.redraw();
        this.setState({
            loading : false
        });

    }

    render(){
        const options = {

            title: {
                text: 'Applications Used'
            },

            yAxis: {
                title: {
                    text: 'Bytes Received'
                }
            },
            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
            },
            xAxis : {
                type: 'datetime'
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'bottom',
                            verticalAlign: 'middle'
                        }
                    }
                }]
            }

        };
        return (
            <Fragment>
                <div>
                    <Card title={
                        <Fragment>
                            <div>
                                <Select
                                    onChange={(value) => this.setState({top_count:value})}
                                    size={'default'}
                                    style={{width:'50%',paddingRight:10,paddingLeft:10}}
                                    defaultValue={"5"}>
                                    <Option key="5">Top 5</Option>
                                    <Option key="10">Top 10</Option>
                                    <Option key="15">Top 15</Option>
                                </Select>
                                <Select
                                    onChange={(value) => this.setState({basis:value})}
                                    size={'default'}
                                    style={{width:'50%',paddingRight:10,paddingLeft:10}}
                                    defaultValue={'bytes_received'}>
                                    <Option key={'bytes_sent'}>Bytes Sent</Option>
                                    <Option key={'bytes_received'}>Bytes Received</Option>
                                    <Option key={'packets_sent'}>Packets Sent</Option>
                                    <Option key={'packets_received'}>Packets Received</Option>
                                    <Option key={'repeat_count'}>Repeat Count</Option>
                                </Select>
                            </div>
                        </Fragment>
                    }>
                        <Spin spinning = {this.state.loading}>
                            <HighchartsReact
                                highcharts={Highcharts}
                                allowChartUpdate={false}
                                ref = {'chart'}
                                options = {options}
                            />
                        </Spin>
                    </Card>
                </div>
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

export default connect(mapStateToProps,null)(ApplicationLineChart);