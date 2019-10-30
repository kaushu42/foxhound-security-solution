import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {sessionLogOut} from "../../actions/authAction";

class Logout extends Component {

    constructor(props){
        super(props);
        this.props.dispatchSessionLogOut();

        console.log("auth logout");

        this.props.history.push("/auth/login");

    }

    render(){
        return (
            <Fragment></Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token
    }
}
const mapDispatchToProps = dispatch => {
    return {
        dispatchSessionLogOut : () => dispatch(sessionLogOut())
    }
}

export  default connect(mapStateToProps,mapDispatchToProps)(Logout)