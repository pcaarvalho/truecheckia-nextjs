'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Languages } from 'lucide-react'

interface LanguageDistributionChartProps {
  data: { language: string; count: number }[]
}

export function LanguageDistributionChart({ data }: LanguageDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {value} analyses ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Language Usage</CardTitle>
              <CardDescription>
                Distribution of analysis by language
              </CardDescription>
            </div>
            <Languages className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Language Usage</CardTitle>
            <CardDescription>
              Distribution of analyses by language
            </CardDescription>
          </div>
          <Languages className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="language" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip content={renderTooltip} />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}