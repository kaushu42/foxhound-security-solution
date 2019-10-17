import React, { Component } from 'react';
import AppLayout from './components/AppLayout';
import AppHeader from './components/AppHeader';
import DashBoard from './pages/Dashboard';
import IPProfile from './pages/IPProfile'
import 'antd/dist/antd.css';
import Logs from './pages/Logs';
import Rules from './pages/Dashboard/components/Rules';
import AcceptRuleDrawer from './pages/Dashboard/components/AcceptRuleDrawer';
import EditRuleDrawer from './pages/Dashboard/components/EditRuleDrawer';
import RejectRuleCreateTTDrawer from './pages/Dashboard/components/RejectRuleCreateTTDrawer';

class App extends Component {
  render() {
    const rule = {
      sourceaddress: '10.10.10.10',
      destinationaddress :'20.20.20.20',
      application: 'mysql-db'
    }
    const currentSession = {
      userid : 'keshavchaurasia',
      username: 'keshav chaurasia'
    } 
    return (
      <div>
        <DashBoard />
      </div>
    );
  }
}

export default App;
