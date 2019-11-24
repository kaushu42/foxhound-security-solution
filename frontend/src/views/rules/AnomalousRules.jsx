import React, {Component} from 'react';
import MasterLayout from "../layout/MasterLayout";
import {PageHeader, Row} from "antd";
import {contentLayout} from "../../utils";
import AnomalousRulesTable from "../../components/tables/AnomalousRulesTable";

class AnomalousRules extends Component {
    render(){
        return (
            <MasterLayout activePageKey={this.props.activePageKey}>
                <PageHeader
                    style={{background: '#fff'}}
                    title={"Anomalous Rules"} />
                <Row style={contentLayout}>
                    <AnomalousRulesTable />
                </Row>
            </MasterLayout>
        )
    }
}

export default AnomalousRules;