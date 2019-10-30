import React, {Component} from "react";
import Highcharts from "highcharts";
import Chart from "./Chart";
import {ROOT_URL} from "../utils";
require('highcharts/modules/sankey')(Highcharts);
require("highcharts/modules/exporting")(Highcharts);
import axios from 'axios';
import {connect} from "react-redux";

const chartOptions = {

    chart : {
        margin : 50,

    },
    title: {
        text: "IP ADDRESS AS SOURCE"
    },
    series: [
        {
            keys: ['from', 'to', 'weight'],
            data: [
                ['192.168.10.10', '192.168.10.100', 94],
                ['192.168.10.10', '192.168.10.110', 194],
                ['192.168.10.10', '192.168.10.120', 294],
                ['192.168.10.10', '192.168.10.130', 394]
            ],
            type: "sankey"
        }
    ]
};


const FETCH_API = `http://192.168.1.107:8000/api/v1/profile/sankey/`

class SankeyChart extends Component {


    componentDidMount = () => {
        this.handleFetchdata();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            (String(prevProps.ip_address) !== String(this.props.ip_address)) ||
            (String(prevProps.date_range[0]) !== String(this.props.date_range[0])) ||
            (String(prevProps.date_range[1]) !== String(this.props.date_range[1])) ||
            (String(prevProps.firewall_rule) !== String(this.props.firewall_rule)) ||
            (String(prevProps.application) !== String(this.props.application)) ||
            (String(prevProps.protocol) !== String(this.props.protocol)) ||
            (String(prevProps.source_zone) !== String(this.props.source_zone)) ||
            (String(prevProps.destination_zone) !== String(this.props.destination_zone))
        ){
            this.handleFetchdata();
        }
    }


    handleFetchdata = () => {

        const authorization = `Token ${this.props.auth_token}`;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': authorization
        }

        var bodyFormData = new FormData();
        bodyFormData.set('ip', this.props.ip_address);
        bodyFormData.set('start_date', this.props.date_range[0]);
        bodyFormData.set('end_date', this.props.date_range[1]);
        bodyFormData.set('firewall_rule', this.props.firewall_rule);
        bodyFormData.set('application', this.props.application);
        bodyFormData.set('protocol', this.props.protocol);
        bodyFormData.set('source_zone', this.props.source_zone);
        bodyFormData.set('destination_zone', this.props.destination_zone);

        axios.post(FETCH_API,bodyFormData,{
            headers: headers
        })
            .then((response) => {
                const data = response.data;
                console.log(data);
            })
            .catch((error) => console.log(error))
    }

    render() {
        return (
            <Chart options={chartOptions} highcharts={Highcharts} />
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

const mapDispatchToProps = dispatch => {
    return {

    }
}
export default connect(mapStateToProps,mapDispatchToProps)(SankeyChart);