'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DailyAnalysisChartProps {
  data: { date: string; count: number }[]
  growth?: number
}

export function DailyAnalysisChart({ data, growth }: DailyAnalysisChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    })
  }

  const maxValue = Math.max(...data.map(d => d.count), 10)

  return (
    <div className="relative">
      {/* Floating decoration */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-60 animate-pulse" />
      
      <Card className="border-0 bg-transparent">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Daily Analyses
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Analysis activity over the last 7 days
              </CardDescription>
            </div>
            {growth !== undefined && (
              <div className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-xl backdrop-blur-sm text-sm font-medium",
                growth >= 0 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              )}>
                {growth >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{growth >= 0 ? '+' : ''}{growth.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="h-[240px] relative">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent pointer-events-none z-10" />
            
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analysisGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#667eea"/>
                    <stop offset="100%" stopColor="#764ba2"/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="currentColor" 
                  className="opacity-20" 
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="opacity-60"
                />
                
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="opacity-60"
                  domain={[0, maxValue * 1.2]}
                />
                
                <Tooltip
                  labelFormatter={(value) => formatTooltipDate(value as string)}
                  formatter={(value: number) => [
                    <span className="font-semibold text-purple-600">{value}</span>, 
                    'Analyses'
                  ]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  fill="url(#analysisGradient)"
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    stroke: '#667eea', 
                    strokeWidth: 3,
                    fill: '#ffffff',
                    filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}