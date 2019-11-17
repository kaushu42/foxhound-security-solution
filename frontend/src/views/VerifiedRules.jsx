import React, {Component} from 'react';
import MasterLayout from "./layout/MasterLayout";
import VerifiedRulesTable from "../components/tables/VerifiedRulesTable";
import {PageHeader, Row} from "antd";
import {contentLayout} from "../utils";
import DashboardFilter from "../components/DashboardFilter";
import {connect} from "react-redux";

class VerifiedRules extends Component {
    render() {
        return (
            <MasterLayout>
                <PageHeader
                    style={{background: '#fff'}}
                    title={"Verified Rules"}
                    onBack={() => window.history.back()} />
                <Row style={contentLayout}>
                    <VerifiedRulesTable />
                </Row>
            </MasterLayout>
            )
    }
}

const mapStateToProps = state => {
    return {

    }
}
const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps,mapDispatchToProps)(VerifiedRules)