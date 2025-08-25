'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfidenceDistributionChartProps {
  data: { level: string; count: number }[]
}

const COLORS = {
  HIGH: '#10b981', // emerald-500
  MEDIUM: '#f59e0b', // amber-500  
  LOW: '#ef4444', // red-500
}

const GRADIENT_COLORS = {
  HIGH: 'from-emerald-400 to-emerald-600',
  MEDIUM: 'from-amber-400 to-amber-600',
  LOW: 'from-red-400 to-red-600',
}

const CONFIDENCE_LABELS = {
  HIGH: 'High Confidence',
  MEDIUM: 'Medium Confidence', 
  LOW: 'Low Confidence',
}

const CONFIDENCE_ICONS = {
  HIGH: CheckCircle,
  MEDIUM: AlertTriangle,
  LOW: TrendingUp,
}

export function ConfidenceDistributionChart({ data }: ConfidenceDistributionChartProps) {
  const chartData = data.map(item => ({
    ...item,
    label: CONFIDENCE_LABELS[item.level as keyof typeof CONFIDENCE_LABELS] || item.level,
    color: COLORS[item.level as keyof typeof COLORS] || COLORS.LOW,
  }))

  const total = data.reduce((sum, item) => sum + item.count, 0)

  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : '0'
      const gradient = GRADIENT_COLORS[data.level as keyof typeof GRADIENT_COLORS]
      
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
          <div className="flex items-center space-x-2 mb-2">
            <div className={cn(
              "w-3 h-3 rounded-full bg-gradient-to-r",
              gradient
            )} />
            <p className="text-sm font-semibold text-gray-900">{data.label}</p>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-bold">{data.count}</span> analyses
          </p>
          <p className="text-xs text-gray-500">
            {percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  const renderLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="flex justify-center space-x-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="relative">
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-60 animate-pulse" />
        
        <Card className="border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Confidence Distribution
                </CardTitle>
                <CardDescription className="text-base">
                  Breakdown of analysis confidence levels
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center">No confidence data available yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-60 animate-pulse" />
      
      <Card className="border-0 bg-transparent">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Confidence Distribution
              </CardTitle>
              <CardDescription className="text-base">
                Breakdown of analysis confidence levels
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-6">
            {/* Chart */}
            <div className="h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {Object.entries(COLORS).map(([key, color], index) => (
                      <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                      </linearGradient>
                    ))}
                  </defs>
                  
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="label"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#gradient-${entry.level})`}
                      />
                    ))}
                  </Pie>
                  
                  <Tooltip content={renderTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Stats */}
            <div className="space-y-4">
              {chartData.map((item, index) => {
                const percentage = total > 0 ? ((item.count / total) * 100) : 0
                const Icon = CONFIDENCE_ICONS[item.level as keyof typeof CONFIDENCE_ICONS] || Target
                const gradient = GRADIENT_COLORS[item.level as keyof typeof GRADIENT_COLORS]
                
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-muted/20 backdrop-blur-sm hover:bg-muted/30 transition-colors duration-300">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      gradient
                    )}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.count} analyses
                      </div>
                      
                      {/* Mini progress bar */}
                      <div className="w-full h-1.5 bg-muted/50 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                            gradient
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}