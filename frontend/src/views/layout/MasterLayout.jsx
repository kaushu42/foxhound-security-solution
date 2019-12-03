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
        let auth_header = axiosHeader(this.props.auth_token);
        axios(AUTH_CHECKER,null,{auth_header})
            .then(res => console.log(res))
            .catch(error => {
                console.log('token invalid');
                console.log(error);
                this.props.history.push("/auth/login");
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