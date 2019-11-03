import React, {Component,Fragment} from 'react';
import {Card,Statistic} from "antd";
import {connect} from 'react-redux';
import axios from "axios";
import {ROOT_URL} from "../utils";
const gridStyle = {
    width: "25%",
    textAlign: "cente r"
};

const FETCH_API = `${ROOT_URL}dashboard/stats/`;

class DashboardStats extends Component {

    constructor(props){
        super(props);
        this.state = {
            uplink : 0,
            downlink : 0,
            new_tt : 0,
            new_rules : 0
        }
    }

    componentDidMount() {
        this.fetchDashboardStats();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (String(prevProps.date_range[1]) !== String(this.props.date_range[1])){
            this.fetchDashboardStats();
        }
        if (
            (String(prevProps.date_range[0]) !== String(this.props.date_range[0])) ||
            (String(prevProps.date_range[1]) !== String(this.props.date_range[1])) ||
            (String(prevProps.firewall_rule) !== String(this.props.firewall_rule)) ||
            (String(prevProps.application) !== String(this.props.application)) ||
            (String(prevProps.protocol) !== String(this.props.protocol)) ||
            (String(prevProps.source_zone) !== String(this.props.source_zone)) ||
            (String(prevProps.destination_zone) !== String(this.props.destination_zone))
        ){
            this.fetchDashboardStats();
        }
    }

    fetchDashboardStats = () => {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Token ${this.props.auth_token}`
        }
        var bodyFormData = new FormData();
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
                this.setState({
                    uplink :  parseInt((data.uplink /(1024*1024))),
                    downlink : parseInt(data.downlink /(1024*1024)),
                    new_tt : data.new_tt
                })
            })
            .catch((error) => console.log(error))
    }

    render() {
        const uplink = `${this.state.uplink} MB`;
        const downlink = `${this.state.downlink} MB`;

        return(
            <Fragment>
                <Card>
                    <Card.Grid style={gridStyle}>
                        <Statistic title="Uplink" value={uplink} />
                    </Card.Grid>
                    <Card.Grid style={gridStyle}>
                        <Statistic title="Downlink" value={downlink} />
                    </Card.Grid>
                    <Card.Grid style={gridStyle}>
                        <Statistic title="Opened TT" value={this.state.new_tt} />
                    </Card.Grid>
                    <Card.Grid style={gridStyle}>
                        <Statistic title="New Rules" value={this.state.new_rules} />
                    </Card.Grid>
                </Card>
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => {

    return {
        auth_token : state.auth.auth_token,
        date_range : state.filter.date_range,
        firewall_rule : state.filter.firewall_rule,
        application : state.filter.application,
        protocol : state.filter.protocol,
        source_zone : state.filter.source_zone,
        destination_zone : state.filter.destination_zone
    }
}
export default connect(mapStateToProps,null)(DashboardStats);

