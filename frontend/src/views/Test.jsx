import React, {Component, Fragment} from 'react';
import Worldmapchart from "../demo/worldmapchart";
import RequestOriginWorldChart from "../components/charts/RequestOriginWorldChart"
import AnomalyBasedTroubleTicketTable from "../components/tables/AnomalyBasedTroubleTicketTable"
import VerifiedRulesTable from "../components/tables/VerifiedRulesTable"
import IpAsSourceSankeyChart from "../components/charts/IpAsSourceSankeyChart";
import ChangeAlias from "./ChangeAlias"
import BlacklistAddress from "../components/BlacklistAddress"

class Test extends Component {
    render() {
        return (
            <Fragment>
                {/* <Worldmapchart /> */}
                {/* <RequestOriginWorldChart /> */}
                <AnomalyBasedTroubleTicketTable />
                {/* <VerifiedRulesTable /> */}
                {/* <IpAsSourceSankeyChart /> */}
                {/* <ChangeAlias /> */}
                {/* <BlacklistAddress /> */}
            </Fragment>
            )
    }

}

export default Test;