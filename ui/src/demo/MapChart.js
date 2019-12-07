import React, {Component, Fragment} from 'react';
import { ResponsiveChoropleth } from '@nivo/geo';
import countries from "./world_countries.json";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { ResponsiveSankey } from '@nivo/sankey';

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


const data = [
    {
        "id": "AFG",
        "value": 843989
    },
    {
        "id": "AGO",
        "value": 271100
    },
    {
        "id": "ALB",
        "value": 676662
    },
    {
        "id": "ARE",
        "value": 469240
    },
    {
        "id": "ARG",
        "value": 576015
    },
    {
        "id": "ARM",
        "value": 883069
    },
    {
        "id": "ATA",
        "value": 9529
    },
    {
        "id": "ATF",
        "value": 30899
    },
    {
        "id": "AUT",
        "value": 722028
    },
    {
        "id": "AZE",
        "value": 311072
    },
    {
        "id": "BDI",
        "value": 33943
    },
    {
        "id": "BEL",
        "value": 99904
    },
    {
        "id": "BEN",
        "value": 634977
    },
    {
        "id": "BFA",
        "value": 48292
    },
    {
        "id": "BGD",
        "value": 714841
    },
    {
        "id": "BGR",
        "value": 448415
    },
    {
        "id": "BHS",
        "value": 840030
    },
    {
        "id": "BIH",
        "value": 938214
    },
    {
        "id": "BLR",
        "value": 761052
    },
    {
        "id": "BLZ",
        "value": 439419
    },
    {
        "id": "BOL",
        "value": 855465
    },
    {
        "id": "BRN",
        "value": 437342
    },
    {
        "id": "BTN",
        "value": 390825
    },
    {
        "id": "BWA",
        "value": 280719
    },
    {
        "id": "CAF",
        "value": 29794
    },
    {
        "id": "CAN",
        "value": 926961
    },
    {
        "id": "CHE",
        "value": 432264
    },
    {
        "id": "CHL",
        "value": 287053
    },
    {
        "id": "CHN",
        "value": 524191
    },
    {
        "id": "CIV",
        "value": 561136
    },
    {
        "id": "CMR",
        "value": 76880
    },
    {
        "id": "COG",
        "value": 301791
    },
    {
        "id": "COL",
        "value": 334763
    },
    {
        "id": "CRI",
        "value": 577004
    },
    {
        "id": "CUB",
        "value": 38631
    },
    {
        "id": "-99",
        "value": 720407
    },
    {
        "id": "CYP",
        "value": 630243
    },
    {
        "id": "CZE",
        "value": 665886
    },
    {
        "id": "DEU",
        "value": 26557
    },
    {
        "id": "DJI",
        "value": 568036
    },
    {
        "id": "DNK",
        "value": 557366
    },
    {
        "id": "DOM",
        "value": 441399
    },
    {
        "id": "DZA",
        "value": 39231
    },
    {
        "id": "ECU",
        "value": 77342
    },
    {
        "id": "EGY",
        "value": 443098
    },
    {
        "id": "ERI",
        "value": 787830
    },
    {
        "id": "ESP",
        "value": 567872
    },
    {
        "id": "EST",
        "value": 881921
    },
    {
        "id": "ETH",
        "value": 768480
    },
    {
        "id": "FIN",
        "value": 483099
    },
    {
        "id": "FJI",
        "value": 804579
    },
    {
        "id": "FLK",
        "value": 451804
    },
    {
        "id": "FRA",
        "value": 720121
    },
    {
        "id": "GAB",
        "value": 123246
    },
    {
        "id": "GBR",
        "value": 527517
    },
    {
        "id": "GEO",
        "value": 950544
    },
    {
        "id": "GHA",
        "value": 938879
    },
    {
        "id": "GIN",
        "value": 710277
    },
    {
        "id": "GMB",
        "value": 502734
    },
    {
        "id": "GNB",
        "value": 210326
    },
    {
        "id": "GNQ",
        "value": 824770
    },
    {
        "id": "GRC",
        "value": 193845
    },
    {
        "id": "GTM",
        "value": 589964
    },
    {
        "id": "GUY",
        "value": 925972
    },
    {
        "id": "HND",
        "value": 592908
    },
    {
        "id": "HRV",
        "value": 617520
    },
    {
        "id": "HTI",
        "value": 814946
    },
    {
        "id": "HUN",
        "value": 743806
    },
    {
        "id": "IDN",
        "value": 436405
    },
    {
        "id": "IND",
        "value": 609209
    },
    {
        "id": "IRL",
        "value": 383250
    },
    {
        "id": "IRN",
        "value": 49780
    },
    {
        "id": "IRQ",
        "value": 437610
    },
    {
        "id": "ISL",
        "value": 964456
    },
    {
        "id": "ISR",
        "value": 276724
    },
    {
        "id": "ITA",
        "value": 129837
    },
    {
        "id": "JAM",
        "value": 663178
    },
    {
        "id": "JOR",
        "value": 588011
    },
    {
        "id": "JPN",
        "value": 603032
    },
    {
        "id": "KAZ",
        "value": 789158
    },
    {
        "id": "KEN",
        "value": 411595
    },
    {
        "id": "KGZ",
        "value": 206150
    },
    {
        "id": "KHM",
        "value": 772976
    },
    {
        "id": "OSA",
        "value": 89849
    },
    {
        "id": "KWT",
        "value": 450689
    },
    {
        "id": "LAO",
        "value": 556097
    },
    {
        "id": "LBN",
        "value": 571228
    },
    {
        "id": "LBR",
        "value": 355740
    },
    {
        "id": "LBY",
        "value": 614098
    },
    {
        "id": "LKA",
        "value": 30451
    },
    {
        "id": "LSO",
        "value": 728220
    },
    {
        "id": "LTU",
        "value": 241670
    },
    {
        "id": "LUX",
        "value": 815283
    },
    {
        "id": "LVA",
        "value": 234874
    },
    {
        "id": "MAR",
        "value": 581917
    },
    {
        "id": "MDA",
        "value": 736466
    },
    {
        "id": "MDG",
        "value": 951289
    },
    {
        "id": "MEX",
        "value": 172168
    },
    {
        "id": "MKD",
        "value": 258053
    },
    {
        "id": "MLI",
        "value": 386938
    },
    {
        "id": "MMR",
        "value": 626495
    },
    {
        "id": "MNE",
        "value": 696768
    },
    {
        "id": "MNG",
        "value": 835722
    },
    {
        "id": "MOZ",
        "value": 124145
    },
    {
        "id": "MRT",
        "value": 209379
    },
    {
        "id": "MWI",
        "value": 310782
    },
    {
        "id": "MYS",
        "value": 582530
    },
    {
        "id": "NAM",
        "value": 331296
    },
    {
        "id": "NCL",
        "value": 901154
    },
    {
        "id": "NER",
        "value": 454834
    },
    {
        "id": "NGA",
        "value": 508545
    },
    {
        "id": "NIC",
        "value": 467185
    },
    {
        "id": "NLD",
        "value": 61322
    },
    {
        "id": "NOR",
        "value": 977669
    },
    {
        "id": "NPL",
        "value": 809901
    },
    {
        "id": "NZL",
        "value": 742908
    },
    {
        "id": "OMN",
        "value": 170992
    },
    {
        "id": "PAK",
        "value": 343476
    },
    {
        "id": "PAN",
        "value": 884641
    },
    {
        "id": "PER",
        "value": 340824
    },
    {
        "id": "PHL",
        "value": 813058
    },
    {
        "id": "PNG",
        "value": 33795
    },
    {
        "id": "POL",
        "value": 772870
    },
    {
        "id": "PRI",
        "value": 533486
    },
    {
        "id": "PRT",
        "value": 716758
    },
    {
        "id": "PRY",
        "value": 66984
    },
    {
        "id": "QAT",
        "value": 151967
    },
    {
        "id": "ROU",
        "value": 134541
    },
    {
        "id": "RUS",
        "value": 175301
    },
    {
        "id": "RWA",
        "value": 58568
    },
    {
        "id": "ESH",
        "value": 317213
    },
    {
        "id": "SAU",
        "value": 787761
    },
    {
        "id": "SDN",
        "value": 425771
    },
    {
        "id": "SDS",
        "value": 437308
    },
    {
        "id": "SEN",
        "value": 95734
    },
    {
        "id": "SLB",
        "value": 602672
    },
    {
        "id": "SLE",
        "value": 815839
    },
    {
        "id": "SLV",
        "value": 684366
    },
    {
        "id": "ABV",
        "value": 409278
    },
    {
        "id": "SOM",
        "value": 505960
    },
    {
        "id": "SRB",
        "value": 661454
    },
    {
        "id": "SUR",
        "value": 972293
    },
    {
        "id": "SVK",
        "value": 569601
    },
    {
        "id": "SVN",
        "value": 268046
    },
    {
        "id": "SWZ",
        "value": 281486
    },
    {
        "id": "SYR",
        "value": 550357
    },
    {
        "id": "TCD",
        "value": 551647
    },
    {
        "id": "TGO",
        "value": 549296
    },
    {
        "id": "THA",
        "value": 562864
    },
    {
        "id": "TJK",
        "value": 146601
    },
    {
        "id": "TKM",
        "value": 501963
    },
    {
        "id": "TLS",
        "value": 512946
    },
    {
        "id": "TTO",
        "value": 574898
    },
    {
        "id": "TUN",
        "value": 351384
    },
    {
        "id": "TUR",
        "value": 665097
    },
    {
        "id": "TWN",
        "value": 195106
    },
    {
        "id": "TZA",
        "value": 109367
    },
    {
        "id": "UGA",
        "value": 415243
    },
    {
        "id": "UKR",
        "value": 212810
    },
    {
        "id": "URY",
        "value": 742099
    },
    {
        "id": "USA",
        "value": 604020
    },
    {
        "id": "UZB",
        "value": 866580
    },
    {
        "id": "VEN",
        "value": 718805
    },
    {
        "id": "VNM",
        "value": 778467
    },
    {
        "id": "VUT",
        "value": 783700
    },
    {
        "id": "PSE",
        "value": 263722
    },
    {
        "id": "YEM",
        "value": 30759
    },
    {
        "id": "ZAF",
        "value": 871222
    },
    {
        "id": "ZMB",
        "value": 277314
    },
    {
        "id": "ZWE",
        "value": 981046
    },
    {
        "id": "KOR",
        "value": 680749
    }
]

