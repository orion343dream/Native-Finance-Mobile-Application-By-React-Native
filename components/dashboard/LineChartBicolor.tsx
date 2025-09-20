import {
    LineChartBicolorPropsType
} from 'gifted-charts-core';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    Rect,
    Stop,
    Text,
} from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 40,
    marginRight: 40,
  },
  horizBar: {
    flexDirection: 'row',
  },
  leftLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastLeftLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftPart: {
    justifyContent: 'center',
  },
  lastLeftPart: {
    justifyContent: 'flex-end',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: 'gray',
    opacity: 0.5,
  },
  lastLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'black',
  },
  bottomLabel: {
    width: '100%',
  },
  customDataPointContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface DataPoint {
  value: number;
  label?: string;
  dataPointText?: string;
}

interface TextStyle {
  fontSize?: number;
  color?: string;
}

export const LineChartBicolor: React.FC<LineChartBicolorPropsType & {
  xAxisLabelTextStyle?: TextStyle;
}> = (props) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  
  const {
    data = [],
    height = 180,
    parentWidth = screenWidth,
    startIndex = 0,
    endIndex,
    color = '#16a34a',
    colorNegative = '#dc2626',
    startFillColor = '#dcfce7',
    endFillColor = '#bbf7d0',
    startFillColorNegative = '#fee2e2',
    endFillColorNegative = '#fecaca',
    initialSpacing = 20,
    spacing = 30,
    thickness = 2,
    dataPointsRadius = 4,
    dataPointsColor = '#047857',
    focusedDataPointRadius = 6,
    focusedDataPointColor = '#047857',
    xAxisLabelTextStyle,
    focusEnabled = true,
    showDataPointOnFocus = true,
    showTextOnFocus = true,
    areaChart = true,
    isAnimated = true,
    rotateLabel = false,
    stepHeight = 30,
    maxValue,
    onFocus,
  } = props;

  const chartHeight = height - 30; // Adjust for labels
  const actualMaxValue = maxValue || Math.max(...data.map(item => Math.abs(item.value))) * 1.2;

  // Convert data points to SVG path
  const generatePath = () => {
    let path = '';
    const points = data.map((item, index) => {
      const x = initialSpacing + index * spacing;
      const y = chartHeight - (chartHeight * item.value) / actualMaxValue + 30;
      return { x, y, value: item.value };
    });

    points.forEach((point, index) => {
      if (index === 0) {
        path += `M ${point.x} ${point.y}`;
      } else {
        // Create a smooth curve using cubic bezier
        const prevPoint = points[index - 1];
        const midX = (prevPoint.x + point.x) / 2;
        path += ` C ${midX} ${prevPoint.y} ${midX} ${point.y} ${point.x} ${point.y}`;
      }
    });

    return path;
  };

  // Generate gradient paths for positive and negative areas
  const generateAreaPath = () => {
    let positivePath = '';
    let negativePath = '';
    const baselineY = chartHeight / 2 + 30; // Middle of chart height

    data.forEach((item, index) => {
      const x = initialSpacing + index * spacing;
      const y = chartHeight - (chartHeight * item.value) / actualMaxValue + 30;
      
      if (index === 0) {
        if (item.value >= 0) {
          positivePath += `M ${x} ${baselineY} L ${x} ${y}`;
        } else {
          negativePath += `M ${x} ${baselineY} L ${x} ${y}`;
        }
      } else {
        const prevX = initialSpacing + (index - 1) * spacing;
        const prevY = chartHeight - (chartHeight * data[index - 1].value) / actualMaxValue + 30;
        const midX = (prevX + x) / 2;

        if (item.value >= 0) {
          if (data[index - 1].value >= 0) {
            positivePath += ` C ${midX} ${prevY} ${midX} ${y} ${x} ${y}`;
          } else {
            // Cross from negative to positive
            const crossX = prevX + (x - prevX) * Math.abs(data[index - 1].value) / (Math.abs(data[index - 1].value) + Math.abs(item.value));
            const crossY = baselineY;
            negativePath += ` C ${midX} ${prevY} ${crossX} ${crossY} ${crossX} ${crossY}`;
            positivePath += `M ${crossX} ${crossY} C ${crossX} ${crossY} ${midX} ${y} ${x} ${y}`;
          }
        } else {
          if (data[index - 1].value < 0) {
            negativePath += ` C ${midX} ${prevY} ${midX} ${y} ${x} ${y}`;
          } else {
            // Cross from positive to negative
            const crossX = prevX + (x - prevX) * Math.abs(data[index - 1].value) / (Math.abs(data[index - 1].value) + Math.abs(item.value));
            const crossY = baselineY;
            positivePath += ` C ${midX} ${prevY} ${crossX} ${crossY} ${crossX} ${crossY}`;
            negativePath += `M ${crossX} ${crossY} C ${crossX} ${crossY} ${midX} ${y} ${x} ${y}`;
          }
        }
      }
    });

    // Close the paths
    if (data.length > 0) {
      const lastX = initialSpacing + (data.length - 1) * spacing;
      positivePath += ` L ${lastX} ${baselineY}`;
      negativePath += ` L ${lastX} ${baselineY}`;
    }

    return { positivePath, negativePath };
  };

  const { positivePath, negativePath } = generateAreaPath();
  const linePath = generatePath();

  return (
    <View style={{ width: parentWidth, height: height }}>
      <Svg width={parentWidth} height={height}>
        {/* Gradient definitions */}
        <Defs>
          <LinearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={startFillColor} stopOpacity="0.5" />
            <Stop offset="1" stopColor={endFillColor} stopOpacity="0.1" />
          </LinearGradient>
          <LinearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={startFillColorNegative} stopOpacity="0.5" />
            <Stop offset="1" stopColor={endFillColorNegative} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        {/* Area fills */}
        {areaChart && (
          <>
            <Path d={positivePath} fill="url(#positiveGradient)" />
            <Path d={negativePath} fill="url(#negativeGradient)" />
          </>
        )}

        {/* Line */}
        <Path
          d={linePath}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
        />

        {/* Data points */}
        {data.map((item, index) => {
          const x = initialSpacing + index * spacing;
          const y = chartHeight - (chartHeight * item.value) / actualMaxValue + 30;
          return (
            <React.Fragment key={index}>
              <Circle
                cx={x}
                cy={y}
                r={index === selectedIndex ? focusedDataPointRadius : dataPointsRadius}
                fill={index === selectedIndex ? focusedDataPointColor : dataPointsColor}
              />
              {focusEnabled && (
                <Rect
                  x={x - spacing / 2}
                  y={0}
                  width={spacing}
                  height={height}
                  fill="transparent"
                  onPress={() => {
                    setSelectedIndex(index);
                    onFocus?.(item, index);
                  }}
                />
              )}
              {(showTextOnFocus && index === selectedIndex && item.dataPointText) && (
                <Text
                  x={x}
                  y={y - 15}
                  fill={item.value >= 0 ? color : colorNegative}
                  textAnchor="middle"
                  fontSize={12}>
                  {item.dataPointText}
                </Text>
              )}
            </React.Fragment>
          );
        })}

        {/* X-axis labels */}
        {data.map((item, index) => (
          <Text
            key={`label-${index}`}
            x={initialSpacing + index * spacing}
            y={height - 5}
            textAnchor="middle"
            fontSize={xAxisLabelTextStyle?.fontSize || 12}
            fill={xAxisLabelTextStyle?.color || '#6b7280'}
            transform={rotateLabel ? `rotate(45, ${initialSpacing + index * spacing}, ${height - 5})` : undefined}>
            {item.label || ''}
          </Text>
        ))}
      </Svg>
    </View>
  );
};
