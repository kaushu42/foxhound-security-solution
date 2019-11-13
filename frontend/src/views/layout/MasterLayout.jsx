import React,{Component,} from 'react';
import {Layout} from 'antd';
const {Content} = Layout;
import {connect} from "react-redux";
import './master.css';
import SideBar from "./SideBar";
import NavBar from "./NavBar";
import FootBar from "./FootBar";
import {toggleSideBar} from "../../actions/layoutAction";


const LayoutStyle = {
    margin: '24px 16px',
    background: '#fff',
}
class MasterLayout extends Component {
    render(){
        return (
            <Layout className="Fade">
                <SideBar />
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

export default connect(mapStateToProps,mapDispatchToProps)(MasterLayout);