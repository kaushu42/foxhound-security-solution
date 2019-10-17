import React, {Component, Fragment} from 'react';
import {PageHeader} from 'antd';

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

class AppPageHeader extends Component{
    render(){
        return(
            <Fragment>
                <PageHeader title="Title" breadcrumb={{ routes }} subTitle="This is a subtitle" />
            </Fragment>
        )
    }
}

export default AppPageHeader;