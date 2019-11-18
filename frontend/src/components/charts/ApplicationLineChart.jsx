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
        };
    }

    componentDidMount = () => {
        this.handleFetchData();
        this.chart = this.refs.chart.chart;
    }

    handleFetchData = () => {
        const token = `Token ${this.props.auth_token}`;
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Authorization" : token
        };

        axios.post(FETCH_API,null,{headers})
            .then(res => this.setState({data:res.data.data}));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
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

        console.log(this.chart);
        for(var i = 0; i< data.length;i++){
            this.chart.addSeries({
                name: data[i].name,
                type: 'spline',
                data: data[i].data,
                showInNavigator: true
            });

        }
        this.chart.redraw();
        // this.chart.update({
        //     xAxis:{
        //         type : 'datetime'
        //     },
        //     series : data
        // });
        // this.chart.redraw();
    }

    render(){
        const options = {

            title: {
                text: 'Date vs Application '
            },

            yAxis: {
                title: {
                    text: 'Bytes Received'
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
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
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        };
        return (
            <Fragment>
                <Card>
                    {this.state.data ?
                        <HighchartsReact
                            highcharts={Highcharts}
                            allowChartUpdate={false}
                            ref = {'chart'}
                            options = {options}
                        />
                        :null
                    }
                </Card>
            </Fragment>
        )
    }
}


const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,
    }
}

export default connect(mapStateToProps,null)(ApplicationLineChart);
