'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip as ChartTooltipPrimitive
} from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

interface SpendingChartProps {
  transactions: Transaction[];
}

export function SpendingChart({ transactions }: SpendingChartProps) {
  const expenseData = React.useMemo(() => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category:
          EXPENSE_CATEGORIES.find(c => c.value === category)?.label || category,
        total,
        fill: `var(--color-${category})`,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);
  
  const chartConfig = React.useMemo(() => {
    const config: any = {};
    EXPENSE_CATEGORIES.forEach((cat, index) => {
      config[cat.label] = {
        label: cat.label,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
     config['other'] = {
        label: 'Other',
        color: `hsl(var(--chart-5))`,
      };
    return config;
  }, []);


  const monthlyTrends = React.useMemo(() => {
    const trends: { [key: string]: { income: number; expense: number } } = {};
    transactions.forEach(t => {
      const month = t.date.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!trends[month]) {
        trends[month] = { income: 0, expense: 0 };
      }
      trends[month][t.type] += t.amount;
    });
    
    // Convert to array and sort by date
    return Object.entries(trends).map(([month, data]) => ({
      month, ...data
    })).sort((a, b) => {
      const dateA = new Date(`01 ${a.month.replace("'", " 20")}`);
      const dateB = new Date(`01 ${b.month.replace("'", " 20")}`);
      return dateA.getTime() - dateB.getTime();
    }).slice(-6); // Last 6 months
  }, [transactions]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualisasi Pengeluaran</CardTitle>
        <CardDescription>
          Lihat rincian pengeluaran dan tren bulanan Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="kategori">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kategori">Per Kategori</TabsTrigger>
            <TabsTrigger value="bulanan">Per Bulan</TabsTrigger>
          </TabsList>
          <TabsContent value="kategori">
             <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <ChartTooltipPrimitive
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={expenseData}
                    dataKey="total"
                    nameKey="category"
                    innerRadius={60}
                  />
                </PieChart>
              </ChartContainer>
          </TabsContent>
          <TabsContent value="bulanan">
            <ChartContainer config={{
              income: { label: 'Pemasukan', color: 'hsl(var(--chart-3))' },
              expense: { label: 'Pengeluaran', color: 'hsl(var(--chart-4))' },
            }} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={monthlyTrends}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickFormatter={(value) => formatCurrency(value as number, true)} />
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
