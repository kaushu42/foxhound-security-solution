import React, {Component} from 'react';
import MasterLayout from "../layout/MasterLayout";
import VerifiedRulesTable from "../../components/tables/VerifiedRulesTable";
import {PageHeader, Row} from "antd";
import {contentLayout} from "../../utils";
import {connect} from "react-redux";

class VerifiedRules extends Component {
    render() {
        return (
            <MasterLayout activePageKey={this.props.activePageKey}>
                <PageHeader
                    style={{background: '#fff'}}
                    title={"Verified Rules"} />
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