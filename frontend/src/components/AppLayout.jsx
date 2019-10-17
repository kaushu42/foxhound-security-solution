import React,{Component,Fragment} from 'react';
import { Layout, Menu, Icon } from 'antd';
import AppHeader from './AppHeader';
import AppSideBar from './AppSideBar';
import AppFooter from './AppFooter';
import AppContent from './AppContent';
import AppPageHeader from './AppPageHeader';
const { Header, Sider, Content } = Layout;

class AppLayout extends Component {
  state = {
    collapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    return (
      <Fragment>
      <Layout>
        <AppHeader/>
      </Layout>
      <Layout>
        <AppSideBar />
        <Layout style={{ padding: '0 24px 24px'}}>
          <AppPageHeader />
          <AppContent />
        </Layout>
      </Layout>
        <AppFooter />
      </Fragment>
    );
  }
}

export default AppLayout;