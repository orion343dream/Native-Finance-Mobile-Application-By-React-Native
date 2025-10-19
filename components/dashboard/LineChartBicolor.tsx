import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

type Props = {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  colorPositive?: string;
  colorNegative?: string;
};

// Simple bicolor line chart: draws two overlaid paths — one for positive
// segments and one for negative segments — so portions above/below zero
// can be styled differently.
export const LineChartBicolor: React.FC<Props> = ({
  data,
  width = 300,
  height = 160,
  strokeWidth = 2,
  colorPositive = '#16a34a',
  colorNegative = '#ef4444',
}) => {
  const { posPath, negPath, lastPoint } = useMemo(() => {
    if (!data || data.length === 0) return { posPath: '', negPath: '', lastPoint: null };

    const min = Math.min(...data, 0);
    const max = Math.max(...data, 0);
    const range = max - min || 1;

    const step = width / Math.max(1, data.length - 1);

    const points = data.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return { x, y, v };
    });

   const buildPath = (predicate: (p: typeof points[0]) => boolean) => {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    d += ` L ${p.x} ${p.y}`;
  }
  return d;
};


    const posPath = buildPath(p => p.v >= 0);
    const negPath = buildPath(p => p.v < 0);

    const lastPoint = points[points.length - 1];

    return { posPath, negPath, lastPoint };
  }, [data, width, height]);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {negPath ? <Path d={negPath} stroke={colorNegative} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        {posPath ? <Path d={posPath} stroke={colorPositive} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        {lastPoint ? <Circle cx={lastPoint.x} cy={lastPoint.y} r={strokeWidth * 1.5} fill={lastPoint.v >= 0 ? colorPositive : colorNegative} /> : null}
      </Svg>
    </View>
  );
};

export default LineChartBicolor;
