import React, {Component, Fragment} from 'react';
import MasterLayout from "../layout/MasterLayout";
import {PageHeader, Row} from "antd";
import {contentLayout} from "../../utils";
import UnverifiedRulesTable from "../../components/tables/UnverifiedRulesTable";

class UnverifiedRules extends Component {
    render(){
        return (
            <MasterLayout activePageKey={this.props.activePageKey}>
                <PageHeader
                    style={{background: '#fff'}}
                    title={"Unverified Rules"} />
                <Row style={contentLayout}>
                    <UnverifiedRulesTable />
                </Row>
            </MasterLayout>
        )
    }
}

export default UnverifiedRules;