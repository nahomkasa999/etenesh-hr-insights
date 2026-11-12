"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

const chartConfig = {
  applied: {
    color: "var(--chart-1)",
    label: "Applied",
  },
  forward: {
    color: "var(--chart-2)",
    label: "Moved forward",
  },
} satisfies ChartConfig;

export interface ApplicationsPoint {
  applied: number;
  date: string;
  forward: number;
}

export function ChartAreaInteractive({ data }: { data: ApplicationsPoint[] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const lastDate = data.at(-1)?.date;
  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date(lastDate ?? item.date);
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="text-lg">Applications</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            New applications each day, and how many moved forward
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
            onValueChange={setTimeRange}
            type="single"
            value={timeRange}
            variant="outline"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select onValueChange={setTimeRange} value={timeRange}>
            <SelectTrigger
              aria-label="Select a value"
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem className="rounded-lg" value="90d">
                Last 3 months
              </SelectItem>
              <SelectItem className="rounded-lg" value="30d">
                Last 30 days
              </SelectItem>
              <SelectItem className="rounded-lg" value="7d">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartConfig}
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillApplied" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-applied)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-applied)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillForward" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-forward)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-forward)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                });
              }}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                />
              }
              cursor={false}
            />
            <Area
              dataKey="applied"
              fill="url(#fillApplied)"
              stroke="var(--color-applied)"
              type="monotone"
            />
            <Area
              dataKey="forward"
              fill="url(#fillForward)"
              stroke="var(--color-forward)"
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
