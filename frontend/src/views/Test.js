import React, {Component, Fragment} from 'react';
import IpUsageActivityChart from "../components/IpUsageActivityChart";
import IpUsageAsSourceSankeyChart from "../components/IpUsageAsSourceSankeyChart";
import IpUsageAsDestinationSankeyChart from "../components/IpUsageAsDestinationSankeyChart";
import IpUsageDayAverageLineChart from "../components/IpUsageDayAverageLineChart";
import ProcessedLogsTable from "../components/ProcessedLogsTable";

class Test extends  Component {
    render() {
        return (
            <Fragment>
                <IpUsageActivityChart />
            </Fragment>
        )
    }
}

export default Test;
