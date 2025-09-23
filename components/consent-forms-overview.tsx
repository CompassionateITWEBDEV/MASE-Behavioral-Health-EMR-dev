"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileSignature, AlertTriangle, Eye, Edit, Users, TrendingUp } from "lucide-react"

const consentFormCategories = [
  {
    category: "Health Screening",
    forms: [{ name: "COVID-19 Patient Screening Form", required: true, completion: 95 }],
  },
  {
    category: "Program Policies",
    forms: [
      { name: "Take Home Policy", required: true, completion: 88 },
      { name: "Program Description", required: true, completion: 92 },
      { name: "Program Rules and Expectations", required: true, completion: 85 },
      { name: "Drug and Alcohol Use Policy", required: true, completion: 90 },
    ],
  },
  {
    category: "Treatment Consent",
    forms: [
      { name: "Consent for Treatment", required: true, completion: 98 },
      { name: "Safety Contract", required: true, completion: 87 },
      { name: "Patient Orientation Checklist", required: true, completion: 93 },
    ],
  },
  {
    category: "Testing Procedures",
    forms: [
      { name: "Random Drug Testing", required: true, completion: 91 },
      { name: "Urine Drug Screen Policy", required: true, completion: 89 },
    ],
  },
  {
    category: "Medication Management",
    forms: [
      { name: "Locked Boxes for Take-Outs Policy/Agreement Certification", required: true, completion: 84 },
      { name: "Medication Destruction", required: true, completion: 78 },
    ],
  },
  {
    category: "Privacy & Information",
    forms: [
      { name: "Release of Information", required: false, completion: 65 },
      { name: "Confidentiality, HIPAA, and Privacy Practice Notice", required: true, completion: 96 },
    ],
  },
  {
    category: "Media Release",
    forms: [
      { name: "Video Testimonial Release Form", required: false, completion: 45 },
      { name: "Consent for Camera Surveillance & Therapeutic Photograph", required: true, completion: 82 },
    ],
  },
  {
    category: "Assessment",
    forms: [
      { name: "Pre-Admission Assessment", required: true, completion: 94 },
      { name: "Universal Infection Control and HIV Assessment", required: true, completion: 86 },
    ],
  },
  {
    category: "Patient Rights",
    forms: [{ name: "Client Grievance and Complaint Process", required: true, completion: 88 }],
  },
  {
    category: "Telemedicine",
    forms: [{ name: "Informed Consent for Telemedicine Services", required: false, completion: 72 }],
  },
]

export function ConsentFormsOverview() {
  const totalForms = consentFormCategories.reduce((acc, cat) => acc + cat.forms.length, 0)
  const requiredForms = consentFormCategories.reduce(
    (acc, cat) => acc + cat.forms.filter((form) => form.required).length,
    0,
  )
  const averageCompletion = Math.round(
    consentFormCategories.reduce((acc, cat) => acc + cat.forms.reduce((sum, form) => sum + form.completion, 0), 0) /
      totalForms,
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCompletion}%</div>
            <Progress value={averageCompletion} className="mt-2" />
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
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">Requiring consent tracking</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {consentFormCategories.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="text-lg">{category.category}</CardTitle>
              <CardDescription>
                {category.forms.length} form{category.forms.length !== 1 ? "s" : ""} in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.forms.map((form) => (
                  <div key={form.name} className="flex items-center justify-between p-3 border rounded-lg">
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
