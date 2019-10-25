import React, {Component, Fragment} from "react";
import {PageHeader, Button, Descriptions, Card, Row, Col} from 'antd';
import IpSearchBar from "../components/IpSearchBar";
import {connect} from "react-redux";
import IpUsageActivityChart from "../components/IpUsageActivityChart";
const { Meta } = Card;

const routes = [
    {
        path: 'index',
        breadcrumbName: 'First-level Menu',
    },
    {
        path: 'first',
        breadcrumbName: 'Second-level Menu',
    },
    {
        path: 'second',
        breadcrumbName: 'Third-level Menu',
    },
];

class IpProfile extends Component{

    state = {
        loading: true,
    };



    render(){
        const { loading } = this.state;
        return(
            <Fragment>
                <PageHeader
                    ghost={false}
                    breadcrumb={{routes}}
                    onBack={() => window.history.back()}
                    title="IP Profile"
                    subTitle="usage of an ip address">
                </PageHeader>
                <Row>
                    <Col span={8}>
                        <IpSearchBar ip_address={this.props.ip_address}/>
                    </Col>
                </Row>
                <IpUsageActivityChart />
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
        return {
            ip_address : state.ipSearchBar.ip_address_value
        }
}
const mapDispatchToProps = dispatch => {
        return {

        }
}
export default connect(mapStateToProps,mapDispatchToProps)(IpProfile);
