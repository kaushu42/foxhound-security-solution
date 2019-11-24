import React, {Component, Fragment} from 'react';
import MasterLayout from "../layout/MasterLayout";
import {PageHeader, Row} from "antd";
import {contentLayout} from "../../utils";
class ActiveTickets extends Component {
    render(){
        return (
            <MasterLayout activePageKey={this.props.activePageKey}>
                <PageHeader
                    style={{background: '#fff'}}
                    title={"Active Trouble Tickets"} />
                <Row style={contentLayout}>

                </Row>
            </MasterLayout>
        )
    }
}
export default ActiveTickets