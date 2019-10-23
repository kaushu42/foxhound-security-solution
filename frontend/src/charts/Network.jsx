import React from "react";
import { ResponsiveNetwork } from "@nivo/network";
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const Network = ({
  data,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  repulsivity = 6,
  iterations = 60,
  nodeColor = function(e) {
    return e.color;
  },
  nodeBorderWidth = 1,
  nodeBorderColor = { from: "color", modifiers: [["darker", 0.8]] },
  linkThickness = function(e) {
    return 2 * (2 - e.source.depth);
  },
  motionStiffness = 160,
  motionDamping = 12
}) => (
  <ResponsiveNetwork
    data={data}
    margin={margin}
    repulsivity={repulsivity}
    iterations={iterations}
    nodeColor={nodeColor}
    nodeBorderWidth={nodeBorderWidth}
    nodeBorderColor={nodeBorderColor}
    linkThickness={linkThickness}
    motionStiffness={motionStiffness}
    motionDamping={motionDamping}
  />
);
export default Network;
