import React, {Component,Fragment} from 'react';
import {connect} from 'react-redux';
import {Card, Skeleton} from 'antd';
import {
    IpConnectionWiseUsageSankeyChartServiceAsync,
} from "../services/IpConnectionWiseUsageSankeyChartService";
import Shankey from "../charts/Shankey";


class IpConnectionWiseUsageShankeyChart extends Component {

    constructor(props){
        super(props);
        this.state = {
            loading : true,
            ip_as_source_data : [],
            ip_as_destination_data : []
        }
    }

    componentDidMount() {
        IpConnectionWiseUsageSankeyChartServiceAsync(this.props.search_address,this.props.auth_token)
            .then(res => {
                const data = res.data;
                this.setState({
                    ip_as_source_data:data.source_data,
                    ip_as_destination_data : data.destination_data,
                    loading:false
                });
            });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.search_address != this.props.search_address){
            this.setState({
                loading:true
            });
            IpConnectionWiseUsageSankeyChartServiceAsync(this.props.search_address,this.props.auth_token)
                .then(res => {
                    const data = res.data;
                    this.setState({
                        ip_as_source_data:data.source_data,
                        ip_as_destination_data : data.destination_data,
                        loading:false
                    });
                });
        }
    }


    render() {
        const {loading,ip_as_source_data,ip_as_destination_data} = this.state;
        return (
            <Fragment>
                <Card title="IP ACTIVITY AS SOURCE">
                    <Skeleton loading={loading}></Skeleton>
                    <div style={{height:'300px'}}>
                        {!loading?<Shankey data={ip_as_source_data} />:null}
                    </div>
                </Card>
                <Card title="IP ACTIVITY AS DESTINATION">
                    <Skeleton loading={loading}></Skeleton>
                    <div style={{height:'300px'}}>
                        {!loading?<Shankey data={ip_as_destination_data} />:null}
                    </div>
                </Card>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token

    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}


export default connect(mapStateToProps,mapDispatchToProps)(IpConnectionWiseUsageShankeyChart);
