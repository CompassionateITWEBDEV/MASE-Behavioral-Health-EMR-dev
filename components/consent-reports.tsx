"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Download, TrendingUp } from "lucide-react"

const completionData = [
  { category: "Health Screening", completion: 95, total: 247 },
  { category: "Treatment Consent", completion: 92, total: 247 },
  { category: "Program Policies", completion: 88, total: 247 },
  { category: "Testing Procedures", completion: 90, total: 247 },
  { category: "Medication Mgmt", completion: 81, total: 247 },
  { category: "Privacy & Info", completion: 85, total: 247 },
  { category: "Media Release", completion: 64, total: 247 },
  { category: "Assessment", completion: 90, total: 247 },
  { category: "Patient Rights", completion: 88, total: 247 },
  { category: "Telemedicine", completion: 72, total: 247 },
]

const statusData = [
  { name: "Completed", value: 1847, color: "#22c55e" },
  { name: "Pending", value: 234, color: "#f59e0b" },
  { name: "Overdue", value: 89, color: "#ef4444" },
  { name: "Expired", value: 23, color: "#6b7280" },
]

const trendData = [
  { month: "Jul", completed: 156, pending: 45 },
  { month: "Aug", completed: 189, pending: 38 },
  { month: "Sep", completed: 234, pending: 42 },
  { month: "Oct", completed: 267, pending: 35 },
  { month: "Nov", completed: 298, pending: 29 },
  { month: "Dec", completed: 321, pending: 31 },
  { month: "Jan", completed: 342, pending: 28 },
]

const complianceMetrics = [
  {
    metric: "Overall Completion Rate",
    value: "87.2%",
    change: "+2.3%",
    trend: "up",
    description: "Average completion across all forms",
  },
  {
    metric: "Required Forms Compliance",
    value: "94.1%",
    change: "+1.8%",
    trend: "up",
    description: "Completion rate for mandatory forms",
  },
  {
    metric: "Average Time to Complete",
    value: "3.2 days",
    change: "-0.5 days",
    trend: "up",
    description: "From assignment to signature",
  },
  {
    metric: "Forms Expiring This Month",
    value: "23",
    change: "-12",
    trend: "up",
    description: "Requiring renewal or update",
  },
]

export function ConsentReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consent Forms Analytics</h2>
          <p className="text-muted-foreground">Comprehensive reporting and compliance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {complianceMetrics.map((metric) => (
          <Card key={metric.metric}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
              {metric.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>{metric.change}</span>{" "}
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate by Category</CardTitle>
            <CardDescription>Form completion percentages across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Status Distribution</CardTitle>
            <CardDescription>Current status of all consent forms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Trends</CardTitle>
          <CardDescription>Monthly trends in form completion and pending forms</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Category Analysis</CardTitle>
          <CardDescription>In-depth analysis of form completion by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completionData.map((category) => (
              <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{category.category}</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((category.completion / 100) * category.total)} of {category.total} patients completed
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Progress value={category.completion} className="w-32" />
                  <div className="text-right">
                    <div className="font-medium">{category.completion}%</div>
                    <div className="text-sm text-muted-foreground">completion</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
