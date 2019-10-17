import React, {Component, Fragment} from 'react';
import { Layout, Menu, Icon,Input } from 'antd';
const { Header, Sider, Content } = Layout;

class AppSideBar extends Component{
    render(){
        return (
            <Fragment>
            <Sider width={200}>
                    <Menu mode="inline" style={{ height: '100%', borderRight: 0 }}>
                        <Menu.Item key="1"><Icon type="appstore" /> Dashboard</Menu.Item>
                        <Menu.Item key="2"><Icon type="cluster" /> IP Profile</Menu.Item>
                        <Menu.Item key="3"><Icon type="read" /> Trouble Tickets </Menu.Item>
                        <Menu.Item key="4"><Icon type="file" /> Logs </Menu.Item>
                    </Menu>
                </Sider>                
            </Fragment>
        )
    }
}

export default AppSideBar;