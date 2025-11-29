"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Syringe, Plus, AlertCircle, CheckCircle, Calendar, TrendingUp } from "lucide-react"

export default function VaccinationsPage() {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Vaccination Management</h1>
              <p className="text-muted-foreground">Patient immunization records and vaccine inventory tracking</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Vaccination
            </Button>
          </div>

          <Tabs defaultValue="records" className="space-y-4">
            <TabsList>
              <TabsTrigger value="records">Patient Records</TabsTrigger>
              <TabsTrigger value="inventory">Vaccine Inventory</TabsTrigger>
              <TabsTrigger value="registry">Registry Reporting</TabsTrigger>
              <TabsTrigger value="schedules">Vaccination Schedules</TabsTrigger>
            </TabsList>

            <TabsContent value="records" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Vaccinations Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">47</div>
                    <p className="text-xs text-muted-foreground">+12 from yesterday</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Due This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">134</div>
                    <p className="text-xs text-yellow-600">23 overdue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Registry Sync Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">99.2%</div>
                    <p className="text-xs text-green-600">Successfully synced</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Vaccinations</CardTitle>
                  <CardDescription>Latest immunizations administered</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        patient: "John Smith",
                        vaccine: "COVID-19 (Moderna)",
                        date: "Today, 10:30 AM",
                        status: "synced",
                      },
                      {
                        patient: "Emily Johnson",
                        vaccine: "Influenza (Quadrivalent)",
                        date: "Today, 9:15 AM",
                        status: "synced",
                      },
                      {
                        patient: "Michael Brown",
                        vaccine: "Tdap (Boostrix)",
                        date: "Yesterday, 2:45 PM",
                        status: "synced",
                      },
                      {
                        patient: "Sarah Davis",
                        vaccine: "HPV (Gardasil 9) - Dose 1",
                        date: "Yesterday, 11:00 AM",
                        status: "pending",
                      },
                    ].map((record, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Syringe className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{record.patient}</p>
                            <p className="text-sm text-muted-foreground">{record.vaccine}</p>
                            <p className="text-xs text-muted-foreground">{record.date}</p>
                          </div>
                        </div>
                        <Badge variant={record.status === "synced" ? "default" : "secondary"}>
                          {record.status === "synced" ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Registry Synced
                            </>
                          ) : (
                            <>
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Pending Sync
                            </>
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vaccine Inventory</CardTitle>
                  <CardDescription>Current stock levels and expiration tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { vaccine: "COVID-19 (Moderna)", lot: "LOT-2025-A", quantity: 42, expires: "Aug 2025" },
                      { vaccine: "Influenza (Quadrivalent)", lot: "LOT-2025-B", quantity: 87, expires: "Jun 2025" },
                      { vaccine: "Tdap (Boostrix)", lot: "LOT-2025-C", quantity: 15, expires: "Dec 2025" },
                      { vaccine: "HPV (Gardasil 9)", lot: "LOT-2025-D", quantity: 8, expires: "Apr 2025", alert: true },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-4 border rounded-lg ${item.alert ? "border-yellow-300 bg-yellow-50" : ""}`}
                      >
                        <div>
                          <p className="font-medium">{item.vaccine}</p>
                          <p className="text-sm text-muted-foreground">Lot: {item.lot}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.quantity} doses</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Exp: {item.expires}
                          </p>
                          {item.alert && (
                            <Badge variant="outline" className="mt-1 border-yellow-600 text-yellow-700">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="registry" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>State Immunization Registry</CardTitle>
                  <CardDescription>Automated reporting to state registries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Registry Connection Active</p>
                          <p className="text-sm text-green-700">
                            Connected to State Immunization Registry. All vaccinations are automatically reported.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Submissions (MTD)</p>
                              <p className="text-2xl font-bold">847</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Success Rate</p>
                              <p className="text-2xl font-bold">99.2%</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>ACIP Vaccination Schedules</CardTitle>
                  <CardDescription>CDC recommended immunization schedules by age group</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { group: "Infants (0-12 months)", vaccines: "Hepatitis B, DTaP, Hib, PCV, IPV, Rotavirus" },
                      { group: "Children (1-6 years)", vaccines: "MMR, Varicella, Hepatitis A, Influenza" },
                      { group: "Adolescents (7-18 years)", vaccines: "Tdap, HPV, Meningococcal, Influenza" },
                      { group: "Adults (19-64 years)", vaccines: "Influenza, Td/Tdap, COVID-19, Shingles" },
                      { group: "Elderly (65+ years)", vaccines: "Influenza, Pneumococcal, Shingles, COVID-19" },
                    ].map((schedule, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <p className="font-medium">{schedule.group}</p>
                        <p className="text-sm text-muted-foreground mt-1">{schedule.vaccines}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
