import React, {Component,Fragment} from 'react';
import {connect} from 'react-redux';
import {Card, Skeleton} from 'antd';
import {
    IpActivityCalendarChartServiceAsync,
} from "../services/IpActivityCalendarChartService";
import Calendar from "../charts/Calendar";

class IpUsageActivityChart extends Component {

    constructor(props){
        super(props);
        this.state = {
            loading : true,
            bytes_received : [],
            bytes_sent : []
        }
    }

    componentDidMount() {
        IpActivityCalendarChartServiceAsync(this.props.search_address ,this.props.auth_token)
            .then(res => {
                const data = res.data;
                this.setState({
                    bytes_received:data.activity_bytes_received,
                    bytes_sent : data.activity_bytes_sent,
                    loading:false
                });
            });
    }

    render() {
        const {loading,bytes_sent,bytes_received} = this.state;
        console.log(bytes_received);
       return (
            <Fragment>
                <Card title="IP ACTIVITY CALENDAR ON BYTES RECEIVED">
                    <Skeleton loading={loading}></Skeleton>
                    <div style={{height:'300px'}}>
                        {!loading?<Calendar data={bytes_received} />:null}
                    </div>
                </Card>
                <Card title="IP ACTIVITY CALENDAR ON BYTES SENT">
                    <Skeleton loading={loading}></Skeleton>
                    <div style={{height:'300px'}}>
                        {!loading?<Calendar data={bytes_sent} />:null}
                    </div>
                </Card>
            </Fragment>
       )
    }
}

const mapStateToProps = state => {
    return {
        ip_search : state.ipSearch.ip_address,
        auth_token : state.auth.auth_token

    }
}

const mapDispatchToProps = dispatch => {
    return {
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(IpUsageActivityChart);
