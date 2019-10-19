import React , {Component} from  "react";
import Filter from "../components/Filter";
import {connect} from 'react-redux';

class Dashboard extends Component{

    render(){
        return(
            <div>
                <h1>Dashboard Page {this.props.application}</h1>
                <Filter />
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        application : state.filter.application
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Dashboard);