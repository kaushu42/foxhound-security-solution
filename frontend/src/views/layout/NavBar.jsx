import React, {Component,Fragment} from 'react';
import {toggleSideBar} from "../../actions/layoutAction";
import {Layout, Dropdown, Icon, Menu} from "antd";
import {connect} from "react-redux";
const {Header} = Layout;

const accountDropdownMenu = (
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

const notificationsDropdownMenu = (
    <Menu>
        <Menu.Item>
            There are no notifications now!
        </Menu.Item>
    </Menu>
)

class NavBar extends Component {
    render() {
        const { sideBarCollapsed } = this.props;
        return (
            <Fragment>
                <Header style={{ background: '#fff', paddingLeft: '20px'   }}>
                    <Icon
                        style={{fontSize:30,float:"left",marginTop:15,paddingLeft:10,paddingRight:10, paddingTop:1}}
                        type={sideBarCollapsed ? 'menu-unfold' : 'menu-fold'}
                        onClick={()=>{this.props.dispatchToggleSideBar()}}
                    />
                    <Dropdown overlay={accountDropdownMenu} placement={"bottomCenter"}>
                        <a style={{fontSize:20, float:"right",paddingLeft:10,paddingRight:10}}>
                            <Icon type="user"style={{fontSize:30}}/>
                            Hello, Keshav !
                        </a>
                    </Dropdown>
                    <Dropdown overlay={notificationsDropdownMenu} placement={"bottomCenter"}>
                        <a style={{fontSize:20, float:"right",paddingLeft:10,paddingRight:10,paddingTop:1}}>
                            <Icon type="notification" style={{fontSize:30}} />
                        </a>

                    </Dropdown>
                </Header>
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

export default connect(mapStateToProps,mapDispatchToProps)(NavBar);