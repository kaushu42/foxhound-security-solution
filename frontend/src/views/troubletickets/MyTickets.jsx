import React, {Component, Fragment} from 'react';
import MasterLayout from "../layout/MasterLayout";
import {PageHeader, Row} from "antd";
import {contentLayout} from "../../utils";
import MyTroubleTickets from "../../components/tables/MyTroubleTickets"
class MyTickets extends Component {
    render(){
        return (
            <MasterLayout activePageKey={this.props.activePageKey}>
                <PageHeader
                    style={{background: '#fff'}}
                    title={"My Trouble Tickets"} />
                <Row style={contentLayout}>
                    <MyTroubleTickets />
                </Row>
            </MasterLayout>
        )
    }
}
export default MyTickets