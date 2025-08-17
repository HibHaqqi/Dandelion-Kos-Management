"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
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
} from "@/components/ui/chart";

type IncomeVsExpenseData = {
  month: string;
  income: number;
  expense: number;
};

type IncomeVsExpenseChartProps = {
  data: IncomeVsExpenseData[];
};

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--chart-2))",
  },
};

export function IncomeVsExpenseChart({ data }: IncomeVsExpenseChartProps) {
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const formattedData = data.map(item => ({
    ...item,
    monthDisplay: formatMonth(item.month),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs. Expense</CardTitle>
        <CardDescription>
          Monthly comparison of income and expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={formattedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis
              dataKey="monthDisplay"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={4}
              name="Income"
            />
            <Bar
              dataKey="expense"
              fill="var(--color-expense)"
              radius={4}
              name="Expense"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}