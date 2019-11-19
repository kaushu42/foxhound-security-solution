import React, {Component, Fragment} from 'react';
import ChangePassword from "./ChangePasswordForm";
import RequestOriginWorldChart from "../components/charts/RequestOriginWorldChart";
import VerifiedRulesTable from "../components/tables/VerifiedRulesTable";
import ApplicationChart from "../components/charts/ApplicationChart";
import UnverifiedRulesTable from "../components/tables/UnverifiedRulesTable";
import AnomalousRulesTable from "../components/tables/AnomalousRulesTable";
import ApplicationLineChart from "../components/charts/ApplicationLineChart";



class Test extends Component {
    render() {
        return (
            <Fragment>
                <ApplicationLineChart/>
            </Fragment>
            )
    }

}

export default Test;