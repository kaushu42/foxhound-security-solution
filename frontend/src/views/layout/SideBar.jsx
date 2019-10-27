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
                        <Menu.Item key="1">
                            <Icon type="user" />
                            <span>Dashboard</span>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Icon type="video-camera" />
                            <span>IP Profile</span>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Icon type="upload" />
                            <span>Processed Logs</span>
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