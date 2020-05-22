import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import MasterLayout from "./layout/MasterLayout";
import {Col, PageHeader, Row, Button} from "antd";
import {contentLayout} from "../utils";
import BlacklistAddress from "../components/BlacklistAddress";
import '../charts/chart.css';
import BlacklistedResponsesTable from '../components/tables/BlacklistedResponsesTable';

class BlacklistedResponses extends Component{

    constructor(props){
        super(props);
        this.state = {
            filterToggleText : "Show filter",
            filterDisplyStyle : "none",
            filterVisible : false
        }
    }
    toggleFilterDisplay = () => {
        if(this.state.filterVisible){
            this.setState({filterToggleText:"Show filter"});
            this.setState({filterVisible:false});
            this.setState({filterDisplyStyle:"none"});
        }
        else {
            this.setState({filterToggleText:"Hide filter"});
            this.setState({filterVisible:true});
            this.setState({filterDisplyStyle:""});
        }
    }

    render() {
        return (
            <Fragment>
                <MasterLayout activePageKey={this.props.activePageKey}>
                    <PageHeader
                        style={{background: '#fff'}}
                        title={"Blacklisted Response"}
                        onBack={() => window.history.back()} />
                    <Row style={contentLayout}>
                         <BlacklistedResponsesTable />
                    </Row>
                </MasterLayout>
            </Fragment>
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

export default connect(mapStateToProps,mapDispatchToProps)(BlacklistedResponses);