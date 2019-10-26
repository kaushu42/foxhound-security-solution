import React, {Component, Fragment} from "react";
import {PageHeader, Statistic,Button, Descriptions, Card, Row, Col, Layout} from 'antd';
import IpSearchBar from "../components/IpSearchBar";
import {connect} from "react-redux";
import IpUsageActivityChart from "../components/IpUsageActivityChart";
import IpConnectionWiseUsageShankeyChart from "../components/IpConnectionWiseUsageShankeyChart";
import {LayoutStyle} from "../utils";
import Filter from "../components/Filter";
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
                    breadcrumb={{routes}}
                    onBack={() => window.history.back()}
                    title="IP Profile"
                    subTitle="IP address profile in depth">

                    <Row type="flex">
                        <Statistic
                            title="Static IP Address"
                            value="192.168.10.10"
                            style={{
                                margin: '0 20px',
                            }}

                        />
                        <Statistic
                            title="Alias Name"
                            value="core-db-server"
                            style={{
                                margin: '0 20px',
                            }}
                        />
                        <Statistic
                            title="Total Uplink"
                            suffix="MB"
                            value={1234}
                            style={{
                                margin: '0 20px',
                            }}
                        />
                        <Statistic
                            title="Total Downlink"
                            value={456}
                            suffix="MB"
                            style={{
                                margin: '0 20px',
                            }}
                        />
                        <IpSearchBar ip_address={this.props.ip_address}/>

                    </Row>
                </PageHeader>
                <Layout style={LayoutStyle}>
                <Filter />
                </Layout>
                <Row>
                    <Col span={8}>
                    </Col>
                </Row>
                <IpUsageActivityChart />
                <IpConnectionWiseUsageShankeyChart />
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
export default connect(mapStateToProps,mapDispatchToProps)(IpProfile);
