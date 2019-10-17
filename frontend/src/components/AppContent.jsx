import React, {Component, Fragment} from 'react';
import {Layout} from 'antd';
const {Content} = Layout;

class AppContent extends Component {
    render(){
        return(
            <Fragment>
                 <Content style={{ padding: '0 24px', minHeight: 280 }}>Content</Content>
            </Fragment>
        )
    }
}

export default AppContent;