import React from "react";
import { ResponsiveBubble } from "@nivo/circle-packing";

const Bubble = ({
  root,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  identity = "name",
  value = "loc",
  colors = { scheme: "nivo" },
  padding = 6,
  labelTextColor = { from: "color", modifiers: [["darker", 0.8]] },
  borderWidth = 2,
  borderColor = { from: "color" },
  defs = [
    {
      id: "lines",
      type: "patternLines",
      background: "none",
      color: "inherit",
      rotation: -45,
      lineWidth: 5,
      spacing: 8
    }
  ],
  fill = [{ match: { depth: 1 }, id: "lines" }],
  animate = true,
  motionStiffness = 90,
  motionDamping = 12
}) => (
  <ResponsiveBubble
    root={root}
    margin={margin}
    identity={identity}
    value={value}
    colors={colors}
    padding={padding}
    labelTextColor={labelTextColor}
    borderWidth={borderWidth}
    borderColor={borderColor}
    defs={defs}
    fill={fill}
    animate={animate}
    motionStiffness={motionStiffness}
    motionDamping={motionDamping}
  />
);
export default Bubble;
