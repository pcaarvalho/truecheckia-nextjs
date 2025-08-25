'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Analysis Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>

        {/* Confidence Distribution Chart */}
        <Card>
          <CardHeader>
            <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>

        {/* Monthly Usage Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-28 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-5 w-5 bg-muted animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-[200px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>

        {/* Language Distribution Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-28 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-44 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-5 w-5 bg-muted animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 rounded-lg border">
                  <div className="w-10 h-10 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <div className="h-5 w-40 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border">
                  <div className="flex items-start space-x-3">
                    <div className="h-4 w-4 bg-muted animate-pulse rounded flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 w-28 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded mb-3" />
                      <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}