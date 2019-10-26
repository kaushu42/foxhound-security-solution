import React, {Component,Fragment} from 'react';
import {connect} from 'react-redux';
import {Card, Col, Row, Skeleton} from 'antd';
import {
    IpActivityCalendarChartServiceAsync,
} from "../services/IpActivityCalendarChartService";
import Calendar from "../charts/Calendar";

class IpUsageActivityChart extends Component {

    constructor(props){
        super(props);
        this.state = {
            loadingBytesSentChart : true,
            loadingBytesReceivedChart : true,
            bytes_received : [],
            bytes_sent : []
        }
    }

    componentDidMount() {
        IpActivityCalendarChartServiceAsync(this.props.ip_address ,this.props.auth_token)
            .then(res => {
                const data = res.data;
                this.setState({
                    bytes_received:data.activity_bytes_received,
                    bytes_sent : data.activity_bytes_sent,
                });
                if(this.state.bytes_sent.length != 0){
                    this.setState({loadingBytesSentChart:false})
                }
                if(this.state.bytes_received.length != 0){
                    this.setState({loadingBytesReceivedChart:false})
                }
            });
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.ip_address != this.props.ip_address) {
            this.setState({loadingBytesSentChart:true,loadingBytesReceivedChart:true});
            IpActivityCalendarChartServiceAsync(this.props.ip_address ,this.props.auth_token)
                .then(res => {
                    const data = res.data;
                    this.setState({
                        bytes_received:data.activity_bytes_received,
                        bytes_sent : data.activity_bytes_sent,
                    });
                    if(this.state.bytes_sent.length != 0){
                        this.setState({loadingBytesSentChart:false})
                    }
                    if(this.state.bytes_received.length != 0){
                        this.setState({loadingBytesReceivedChart:false})
                    }
                });
        }
    }

    render() {
        const {loadingBytesSentChart,loadingBytesReceivedChart,bytes_sent,bytes_received} = this.state;
       return (
            <Fragment>
                <Row>
                    <Col span={12}>
                        <Card title="IP ACTIVITY CALENDAR ON BYTES RECEIVED">
                            <Skeleton loading={loadingBytesReceivedChart}></Skeleton>
                            <div style={{height:'250px'}}>
                                {!loadingBytesReceivedChart?<Calendar data={bytes_received} />:null}
                            </div>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="IP ACTIVITY CALENDAR ON BYTES SENT">
                            <Skeleton loading={loadingBytesSentChart}></Skeleton>
                            <div style={{height:'250px'}}>
                                {!loadingBytesSentChart?<Calendar data={bytes_sent} />:null}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Fragment>
       )
    }
}

const mapStateToProps = state => {
    return {
        ip_address : state.ipSearchBar.ip_address_value,
        auth_token : state.auth.auth_token

    }
}

const mapDispatchToProps = dispatch => {
    return {
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(IpUsageActivityChart);
