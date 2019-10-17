import React, {Component, Fragment} from 'react';
import {Layout} from 'antd';
const {Footer} = Layout;

class AppFooter extends Component {
    render(){
        return(
            <Fragment>
                 <Footer style={{ position:'absolute',bottom:'0px',width:'100%', textAlign: 'center' }}> Foxhound ©2019 Created by Corsac Tech</Footer>
            </Fragment>
        )
    }
}

export default AppFooter;