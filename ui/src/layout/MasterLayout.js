import React, {Fragment} from 'react';
import {
    Avatar,
    Brand,
    Button,
    ButtonVariant,
    Dropdown,
    DropdownToggle,
    DropdownItem,
    DropdownSeparator,
    KebabToggle,
    Nav,
    NavVariants,
    NavGroup,
    NavItem,
    Page,
    PageHeader,
    PageSection,
    PageSectionVariants,
    PageSidebar,
    SkipToContent,
    TextContent,
    Text,
    Toolbar,
    ToolbarGroup,
    ToolbarItem, NavList, NavExpandable, Breadcrumb, Gallery, BreadcrumbItem, GalleryItem, Card, CardBody,Grid, GridItem
} from '@patternfly/react-core';
import accessibleStyles from '@patternfly/react-styles/css/utilities/Accessibility/accessibility';
import spacingStyles from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { css } from '@patternfly/react-styles';
import { BellIcon, CogIcon } from '@patternfly/react-icons';
import FullScreen, {isFullScreen} from 'react-request-fullscreen';
import domtoimage from 'dom-to-image';
import { ScreenIcon } from '@patternfly/react-icons'
import SankeyChart from "../demo/SankeyChart";
import MapChart from "../demo/MapChart";
import {TransformComponent, TransformWrapper} from "react-zoom-pan-pinch";

class MasterLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFullScreen: false,
            isFull: false,
            isNavBarOpen : false,
            isDropdownOpen: false,
            isKebabDropdownOpen: false,
            activeGroup: 'grp-1',
            activeItem: 'grp-1_itm-1'
        };

        this.goFull = () => {
            this.setState({ isFull: true });
        }

        this.onDropdownToggle = isDropdownOpen => {
            this.setState({
                isDropdownOpen
            });
        };

        this.onDropdownSelect = event => {
            this.setState({
                isDropdownOpen: !this.state.isDropdownOpen
            });
        };

        this.onKebabDropdownToggle = isKebabDropdownOpen => {
            this.setState({
                isKebabDropdownOpen
            });
        };

        this.onKebabDropdownSelect = event => {
            this.setState({
                isKebabDropdownOpen: !this.state.isKebabDropdownOpen
            });
        };

        this.onNavSelect = result => {
            this.setState({
                activeItem: result.itemId,
                activeGroup: result.groupId
            });
        };
    }
    onFullScreenChange (isFullScreen) {
        this.setState({
            isFullScreen
        })
    }

    requestOrExitFullScreen () {
        this.fullScreenRef.fullScreen()
    }

    render() {
        const { isDropdownOpen, isKebabDropdownOpen, activeItem, activeGroup } = this.state;

        const PageNav = (
            <Nav onSelect={this.onNavSelect} aria-label="Nav" theme="dark">
                <NavList>
                    <NavExpandable title="System Panel" groupId="grp-1" isActive={activeGroup === 'grp-1'} isExpanded>
                        <NavItem groupId="grp-1" itemId="grp-1_itm-1" isActive={activeItem === 'grp-1_itm-1'}>
                            Overview
                        </NavItem>
                        <NavItem groupId="grp-1" itemId="grp-1_itm-2" isActive={activeItem === 'grp-1_itm-2'}>
                            Resource Usage
                        </NavItem>
                        <NavItem groupId="grp-1" itemId="grp-1_itm-3" isActive={activeItem === 'grp-1_itm-3'}>
                            Hypervisors
                        </NavItem>
                        <NavItem groupId="grp-1" itemId="grp-1_itm-4" isActive={activeItem === 'grp-1_itm-4'}>
                            Instances
                        </NavItem>
                        <NavItem groupId="grp-1" itemId="grp-1_itm-5" isActive={activeItem === 'grp-1_itm-5'}>
                            Volumes
                        </NavItem>
                        <NavItem groupId="grp-1" itemId="grp-1_itm-6" isActive={activeItem === 'grp-1_itm-6'}>
                            Network
                        </NavItem>
                    </NavExpandable>
                    <NavExpandable title="Policy" groupId="grp-2" isActive={activeGroup === 'grp-2'}>
                        <NavItem groupId="grp-2" itemId="grp-2_itm-1" isActive={activeItem === 'grp-2_itm-1'}>
                            Subnav Link 1
                        </NavItem>
                        <NavItem groupId="grp-2" itemId="grp-2_itm-2" isActive={activeItem === 'grp-2_itm-2'}>
                            Subnav Link 2
                        </NavItem>
                    </NavExpandable>
                    <NavExpandable title="Authentication" groupId="grp-3" isActive={activeGroup === 'grp-3'}>
                        <NavItem groupId="grp-3" itemId="grp-3_itm-1" isActive={activeItem === 'grp-3_itm-1'}>
                            Subnav Link 1
                        </NavItem>
                        <NavItem groupId="grp-3" itemId="grp-3_itm-2" isActive={activeItem === 'grp-3_itm-2'}>
                            Subnav Link 2
                        </NavItem>
                    </NavExpandable>
                </NavList>
            </Nav>
        );
        const kebabDropdownItems = [
            <DropdownItem>
                <BellIcon /> Notifications
            </DropdownItem>,
            <DropdownItem>
                <CogIcon /> Settings
            </DropdownItem>
        ];
        const userDropdownItems = [
            <DropdownItem component="button">Action</DropdownItem>,
            <DropdownSeparator />,
            <DropdownItem>Separated Link</DropdownItem>,
            <DropdownItem component="button">Separated Action</DropdownItem>
        ];
        const PageToolbar = (
            <Toolbar>
                <ToolbarGroup className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnLg)}>
                    <ToolbarItem>
                        <Button id="expanded-example-uid-01" aria-label="Notifications actions" variant={ButtonVariant.plain}>
                            <BellIcon />
                        </Button>
                    </ToolbarItem>
                    <ToolbarItem>
                        <Button id="expanded-example-uid-02" aria-label="Settings actions" variant={ButtonVariant.plain}>
                            <CogIcon />
                        </Button>
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarItem className={css(accessibleStyles.hiddenOnLg, spacingStyles.mr_0)}>
                        <Dropdown
                            isPlain
                            position="right"
                            onSelect={this.onKebabDropdownSelect}
                            toggle={<KebabToggle onToggle={this.onKebabDropdownToggle} />}
                            isOpen={isKebabDropdownOpen}
                            dropdownItems={kebabDropdownItems}
                        />
                    </ToolbarItem>
                    <ToolbarItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
                        <Dropdown
                            isPlain
                            position="right"
                            onSelect={this.onDropdownSelect}
                            isOpen={isDropdownOpen}
                            toggle={<DropdownToggle onToggle={this.onDropdownToggle}>Shangrilla Microsystems | Kyle Baker</DropdownToggle>}
                            dropdownItems={userDropdownItems}
                        />
                    </ToolbarItem>
                    <ToolbarItem>
                        <ScreenIcon position="right" onClick={this.requestOrExitFullScreen.bind(this)} />
                    </ToolbarItem>

                </ToolbarGroup>
            </Toolbar>
        );

        const Header = (
            <PageHeader
                logo={(<Fragment><Brand src="assets/fox-white.png" alt="Foxhound Logo" style={{height:'40px',paddingRight:5}}/>
                    <img src="assets/logo.png" style={{position:'right', height:'40px',paddingLeft:5}} /></Fragment>)}
                toolbar={PageToolbar}
                avatar={<Avatar src="assets/user.svg" alt="Avatar image" />}
                showNavToggle
            />
        );
        const Sidebar = <PageSidebar nav={PageNav} theme="dark"/>;
        const PageBreadcrumb = (
            <Breadcrumb>
                <BreadcrumbItem>Home</BreadcrumbItem>
                <BreadcrumbItem to="#">Dashboard</BreadcrumbItem>
                <BreadcrumbItem to="#" isActive>Overview Dashboard</BreadcrumbItem>
            </Breadcrumb>
        );
        const pageId = 'main-content-page-layout-expandable-nav';
        const PageSkipToContent = <SkipToContent href={`#${pageId}`}>Skip to Content</SkipToContent>;

        return (
            <React.Fragment>
                <Page
                    style={{height:'100vh'}}
                    header={Header}
                    sidebar={Sidebar}
                    isManagedSidebar={true}
                    skipToContent={PageSkipToContent}
                    // breadcrumb={PageBreadcrumb}
                    mainContainerId={pageId}
                    defaultManagedSidebarIsOpen = {false}
                >
                    <PageSection variant={PageSectionVariants.light}>
                        <TextContent>
                            <Text component="h1">Overview Dashboard</Text>
                        </TextContent>
                        <Nav theme="light">
                            <NavList variant={NavVariants.tertiary}>
                                <NavItem key={'0'} itemId={'0'} isActive={true}>
                                    Overview Dashboard
                                </NavItem>
                            </NavList>
                            <NavList variant={NavVariants.tertiary}>
                                <NavItem key={'1'} itemId={'1'} isActive={false}>
                                    Traffic Dashboard
                                </NavItem>
                            </NavList>
                            <NavList variant={NavVariants.tertiary}>
                                <NavItem key={'2'} itemId={'2'} isActive={false}>
                                    Threat Dashboard
                                </NavItem>
                            </NavList>
                            <NavList variant={NavVariants.tertiary}>
                                <NavItem key={'3'} itemId={'3'} isActive={false}>
                                    Flow Dashboard
                                </NavItem>
                            </NavList>
                            <NavList variant={NavVariants.tertiary}>
                                <NavItem key={'3'} itemId={'3'} isActive={false}>
                                    GeoIP Dashboard
                                </NavItem>
                            </NavList>
                            <NavList variant={NavVariants.tertiary}>
                                <NavItem key={'3'} itemId={'3'} isActive={false}>
                                    Rules Dashboard
                                </NavItem>
                            </NavList>
                            <NavList variant={NavVariants.tertiary}>
                                <NavItem key={'3'} itemId={'3'} isActive={false}>
                                    TT Dashboard
                                </NavItem>
                            </NavList>

                        </Nav>
                    </PageSection>
                    <PageSection variant={PageSectionVariants.default}>
                        <Grid gutter="md">
                            <GridItem span={7} style={{borderWidth: 1,borderStyle: 'dashed'}}>
                                <SankeyChart />
                            </GridItem>
                            <GridItem span={5} style={{borderWidth: 1,borderStyle: 'dashed'}}>
                                <MapChart />
                            </GridItem>

                        </Grid>
                    </PageSection>
                </Page>
            </React.Fragment>
        );
    }
}

export default MasterLayout;



{/*<FullScreen ref={ref => { this.fullScreenRef = ref }} onFullScreenChange={this.onFullScreenChange.bind(this)}>*/}
{/*    <div*/}
{/*        className='rq'*/}
{/*        onClick={this.requestOrExitFullScreen.bind(this)}*/}
{/*    >*/}
{/*    </div>*/}
{/*</FullScreen>*/}
