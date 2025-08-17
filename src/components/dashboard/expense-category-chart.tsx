"use client";

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

type ExpenseCategoryData = {
  category: string;
  amount: number;
  percentage: number;
};

type ExpenseCategoryChartProps = {
  data: ExpenseCategoryData[];
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
];

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  
  const chartData = data.map((item, index) => ({
    ...item,
    percentage: totalAmount > 0 ? ((item.amount / totalAmount) * 100) : 0,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = chartData.reduce((config, item, index) => {
    config[item.category] = {
      label: item.category,
      color: COLORS[index % COLORS.length],
    };
    return config;
  }, {} as any);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {data.category}
              </span>
              <span className="font-bold text-muted-foreground">
                IDR {data.amount.toLocaleString()}
              </span>
              <span className="text-[0.70rem] text-muted-foreground">
                {data.percentage.toFixed(1)}% of total
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
          <CardDescription>
            Breakdown of expenses by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No expense data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Categories</CardTitle>
        <CardDescription>
          Breakdown of expenses by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}