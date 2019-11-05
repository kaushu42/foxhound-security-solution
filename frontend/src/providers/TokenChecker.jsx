import React, {Component} from 'react';
import {connect} from "react-redux";

class TokenChecker extends Component {
    constructor(props){
        super(props);

    }


    render(){
        return {...this.props.children}
    }
}


const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps,mapDispatchToProps)(TokenChecker);