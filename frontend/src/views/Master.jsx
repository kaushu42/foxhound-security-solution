import React, {Component,} from 'react';
import {Layout,PageHeader} from 'antd';
const { Content, Footer } = Layout;
import Sidebar from "./layout/SideBar";
import NavBar from "./layout/NavBar";
import {connect} from "react-redux";
import {toggleSideBar} from "../actions/layoutAction";
import './master.css';
import FootBar from "./layout/FootBar";


const LayoutStyle = {
    margin: '24px 16px',
    background: '#fff',
}
class Master extends Component {
    render(){
        return (
            <Layout>
                <Sidebar />
                <Layout>
                    <NavBar />
                    <Content style={LayoutStyle}>
                        {this.props.children}
                    </Content>
                    <FootBar />
               </Layout>
            </Layout>
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

export default connect(mapStateToProps,mapDispatchToProps)(Master);