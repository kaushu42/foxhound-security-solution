import React , {Component} from  "react";
import Filter from "../components/Filter";
import {connect} from 'react-redux';
import DashboardStats from "../components/DashboardStats";

class Dashboard extends Component{

    render(){
        return(
            <div>
                <h1>Dashboard Page </h1>
                <Filter />
                <DashboardStats/>
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        date_range : state.filter.date_range,
        firewall_rule : state.filter.firewall_rule,
        application : state.filter.application,
        protocol : state.filter.protocol,
        source_zone : state.filter.source_zone,
        destination_zone : state.filter.destination_zone,

        auth_token : state.auth.auth_token
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Dashboard);