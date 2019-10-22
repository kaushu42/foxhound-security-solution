import React, {Component, Fragment} from "react";
import {PageHeader, Button, Descriptions, Card, Row, Col} from 'antd';
import { Skeleton, Switch, Icon, Avatar } from 'antd';
import IpUsageChart from "../components/IpUsageActivityChart";
import IpUsageAsSourceSankeyChart from "../components/IpUsageAsSourceSankeyChart";
import IpUsageAsDestinationSankeyChart from "../components/IpUsageAsDestinationSankeyChart";
import IpUsageDayAverageLineChart from "../components/IpUsageDayAverageLineChart";
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
                <IpUsageChart />
                <IpUsageAsSourceSankeyChart />
                <IpUsageAsDestinationSankeyChart />
                <IpUsageDayAverageLineChart />
            </Fragment>
        )
    }
}

export default IpProfile;
