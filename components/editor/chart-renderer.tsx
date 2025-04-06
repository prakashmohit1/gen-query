"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";

interface Column {
  name: string;
  type?: string;
}

interface YColumnConfig {
  column: string;
  aggregation: string;
}

interface ChartConfig {
  chartType: string;
  xColumn: string;
  yColumns: YColumnConfig[];
  groupBy: string;
  errorColumn: string;
  stacking: string;
  normalizeToPercentage: boolean;
  nullValueHandling: string;
  horizontalChart: boolean;
  showLegend: boolean;
}

interface ChartRendererProps {
  chartConfig: ChartConfig;
  data: any[][];
  columns: Column[];
}

const aggregateData = (
  data: any[][],
  columns: Column[],
  config: ChartConfig
): any[] => {
  const xColumnIndex = columns.findIndex((col) => col.name === config.xColumn);

  // Create a map to store aggregated values
  const aggregatedMap = new Map();

  data.forEach((row) => {
    const xValue = row[xColumnIndex]?.toString() ?? "NULL";

    if (!aggregatedMap.has(xValue)) {
      aggregatedMap.set(xValue, {
        [config.xColumn]: xValue,
      });
    }

    config.yColumns.forEach((yCol) => {
      const yColumnIndex = columns.findIndex((col) => col.name === yCol.column);
      const value = parseFloat(row[yColumnIndex]) || 0;
      const currentValue = aggregatedMap.get(xValue)[yCol.column] || 0;
      const currentCount =
        aggregatedMap.get(xValue)[`${yCol.column}_count`] || 0;

      switch (yCol.aggregation) {
        case "sum":
          aggregatedMap.get(xValue)[yCol.column] = currentValue + value;
          break;
        case "avg":
          aggregatedMap.get(xValue)[yCol.column] = currentValue + value;
          aggregatedMap.get(xValue)[`${yCol.column}_count`] = currentCount + 1;
          break;
        case "min":
          aggregatedMap.get(xValue)[yCol.column] = Math.min(
            currentValue || Infinity,
            value
          );
          break;
        case "max":
          aggregatedMap.get(xValue)[yCol.column] = Math.max(
            currentValue || -Infinity,
            value
          );
          break;
        case "count":
          aggregatedMap.get(xValue)[yCol.column] = currentCount + 1;
          break;
      }
    });
  });

  // Convert map to array and calculate averages
  const aggregatedData = Array.from(aggregatedMap.values()).map((item) => {
    const result = { ...item };
    config.yColumns.forEach((yCol) => {
      if (yCol.aggregation === "avg") {
        result[yCol.column] =
          result[yCol.column] / result[`${yCol.column}_count`];
        delete result[`${yCol.column}_count`];
      }
    });
    return result;
  });

  return aggregatedData;
};

export function ChartRenderer({
  chartConfig,
  data,
  columns,
}: ChartRendererProps) {
  const chartData = aggregateData(data, columns, chartConfig);

  const renderChart = () => {
    const commonProps = {
      width: 500,
      height: 300,
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartConfig.chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xColumn} />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartConfig.yColumns.map((yCol, index) => (
              <Bar
                key={yCol.column}
                dataKey={yCol.column}
                fill={`hsl(${
                  (index * 360) / chartConfig.yColumns.length
                }, 70%, 50%)`}
                stackId={chartConfig.stacking !== "none" ? "stack" : undefined}
              />
            ))}
          </BarChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xColumn} />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartConfig.yColumns.map((yCol, index) => (
              <Line
                key={yCol.column}
                type="monotone"
                dataKey={yCol.column}
                stroke={`hsl(${
                  (index * 360) / chartConfig.yColumns.length
                }, 70%, 50%)`}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xColumn} />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartConfig.yColumns.map((yCol, index) => (
              <Area
                key={yCol.column}
                type="monotone"
                dataKey={yCol.column}
                fill={`hsl(${
                  (index * 360) / chartConfig.yColumns.length
                }, 70%, 50%)`}
                stroke={`hsl(${
                  (index * 360) / chartConfig.yColumns.length
                }, 70%, 40%)`}
                stackId={chartConfig.stacking !== "none" ? "stack" : undefined}
              />
            ))}
          </AreaChart>
        );

      case "scatter":
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xColumn} />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartConfig.yColumns.map((yCol, index) => (
              <Scatter
                key={yCol.column}
                name={yCol.column}
                data={chartData}
                fill={`hsl(${
                  (index * 360) / chartConfig.yColumns.length
                }, 70%, 50%)`}
              />
            ))}
          </ScatterChart>
        );

      case "pie":
      case "donut":
        return (
          <PieChart {...commonProps}>
            {chartConfig.yColumns.map((yCol, index) => (
              <Pie
                key={yCol.column}
                data={chartData}
                dataKey={yCol.column}
                nameKey={chartConfig.xColumn}
                cx="50%"
                cy="50%"
                innerRadius={chartConfig.chartType === "donut" ? 60 : 0}
                outerRadius={80}
                fill={`hsl(${
                  (index * 360) / chartConfig.yColumns.length
                }, 70%, 50%)`}
                label
              />
            ))}
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case "radar":
        return (
          <RadarChart {...commonProps} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid />
            <PolarAngleAxis dataKey={chartConfig.xColumn} />
            <PolarRadiusAxis />
            {chartConfig.yColumns.map((yCol, index) => (
              <Radar
                key={yCol.column}
                name={yCol.column}
                dataKey={yCol.column}
                stroke={`hsl(${
                  (index * 360) / chartConfig.yColumns.length
                }, 70%, 50%)`}
                fill={`hsl(${
                  (index * 360) / chartConfig.yColumns.length
                }, 70%, 50%)`}
                fillOpacity={0.6}
              />
            ))}
            <Tooltip />
            <Legend />
          </RadarChart>
        );

      case "composed":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xColumn} />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartConfig.yColumns.map((yCol, index) => {
              const color = `hsl(${
                (index * 360) / chartConfig.yColumns.length
              }, 70%, 50%)`;
              // Alternate between different chart types
              switch (index % 3) {
                case 0:
                  return (
                    <Bar
                      key={yCol.column}
                      dataKey={yCol.column}
                      fill={color}
                      stackId={
                        chartConfig.stacking !== "none" ? "stack" : undefined
                      }
                    />
                  );
                case 1:
                  return (
                    <Line
                      key={yCol.column}
                      type="monotone"
                      dataKey={yCol.column}
                      stroke={color}
                    />
                  );
                case 2:
                  return (
                    <Area
                      key={yCol.column}
                      type="monotone"
                      dataKey={yCol.column}
                      fill={color}
                      stroke={color}
                    />
                  );
                default:
                  return null;
              }
            })}
          </ComposedChart>
        );

      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xColumn} />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartConfig.yColumns.map((yCol, index) => (
              <Bar
                key={yCol.column}
                dataKey={yCol.column}
                fill={`hsl(${
                  (index * 360) / chartConfig.yColumns.length
                }, 70%, 50%)`}
                stackId={chartConfig.stacking !== "none" ? "stack" : undefined}
              />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full h-full min-h-[400px]">
      <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
    </div>
  );
}
