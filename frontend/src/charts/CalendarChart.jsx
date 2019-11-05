import React, {Component, Fragment} from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {Col, Row} from "antd";

class CalendarChart extends Component {

    render() {
        return (
            <Fragment>
                <Row gutter={16} style={{height:'400px'}}>
                    <Col xs={24} sm={24} md={24} lg={12} xl={24}>
                        <CalendarHeatmap
                            startDate={new Date('2016-01-01')}
                            endDate={new Date('2016-12-31')}
                            values={[
                                { date: '2016-01-01' },
                                { date: '2016-01-22' },
                                { date: '2016-01-30' },
                            ]}
                            showWeekdayLabels={true}
                        />

                    </Col>
                </Row>
            </Fragment>
        )
    }
}

export default CalendarChart;