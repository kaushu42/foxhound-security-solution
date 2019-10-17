import React, {Component, Fragment} from 'react';
import { Layout, Menu, Icon,Input } from 'antd';
import "./appHeader.css";
const { Header, Sider, Content } = Layout;
const { Search } = Input;
class AppHeader extends Component{
    render(){
        return (
            <Fragment>
                <Header className="app-header" style={{background:'whitesmoke'}}>
                    <Menu theme="light" mode="horizontal" style={{lineHeight:'62px', background:'whitesmoke'}}>
                        <Menu.Item key="1" style={{fontSize:'24px'}}>Foxhound Security Solutions</Menu.Item>
                        <Menu.Item key="2">
                            <Search size="default" placeholder="Search anything ..." onSearch={value => console.log(value)} style={{ width: 250 }} />
                        </Menu.Item>
                        <Menu.Item key="3">Notifications</Menu.Item>
                        <Menu.Item key="4">Account</Menu.Item>
                    </Menu>
                </Header>
            </Fragment>
        )
    }
}

export default AppHeader;