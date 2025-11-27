"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { FileSignature, AlertTriangle, Eye, Edit, Users, TrendingUp } from "lucide-react"

interface ConsentFormsOverviewProps {
  data: {
    categorizedForms: Record<
      string,
      Array<{
        id: number
        name: string
        required: boolean
        completion: number
      }>
    >
    metrics: {
      totalForms: number
      totalPatients: number
      overallCompletionRate: number
    }
  } | null
  isLoading: boolean
  error: Error | null
}

export function ConsentFormsOverview({ data, isLoading, error }: ConsentFormsOverviewProps) {
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground text-center">Failed to load consent forms data. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const categorizedForms = data?.categorizedForms || {}
  const metrics = data?.metrics || { totalForms: 0, totalPatients: 0, overallCompletionRate: 0 }

  const totalForms = Object.values(categorizedForms).reduce((acc, forms) => acc + forms.length, 0)
  const requiredForms = Object.values(categorizedForms).reduce(
    (acc, forms) => acc + forms.filter((form) => form.required).length,
    0,
  )

  // Handle empty state
  if (totalForms === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileSignature className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Form Templates Found</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first consent form template to get started.
          </p>
          <Button>
            <FileSignature className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overallCompletionRate}%</div>
            <Progress value={metrics.overallCompletionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Average across all forms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Required Forms</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requiredForms}</div>
            <p className="text-xs text-muted-foreground">of {totalForms} total forms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Requiring consent tracking</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {Object.entries(categorizedForms).map(([category, forms]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
              <CardDescription>
                {forms.length} form{forms.length !== 1 ? "s" : ""} in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileSignature className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{form.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          {form.required ? (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Optional
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">{form.completion}% completion</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={form.completion} className="w-24" />
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
