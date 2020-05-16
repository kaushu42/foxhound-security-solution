import React,{Component,} from 'react';
import {Layout} from 'antd';
const {Content} = Layout;
import {connect} from "react-redux";
import './master.css';
import SideBar from "./SideBar";
import NavBar from "./NavBar";
import FootBar from "./FootBar";
import {toggleSideBar} from "../../actions/layoutAction";
import axios from 'axios';
import {axiosHeader, ROOT_URL} from "../../utils";
import {Redirect} from "react-router-dom";


const LayoutStyle = {
    margin: '24px 16px',
    background: '#fff',
}


const AUTH_CHECKER = `${ROOT_URL}session/is_valid/`;
class MasterLayout extends Component {


    componentDidMount() {
        this.checkAuthChecker();
    }

    checkAuthChecker = () => {
        let headers = axiosHeader(this.props.auth_token);
        axios.post(AUTH_CHECKER,null,{headers})
            .then(res => {
            })
            .catch(error => {
                window.location.href="/auth/logout";
            })
    }


    render(){
        return (
            <Layout className="Fade">
                <SideBar activePageKey={this.props.activePageKey}/>
                <Layout>
                    <NavBar />
                    <Content style={LayoutStyle}>
                        {this.props.children}
                    </Content>
                    <FootBar />
                </Layout>
            </Layout>
        )
    }

}

const mapStateToProps = state => {
    return {
        sideBarCollapsed: state.layout.sideBarCollapsed,
        auth_token : state.auth.auth_token
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchToggleSideBar : () => dispatch(toggleSideBar())
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(MasterLayout);