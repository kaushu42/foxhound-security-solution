import React, {Component, Fragment} from "react";
import {PageHeader, Button, Descriptions, Card, Row, Col} from 'antd';
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
            </Fragment>
        )
    }
}

export default IpProfile;
