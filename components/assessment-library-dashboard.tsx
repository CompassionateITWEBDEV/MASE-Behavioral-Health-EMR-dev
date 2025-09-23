"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Clock, Users, TrendingUp, CheckCircle, FileText, Star } from "lucide-react"

// Mock data for assessment forms
const assessmentForms = [
  {
    id: 1,
    code: "ANSA",
    name: "Adult Needs and Strengths Assessment",
    category: "Comprehensive Assessment",
    description: "Comprehensive assessment tool for adults in behavioral health services",
    estimatedTime: 45,
    frequency: "At Admission, Every 90 Days",
    scoringGuidelines: "Scores range from 0-3 for each domain",
    clinicalGuidelines: "Use for treatment planning and outcome measurement",
    isPopular: true,
    completions: 1250,
  },
  {
    id: 2,
    code: "C-SSRS",
    name: "Columbia Suicide Severity Rating Scale",
    category: "Suicide Risk",
    description: "Gold standard for suicide risk assessment",
    estimatedTime: 15,
    frequency: "At Every Encounter",
    scoringGuidelines: "Binary and severity scoring for suicidal ideation and behavior",
    clinicalGuidelines: "Critical for safety planning and risk management",
    isPopular: true,
    completions: 2100,
  },
  {
    id: 3,
    code: "PHQ-9",
    name: "Patient Health Questionnaire-9",
    category: "Depression",
    description: "Nine-item depression screening and severity measure",
    estimatedTime: 5,
    frequency: "Weekly",
    scoringGuidelines: "0-27 scale with severity categories and diagnostic algorithm",
    clinicalGuidelines: "Depression screening and monitoring",
    isPopular: true,
    completions: 3200,
  },
  {
    id: 4,
    code: "GAD-7",
    name: "Generalized Anxiety Disorder",
    category: "Anxiety",
    description: "Seven-item anxiety screening and severity measure",
    estimatedTime: 5,
    frequency: "Weekly",
    scoringGuidelines: "0-21 scale with severity categories",
    clinicalGuidelines: "Primary care and specialty anxiety assessment",
    isPopular: true,
    completions: 2800,
  },
  {
    id: 5,
    code: "PCL-5",
    name: "PTSD Checklist for DSM-5",
    category: "PTSD/Trauma",
    description: "Gold standard PTSD assessment for DSM-5",
    estimatedTime: 10,
    frequency: "Monthly",
    scoringGuidelines: "Total severity score with diagnostic cutoff",
    clinicalGuidelines: "PTSD screening, diagnosis, and monitoring",
    isPopular: false,
    completions: 890,
  },
  {
    id: 6,
    code: "BAM",
    name: "Brief Addiction Monitor",
    category: "Substance Use",
    description: "Brief assessment with scoring and clinical guidelines for addiction monitoring",
    estimatedTime: 10,
    frequency: "Weekly",
    scoringGuidelines: "Total score interpretation provided with clinical guidelines",
    clinicalGuidelines: "Monitor treatment progress and identify areas of concern",
    isPopular: false,
    completions: 650,
  },
  {
    id: 7,
    code: "DASS-21",
    name: "Depression, Anxiety and Stress Scale",
    category: "Depression/Anxiety",
    description: "21-item assessment of depression, anxiety, and stress",
    estimatedTime: 10,
    frequency: "Monthly",
    scoringGuidelines: "Separate scores for each subscale with severity ranges",
    clinicalGuidelines: "Useful for screening and monitoring treatment progress",
    isPopular: false,
    completions: 420,
  },
  {
    id: 8,
    code: "URICA",
    name: "Change Assessment Scale",
    category: "Motivation",
    description: "Assessment of readiness to change behavior",
    estimatedTime: 15,
    frequency: "At Admission, Every 30 Days",
    scoringGuidelines: "Stage of change scoring",
    clinicalGuidelines: "Treatment planning and motivational enhancement",
    isPopular: false,
    completions: 380,
  },
]

const categories = [
  "All",
  "Comprehensive Assessment",
  "Depression",
  "Anxiety",
  "Suicide Risk",
  "PTSD/Trauma",
  "Substance Use",
  "Motivation",
]

export function AssessmentLibraryDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedForm, setSelectedForm] = useState<(typeof assessmentForms)[0] | null>(null)

  const filteredForms = assessmentForms.filter((form) => {
    const matchesSearch =
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || form.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularForms = assessmentForms.filter((form) => form.isPopular)
  const totalCompletions = assessmentForms.reduce((sum, form) => sum + form.completions, 0)

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessmentForms.length}</div>
            <p className="text-xs text-muted-foreground">Standardized clinical assessments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all assessment forms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Forms</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{popularForms.length}</div>
            <p className="text-xs text-muted-foreground">Most frequently used</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
            <p className="text-xs text-muted-foreground">Clinical assessment categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessment forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all-forms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-forms">All Forms</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="all-forms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredForms.map((form) => (
              <Card key={form.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {form.code}
                        {form.isPopular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium">{form.name}</CardDescription>
                    </div>
                    <Badge variant="secondary">{form.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{form.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{form.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{form.completions}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedForm(form)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {form.code} - {form.name}
                            {form.isPopular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          </DialogTitle>
                          <DialogDescription>{form.description}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Assessment Details</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>Category:</strong> {form.category}
                                </div>
                                <div>
                                  <strong>Estimated Time:</strong> {form.estimatedTime} minutes
                                </div>
                                <div>
                                  <strong>Frequency:</strong> {form.frequency}
                                </div>
                                <div>
                                  <strong>Completions:</strong> {form.completions}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Clinical Information</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>Scoring:</strong> {form.scoringGuidelines}
                                </div>
                                <div>
                                  <strong>Guidelines:</strong> {form.clinicalGuidelines}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button>Administer Assessment</Button>
                            <Button variant="outline">View Sample</Button>
                            <Button variant="outline">Download PDF</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm">Administer</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popularForms.map((form) => (
              <Card key={form.id} className="cursor-pointer hover:shadow-md transition-shadow border-yellow-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {form.code}
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </CardTitle>
                      <CardDescription className="text-sm font-medium">{form.name}</CardDescription>
                    </div>
                    <Badge variant="secondary">{form.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{form.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{form.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{form.completions}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">Administer</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-category" className="space-y-4">
          {categories.slice(1).map((category) => {
            const categoryForms = assessmentForms.filter((form) => form.category === category)
            if (categoryForms.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3">{category}</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                  {categoryForms.map((form) => (
                    <Card key={form.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {form.code}
                              {form.isPopular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">{form.name}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{form.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{form.estimatedTime} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{form.completions}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm">Administer</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
