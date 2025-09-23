"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, FileCheck, CreditCard, Pill, Package } from "lucide-react"
import { InsuranceEligibility } from "./insurance-eligibility"
import { PriorAuthorization } from "./prior-authorization"

export function BillingDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Insurance Management</h1>
        <p className="text-muted-foreground">
          Comprehensive billing, insurance verification, and OTP bundle management
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$127,450</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OTP Bundle Claims</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">89%</span> bundle vs APG ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prior Auths</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">3 pending</span> review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="otp-billing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="otp-billing" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            OTP Billing
          </TabsTrigger>
          <TabsTrigger value="eligibility" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Insurance Eligibility
          </TabsTrigger>
          <TabsTrigger value="prior-auth" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Prior Authorization
          </TabsTrigger>
          <TabsTrigger value="pmp" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            PMP Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="otp-billing">
          <div className="space-y-6">
            {/* OTP Bundle vs APG Decision Engine */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  OTP Bundle Billing Engine
                </CardTitle>
                <CardDescription>OASAS-compliant bundle vs APG billing decision support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">This Week's Billing Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Full Bundle Claims:</span>
                        <Badge variant="default">47</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Take-Home Bundle Claims:</span>
                        <Badge variant="secondary">23</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">APG Claims:</span>
                        <Badge variant="outline">12</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Dual Eligible Claims:</span>
                        <Badge variant="destructive">8</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Rate Code Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>7969/7973 (Methadone Full):</span>
                          <span className="font-medium">32</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>7971/7975 (Buprenorphine Full):</span>
                          <span className="font-medium">15</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>7970/7974 (Methadone Take-Home):</span>
                          <span className="font-medium">18</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>7972/7976 (Buprenorphine Take-Home):</span>
                          <span className="font-medium">5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-2">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Package className="mr-2 h-4 w-4" />
                    Process Weekly Claims
                  </Button>
                  <Button variant="outline">Bundle vs APG Calculator</Button>
                  <Button variant="outline">Dual Eligible Workflow</Button>
                </div>
              </CardContent>
            </Card>

            {/* Qualifying Services Tracker */}
            <Card>
              <CardHeader>
                <CardTitle>Qualifying Services for Bundle Billing</CardTitle>
                <CardDescription>Track services that qualify for OTP bundle reimbursement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-600">Bundle Qualifying Services</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Individual Counseling</li>
                      <li>• Group Counseling</li>
                      <li>• Medication Administration/Observation</li>
                      <li>• Medication Management</li>
                      <li>• Brief Treatment</li>
                      <li>• Presumptive Toxicology Testing</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-600">APG Required Services</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Admission Assessment</li>
                      <li>• Periodic Assessments</li>
                      <li>• Psychiatric Evaluation</li>
                      <li>• Peer Services</li>
                      <li>• Smoking Cessation</li>
                      <li>• Unrelated Medical Visits</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-purple-600">Special Billing Rules</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Guest Dosing: APG Only</li>
                      <li>• Fentanyl Confirmatory (80354): Direct Lab Billing</li>
                      <li>• FQHC: Cannot bill 1671 + Bundle same week</li>
                      <li>• CCBHC: Med Admin carved out of 1147</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Claims Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent OTP Claims Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Patient: Sarah M. - Week 01/06/25</p>
                      <p className="text-sm text-muted-foreground">
                        Methadone Admin + Individual Counseling → Rate Code 7969 (G2067)
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Full Bundle</Badge>
                      <p className="text-sm text-muted-foreground">$247.50</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Patient: Michael R. - Week 01/06/25</p>
                      <p className="text-sm text-muted-foreground">Take-Home Supply Only → Rate Code 7970 (G2078)</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">Take-Home</Badge>
                      <p className="text-sm text-muted-foreground">$89.25</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Patient: Jennifer K. - Week 01/06/25 (Dual Eligible)</p>
                      <p className="text-sm text-muted-foreground">
                        Buprenorphine + Psychiatric Eval → Bundle + APG Crossover
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">Dual Eligible</Badge>
                      <p className="text-sm text-muted-foreground">Medicare → Medicaid</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eligibility">
          <InsuranceEligibility />
        </TabsContent>

        <TabsContent value="prior-auth">
          <PriorAuthorization />
        </TabsContent>

        <TabsContent value="pmp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Michigan PMP Aware Integration
              </CardTitle>
              <CardDescription>
                Direct integration with michigan.pmpaware.net for prescription monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Connected to Michigan MAPS</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Last sync: 2 minutes ago</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>PMP Checks:</span>
                        <span className="font-medium">47</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>High Risk Alerts:</span>
                        <Badge variant="destructive" className="text-xs">
                          3
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>New Prescriptions:</span>
                        <span className="font-medium">12</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent High-Risk Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Patient: John D.</p>
                        <p className="text-sm text-muted-foreground">
                          Multiple opioid prescriptions from different providers
                        </p>
                      </div>
                      <Badge variant="destructive">High Risk</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Patient: Maria S.</p>
                        <p className="text-sm text-muted-foreground">Benzodiazepine + opioid combination detected</p>
                      </div>
                      <Badge variant="destructive">High Risk</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Patient: Robert K.</p>
                        <p className="text-sm text-muted-foreground">Early refill pattern detected</p>
                      </div>
                      <Badge variant="secondary">Medium Risk</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button className="bg-primary hover:bg-primary/90">
                  <Pill className="mr-2 h-4 w-4" />
                  Run Batch PMP Check
                </Button>
                <Button variant="outline">View Full PMP Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
