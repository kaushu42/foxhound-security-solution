import React, {Component,Fragment} from 'react';
import {toggleSideBar} from "../../actions/layoutAction";
import {Layout, Dropdown, Icon, Menu, PageHeader, Avatar} from "antd";
import {connect} from "react-redux";
const {Header} = Layout;

const accountDropdownMenu = (
    <Menu>
        <Menu.Item>
            <a rel="noopener noreferrer" href="/auth/logout">
                Logout
            </a>
        </Menu.Item>
    </Menu>
);


const notificationsDropdownMenu = (
    <Menu>
        <Menu.Item>
            There are no notifications now!
        </Menu.Item>
    </Menu>
)

class NavBar extends Component {

    render() {
        const { sideBarCollapsed } = this.props;
        return (
            <Fragment>
                <Header style={{ background: '#fff', paddingLeft: '20px'   }}>
                    <b>Foxhound Security Solution | {this.props.current_session_tenant_name}</b>
                    <Icon
                        style={{fontSize:20,float:"left",marginTop:20,paddingLeft:10,paddingRight:10, paddingTop:1}}
                        type={sideBarCollapsed ? 'menu-unfold' : 'menu-fold'}
                        onClick={()=>{this.props.dispatchToggleSideBar()}}
                    />
                    <span style={{float:'right'}}><b>{this.props.current_session_user_full_name}</b></span>
                    <Dropdown overlay={accountDropdownMenu} placement={"bottomCenter"}>
                        <a style={{fontSize:20, float:"right",paddingLeft:10,paddingRight:10}}>
                            <Icon type="user"style={{fontSize:20}}/>
                        </a>
                    </Dropdown>
                    <Dropdown overlay={notificationsDropdownMenu} placement={"bottomCenter"}>
                        <a style={{fontSize:20, float:"right",paddingLeft:10,paddingRight:10,paddingTop:1}}>
                            <Icon type="notification" style={{fontSize:20}} />
                        </a>
                    </Dropdown>
                </Header>
            </Fragment>
        )
    }

}

const mapStateToProps = state => {
    return {
        sideBarCollapsed: state.layout.sideBarCollapsed,
        auth_token : state.auth.auth_token,
        current_session_user_full_name : state.auth.current_session_user_full_name,
        current_session_tenant_name : state.auth.current_session_tenant_name
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchToggleSideBar : () => dispatch(toggleSideBar())
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(NavBar);