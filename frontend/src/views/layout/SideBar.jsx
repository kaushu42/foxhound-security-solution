import React, {Fragment, Component} from 'react';
import {Icon, Menu,Layout } from "antd";
import {connect} from "react-redux";
import {toggleSideBar} from "../../actions/layoutAction";
const { Sider } = Layout;

class SideBar extends Component {

    render() {
        const {sideBarCollapsed } = this.props;
        return(
            <Fragment>
                <Sider trigger={null} collapsible collapsed={sideBarCollapsed} collapsedWidth={0}>
                    <img src="assets/fox-white.png" alt="foxhound-logo" style={{height:64,width:64,marginLeft:50,marginTop:5}}/>
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                        <Menu.Item key="dashboard">
                            <a href={"/"}>
                                <Icon type="dashboard" />
                                <span>Dashboard</span>
                            </a>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <a href={"/ip"}>
                                <Icon type="link" />
                                <span>IP Address Profile</span>
                            </a>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <a href={"/logs"}>
                                <Icon type="snippets" />
                                <span>Processed Logs</span>
                            </a>
                        </Menu.Item>
                        <Menu.Item key="4">
                            <a href={"/rules/verified"}>
                                <Icon type="snippets" />
                                <span>Verified Rules</span>
                            </a>
                        </Menu.Item>
                        <Menu.Item key="5">
                            <a href={"/auth/changepassword"}>
                                <Icon type="snippets" />
                                <span>Change Password</span>
                            </a>
                        </Menu.Item>

                    </Menu>
                </Sider>
            </Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        sideBarCollapsed: state.layout.sideBarCollapsed
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchToggleSideBar : () => dispatch(toggleSideBar())
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(SideBar);