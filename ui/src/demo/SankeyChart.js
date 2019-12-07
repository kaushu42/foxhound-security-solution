import React, {Component, Fragment} from 'react';
import { ResponsiveSankey } from '@nivo/sankey'
import FullScreen from "react-request-fullscreen";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCoffee, faCompress, faDownload, faExpand} from '@fortawesome/free-solid-svg-icons'
import {
    PageSection,
    Card,
    CardHead,
    CardActions,
    CardHeader,
    CardBody,
    Text,
    TextContent,
    Select, SelectOption, SelectVariant
} from "@patternfly/react-core";
import { Drawer, DrawerPanelContent, DrawerContent } from '@patternfly/react-core/dist/esm/experimental';
import domtoimage from "dom-to-image";


const data = {
    "nodes": [
        {
            "id": "John",
            "color": "hsl(314, 70%, 50%)"
        },
        {
            "id": "Raoul",
            "color": "hsl(125, 70%, 50%)"
        },
        {
            "id": "Jane",
            "color": "hsl(188, 70%, 50%)"
        },
        {
            "id": "Marcel",
            "color": "hsl(229, 70%, 50%)"
        },
        {
            "id": "Ibrahim",
            "color": "hsl(60, 70%, 50%)"
        },
        {
            "id": "Junko",
            "color": "hsl(294, 70%, 50%)"
        }
    ],
    "links": [
        {
            "source": "John",
            "target": "Jane",
            "value": 10
        },
        {
            "source": "John",
            "target": "Raoul",
            "value": 103
        },
        {
            "source": "Ibrahim",
            "target": "Raoul",
            "value": 76
        },
        {
            "source": "Ibrahim",
            "target": "John",
            "value": 79
        },
        {
            "source": "Junko",
            "target": "Marcel",
            "value": 38
        },
        {
            "source": "Junko",
            "target": "Raoul",
            "value": 138
        },
        {
            "source": "Junko",
            "target": "Ibrahim",
            "value": 122
        },
        {
            "source": "Marcel",
            "target": "Ibrahim",
            "value": 71
        },
        {
            "source": "Raoul",
            "target": "Jane",
            "value": 148
        }
    ]
}

class SankeyChart extends Component{

    constructor(props) {
        super(props);
        this.options = [
            { value: 'Alabama', disabled: false },
            { value: 'Florida', disabled: false },
            { value: 'New Jersey', disabled: false },
            { value: 'New Mexico', disabled: false },
            { value: 'New York', disabled: false },
            { value: 'North Carolina', disabled: false }
        ];
        this.state = {
            isDrawerExpanded : false,
            isFullScreen: false,
            isExpanded: false,
            isPlain: true,
            selected: []
        }
        this.onToggle = isExpanded => {
            this.setState({
                isExpanded
            });
        };

        this.onSelect = (event, selection) => {
            const { selected } = this.state;
            if (selected.includes(selection)) {
                this.setState(
                    prevState => ({ selected: prevState.selected.filter(item => item !== selection) }),
                    () => console.log('selections: ', this.state.selected)
                );
            } else {
                this.setState(
                    prevState => ({ selected: [...prevState.selected, selection] }),
                    () => console.log('selections: ', this.state.selected)
                );
            }
        };

        this.clearSelection = () => {
            this.setState({
                selected: [],
                isExpanded: false
            });
        };
    }

    requestOrExitFullScreenByElement () {
        this.elFullScreenRef.fullScreen(this.elRef)
    }

    handleDownloadImage = () => {
        console.log('image saving');
        domtoimage.toJpeg(document.getElementById('abc'), { quality: 1 })
            .then(function (dataUrl) {
                var link = document.createElement('a');
                link.download = 'my-image-name.jpeg';
                link.href = dataUrl;
                link.click();
            });
    };

    render(){
        const { isExpanded, isPlain, selected,isDrawerExpanded } = this.state;
        const titleId = 'plain-typeahead-select-id';
        return (
            <Fragment>
                <FullScreen ref={ref => { this.elFullScreenRef = ref }} >
                    <div>
                        <Card>
                            <CardHead style={{margin:-15}}>
                                <TextContent>
                                    Netflow: Source - Destination Zone
                                </TextContent>
                                <CardActions>
                                    <Select
                                        variant={SelectVariant.typeaheadMulti}
                                        aria-label="Select a state"
                                        onToggle={this.onToggle}
                                        onSelect={this.onSelect}
                                        onClear={this.clearSelection}
                                        selections={selected}
                                        isExpanded={isExpanded}
                                        ariaLabelledBy={titleId}
                                        placeholderText="Exclude Countries">
                                        {this.options.map((option, index) => (
                                            <SelectOption isDisabled={option.disabled} key={index} value={option.value} />
                                        ))}
                                    </Select>
                                    {!this.state.isFullScreen ? <FontAwesomeIcon icon={faExpand} onClick={this.requestOrExitFullScreenByElement.bind(this)}/> : <FontAwesomeIcon icon={faCompress} onClick={this.requestOrExitFullScreenByElement.bind(this)}/>}
                                    <FontAwesomeIcon icon={faDownload} onClick={this.handleDownloadImage}/>
                                </CardActions>
                            </CardHead>
                            <div style={{height:'400px'}} id="abc" className='el-rq' ref={ref => { this.elRef = ref }}>
                                <ResponsiveSankey
                                    data={data}
                                    margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
                                    align="justify"
                                    colors={{ scheme: 'category10' }}
                                    nodeOpacity={1}
                                    nodeThickness={18}
                                    nodeInnerPadding={3}
                                    nodeSpacing={24}
                                    nodeBorderWidth={0}
                                    nodeBorderColor={{ from: 'color', modifiers: [ [ 'darker', 0.8 ] ] }}
                                    linkOpacity={0.5}
                                    linkHoverOthersOpacity={0.1}
                                    enableLinkGradient={true}
                                    labelPosition="outside"
                                    labelOrientation="vertical"
                                    labelPadding={16}
                                    labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1 ] ] }}
                                    animate={true}
                                    onClick={(e)=> {console.log(e);this.setState({
                                        isDrawerExpanded : true
                                    })}}
                                    motionStiffness={140}
                                    motionDamping={13}
                                    legends={[
                                        {
                                            anchor: 'bottom-right',
                                            direction: 'column',
                                            itemWidth: 60,
                                            itemHeight: 10,
                                            itemDirection: 'left-to-right',
                                            itemTextColor: '#999',
                                            itemsSpacing:3,
                                            symbolSize: 10,
                                            effects: [
                                                {
                                                    on: 'hover',
                                                    style: {
                                                        itemTextColor: '#000'
                                                    }
                                                }
                                            ]
                                        }
                                    ]}
                                />
                            </div>
                        </Card>
                    </div>
                </FullScreen>
            </Fragment>
        )
    }

}

export default SankeyChart;