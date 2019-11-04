import React, {Component,Fragment} from 'react';
import {Card, Row, Statistic} from "antd";
import {connect} from 'react-redux';
import axios from "axios";
import {ROOT_URL} from "../utils";


const FETCH_API = `${ROOT_URL}profile/stats/`;

class IpProfileStats extends Component {

    constructor(props){
        super(props);
        this.state = {
            data : []
        }
    }

    componentDidMount() {
        this.handleFetchData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            (String(prevProps.date_range[0]) !== String(this.props.date_range[0])) ||
            (String(prevProps.date_range[1]) !== String(this.props.date_range[1])) ||
            (String(prevProps.firewall_rule) !== String(this.props.firewall_rule)) ||
            (String(prevProps.application) !== String(this.props.application)) ||
            (String(prevProps.protocol) !== String(this.props.protocol)) ||
            (String(prevProps.source_zone) !== String(this.props.source_zone)) ||
            (String(prevProps.destination_zone) !== String(this.props.destination_zone))
        ){
            this.handleFetchData();
        }
    }

    handleFetchData = () => {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Token ${this.props.auth_token}`
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
                this.setState({
                    data : data
                })
            })
            .catch((error) => console.log(error))
    }

    render() {
         const { uplink,downlink,ip_address,alias_name} = this.state.data;
        return(
            <Fragment>
                <Row type="flex" style={{paddingTop:24}}>
                    <Statistic
                        title="Static IP Address"
                        value={ip_address}
                        style={{
                            margin: '0 20px',
                        }}

                    />
                    <Statistic
                        title="Alias Name"
                        value={alias_name}
                        style={{
                            margin: '0 20px',
                        }}
                    />
                    <Statistic
                        title="Total Uplink"
                        suffix="MB"
                        value={(uplink/1024/1024).toFixed(2)}
                        style={{
                            margin: '0 20px',
                        }}
                    />
                    <Statistic
                        title="Total Downlink"
                        value={(downlink/1024/1024).toFixed(2)}
                        suffix="MB"
                        style={{
                            margin: '0 20px',
                        }}
                    />
                </Row>
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => {

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
export default connect(mapStateToProps,null)(IpProfileStats);