class MapChart extends Component{

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
                                <ResponsiveChoropleth
                                    data={data}
                                    features={countries.features}
                                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                    colors="nivo"
                                    domain={[ 0,1000000 ]}
                                    unknownColor="#666666"
                                    label="properties.name"
                                    valueFormat=".2s"
                                    projectionTranslation={[ 0.5, 0.5 ]}
                                    projectionRotation={[ 0, 0, 0 ]}
                                    enableGraticule={true}
                                    graticuleLineColor="#dddddd"
                                    borderWidth={0.5}
                                    borderColor="#152538"
                                    legends={[
                                        {
                                            anchor: 'bottom-left',
                                            direction: 'column',
                                            justify: true,
                                            translateX: 20,
                                            translateY: -100,
                                            itemsSpacing: 0,
                                            itemWidth: 94,
                                            itemHeight: 18,
                                            itemDirection: 'left-to-right',
                                            itemTextColor: '#444444',
                                            itemOpacity: 0.85,
                                            symbolSize: 18,
                                            effects: [
                                                {
                                                    on: 'hover',
                                                    style: {
                                                        itemTextColor: '#000000',
                                                        itemOpacity: 1
                                                    }
                                                }
                                            ]
                                        }
                                    ]} />
                            </div>
                        </Card>
                    </div>
                </FullScreen>
            </Fragment>
        )
    }

}

export default MapChart;