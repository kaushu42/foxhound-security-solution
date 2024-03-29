import React, {Fragment, Component} from 'react';
import {Icon, Menu,Layout } from "antd";
import {connect} from "react-redux";
import {toggleSideBar} from "../../actions/layoutAction";
const { Sider } = Layout;

class SideBar extends Component {

    render() {
        const {sideBarCollapsed,activePageKey } = this.props;
        return(
            <Fragment>
                <Sider trigger={null} collapsible collapsed={sideBarCollapsed} collapsedWidth={0}  width={250}>
                    <img src="/assets/fox-white.png" alt="foxhound-logo" style={{height:64,width:64,marginLeft:50,marginTop:5}}/>
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={[activePageKey]}>

                        <Menu.ItemGroup key={"dashboard"} title="Dashboard">
                            <Menu.Item key="dashboard">
                                <a href={"/"}>
                                    <Icon type="dashboard" />
                                    <span>Home</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="kibanadashboard">
                                <a href={"/kibanadashboard"} target="_blank">
                                    <Icon type="dashboard" />
                                    <span>Kibana Dashboard</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="kibanalivedashboard">
                                <a href={"/kibanalivedashboard"} target="_blank">
                                    <Icon type="dashboard" />
                                    <span>Kibana Live Dashboard</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="threatdashboard">
                                <a href={"/threats"}>
                                    <Icon type="dashboard" />
                                    <span>Threat Dashboard</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="ip">
                                <a href={"/ip"} >
                                    <Icon type="link" />
                                    <span>IP Address Profile</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="changealias">
                                <a href={"/changealias"} >
                                    <Icon type="link" />
                                    <span>Change Alias Name</span>
                                </a>
                            </Menu.Item>
                        </Menu.ItemGroup>
                        <Menu.ItemGroup key={"Rules"} title="Rules">
                            <Menu.Item key="verified-rules">
                                <a href={"/rules/verified"}>
                                    <Icon type="snippets" />
                                    <span>Verified Rules</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="unverified-rules">
                                <a href={"/rules/unverified"}>
                                    <Icon type="snippets" />
                                    <span>Unverified Rules</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="anomalous-rules">
                                <a href={"/rules/anomalous"}>
                                    <Icon type="snippets" />
                                    <span>Anomalous Rules</span>
                                </a>
                            </Menu.Item>
                        </Menu.ItemGroup>
                        <Menu.ItemGroup key={"blacklisted"} title="Blacklisted">
                            <Menu.Item key="blacklisted-requests">
                                <a href={"/blacklistedrequests"}>
                                    <Icon type="snippets" />
                                    <span>Blacklisted requests</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="blacklisted-responses">
                                <a href={"/blacklistedresponses"}>
                                    <Icon type="snippets" />
                                    <span>Blacklisted responses</span>
                                </a>
                            </Menu.Item>
                        </Menu.ItemGroup>

                        <Menu.ItemGroup key={"Logs"} title="Logs">
                            <Menu.Item key="traffic-logs">
                                <a href={"/logs/traffic"}>
                                    <Icon type="snippets" />
                                    <span>Processed Traffic Logs</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="threat-logs">
                                <a href={"/logs/threat"}>
                                    <Icon type="snippets" />
                                    <span>Processed Threat Logs</span>
                                </a>
                            </Menu.Item>
                        </Menu.ItemGroup>
                        <Menu.ItemGroup key={"TroubleTickets"} title={"Trouble Tickets"}>
                            <Menu.Item key="my-tt">
                                <a href={"/tt/my"}>
                                    <Icon type="snippets" />
                                    <span>My TT</span>
                                </a>
                            </Menu.Item>
                                <Menu.Item key="active-tt">
                                <a href={"/tt/active"}>
                                    <Icon type="snippets" />
                                    <span>Active TT</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="closed-tt">
                                <a href={"/tt/closed"}>
                                    <Icon type="snippets" />
                                    <span>Closed TT</span>
                                </a>
                            </Menu.Item>
                        </Menu.ItemGroup>
                        <Menu.ItemGroup key={"Account"} title="Account">
                            <Menu.Item key="change-password">
                                <a href={"/auth/changepassword"}>
                                    <Icon type="snippets" />
                                    <span>Change Password</span>
                                </a>
                            </Menu.Item>
                        </Menu.ItemGroup>
                        <Menu.ItemGroup key={"Documentation"} title="Documentation">
                            <Menu.Item key="user-manual">
                                <a href={"/usermanual"}>
                                    <Icon type="snippets" />
                                    <span>User Manual</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="change-log">
                                <a href={"/changelog"}>
                                    <Icon type="snippets" />
                                    <span>Change Log</span>
                                </a>
                            </Menu.Item>
                        </Menu.ItemGroup>
                        {/* <Menu.ItemGroup key={"Core"} title={"Core"}>
                            <Menu.Item key="backgroundjob">
                                <a href={"/backgroundjob"} >
                                    <Icon type="link" />
                                    <span>Background Job Monitor</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="batch">
                                <a href={"/batch"} >
                                    <Icon type="link" />
                                    <span>Batch Monitor</span>
                                </a>
                            </Menu.Item>

                        </Menu.ItemGroup> */}
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