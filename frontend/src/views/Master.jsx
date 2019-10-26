import React, {Component, Fragment} from 'react';
import {Layout, Menu, Icon, Avatar, Dropdown, Divider, PageHeader} from 'antd';
const { Header, Sider, Content, Footer } = Layout;
import './master.css';

const routes = [
    {
        path: 'index',
        breadcrumbName: 'First-level Menu',
    },
    {
        path: 'first',
        breadcrumbName: 'Second-level Menu',
    },
    {
        path: 'second',
        breadcrumbName: 'Third-level Menu',
    },
];


const menu = (
<Menu>
    <Menu.Item>
        <a target="" rel="noopener noreferrer" href="/">
            Change Account Settings
        </a>
    </Menu.Item>
    <Menu.Item>
        <a target="" rel="noopener noreferrer" href="/">
            Manage Profile
        </a>
    </Menu.Item>
    <Menu.Item>
        <a target="" rel="noopener noreferrer" href="/">
            Logout
        </a>
    </Menu.Item>
</Menu>
);

class Master extends Component {

    state = {
        collapsed: true,
    };

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };


    render(){
        return (
            <Layout>
                <Sider trigger={null} collapsible collapsed={this.state.collapsed} collapsedWidth={0}>
                    <img src="assets/fox-white.png" style={{height:64,width:64,marginLeft:50,marginTop:5}}/>
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
                <Layout>
                    <Header style={{ background: '#fff', paddingLeft: '20px'   }}>
                        <Icon
                            style={{fontSize:30,float:"left",marginTop:15,paddingLeft:10,paddingRight:10, paddingTop:1}}
                            type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                            onClick={this.toggle}
                        />
                        <Dropdown overlay={menu} placement={"bottomCenter"}>
                            <a style={{fontSize:20, float:"right",paddingLeft:10,paddingRight:10}}>
                                <Icon type="user"style={{fontSize:30}}/>
                                Hello, Keshav !
                            </a>
                        </Dropdown>
                        <Dropdown overlay={menu} placement={"bottomCenter"}>
                            <a style={{fontSize:20, float:"right",paddingLeft:10,paddingRight:10,paddingTop:1}}>
                                <Icon type="notification" style={{fontSize:30}} />
                            </a>

                        </Dropdown>
                    </Header>
                    <Content
                        style={{
                            margin: '24px 16px',
                            paddingTop: 24,
                            background: '#fff',
                        }}
                    >
                        <PageHeader
                            style={{paddingBottom:-10}}
                            title={"Main Page"}
                            subTitle={"This is main page"}
                            onBack={() => window.history.back()} />

                    </Content>
                    <Footer style={{ height:64, textAlign: 'center' }}>Foxhound Security Solutions ©2018 Created by Ai Coders Nepal</Footer>
               </Layout>
            </Layout>
        )
    }

}

export default Master;