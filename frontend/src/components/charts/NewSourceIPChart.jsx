import React, { Component, Fragment } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { Card, Row, Spin, List, Drawer, Table } from "antd";
import { connect } from "react-redux";
import axios from "axios";
import { ROOT_URL } from "../../utils";
import {search} from "../../actions/ipSearchAction"
import QuickIpView from "../../views/QuickIpView"
require("highcharts/modules/exporting")(Highcharts);
import "../chart.css";

const FETCH_SOURCE_IP = `${ROOT_URL}mis/source_ip/`;
const FETCH_SOURCE_IP_COUNT = `${ROOT_URL}mis/source_count/`;

class NewSourceIPChart extends Component{
    constructor(props){
        super(props);
        this.state = {
            ipListData: null,
            chartData:null,
            quickIpView: false,
        };
    }

    componentDidMount = () => {
        this.fetch()
    }

    fetch = () => {
        const token = `Token ${this.props.auth_token}`;
        let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token
        };
        axios.post(FETCH_SOURCE_IP, null, {headers})
        .then(
            res => {
                
                this.setState({
                ipListData: res.data
                })
            }
        )
        axios.post(FETCH_SOURCE_IP_COUNT, null, {headers})
        .then(
            res => {
                for(var i=0;i<res.data.length;i++){
                    res.data[i][0] = res.data[i][0] *1000+20700000
                }
                this.setState({
                chartData: res.data
                })
            }
        )
    }

    selectedIP = (id) =>{
        this.props.dispatchIpSearchValueUpdate(id.target.id);
        this.setState({quickIpView : true});
    }

    closeQuickIpView  = () => {
        this.setState({quickIpView: false})
    }

    render(){
        const options = {
            title: {
              text: "Daywise New Source IPs"
            },
            chart: {
              zoomType: "x",
            },
            xAxis: {
              type: "datetime",
              dateTimeLabelFormats: {
                day: "%e - %b - %Y"
              }
            },
            yAxis:{
                title:{text:"New Source IPs"}
            },
            // time:{
            //     timezoneOffset: -5*60 - 45
            // },
            series: [
              {
                type: "areaspline",
                name: "Number of New IPs",
                data: this.state.chartData
              }
            ],
        }

        return(
            <Fragment>
                <Card title={"Today's New Source IPs"}>
                    {this.state.ipListData ? (
                        <Fragment>
                            <List
                                style={{height:"300px", overflow:"scroll"}}
                                dataSource={this.state.ipListData}
                                renderItem={item => 
                                    <List.Item>
                                        <a id={item[1]} onClick={this.selectedIP}>{item[1]}</a> - <a id={item[0]} onClick={this.selectedIP}>{item[0]}</a>
                                    </List.Item>}
                            />
                        </Fragment>
                    ) : null}
                </Card>
                <hr></hr>
                <Drawer
                    closable={true}
                    width={800}
                    placement={"right"}
                    onClose={this.closeQuickIpView}
                    visible={this.state.quickIpView}>
                    <QuickIpView/>
                </Drawer>
                <Card>
                    <HighchartsReact
                        highcharts = {Highcharts}
                        options = {options}
                        ref = {"chart"}
                    />
                </Card>
            </Fragment>
        );
    }
};

const mapStateToProps = state => {
    return{
        auth_token: state.auth.auth_token,
    }
};

const mapDispatchToProps = dispatch => {
    return{
        dispatchIpSearchValueUpdate : value => dispatch(search(value))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewSourceIPChart);