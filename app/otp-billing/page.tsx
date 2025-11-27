"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Users, DollarSign, AlertTriangle, FileText, Clock } from "lucide-react"

export default function OTPBillingPage() {
  return (
    <div className="flex-1 space-y-6 p-6 ml-64">
      <div>
        <h1 className="text-3xl font-bold">OTP Bundle Billing Management</h1>
        <p className="text-muted-foreground">
          OASAS-compliant Opioid Treatment Program billing with bundle vs APG optimization
        </p>
      </div>

      {/* Weekly Billing Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{"This Week's Claims"}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">67 bundle</span> • <span className="text-blue-600">22 APG</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bundle Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$16,582</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.3%</span> vs APG equivalent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dual Eligibles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">3 pending</span> Medicare crossover
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">OASAS guidelines adherence</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current-week" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current-week">Current Week</TabsTrigger>
          <TabsTrigger value="dual-eligible">Dual Eligible</TabsTrigger>
          <TabsTrigger value="special-cases">Special Cases</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="current-week">
          <div className="space-y-6">
            {/* Current Week Claims */}
            <Card>
              <CardHeader>
                <CardTitle>Week of January 6-12, 2025 - Claims Status</CardTitle>
                <CardDescription>Bundle vs APG billing decisions for current service week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-green-600">Full Bundle Claims (47)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Methadone Full Bundle (7969/7973):</span>
                          <Badge variant="default">32</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Buprenorphine Full Bundle (7971/7975):</span>
                          <Badge variant="default">15</Badge>
                        </div>
                        <div className="text-sm font-medium">
                          Total Revenue: <span className="text-green-600">$11,632.50</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-600">Take-Home Bundle Claims (23)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Methadone Take-Home (7970/7974):</span>
                          <Badge variant="secondary">18</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Buprenorphine Take-Home (7972/7976):</span>
                          <Badge variant="secondary">5</Badge>
                        </div>
                        <div className="text-sm font-medium">
                          Total Revenue: <span className="text-blue-600">$2,033.75</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Claims Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">Patient: Thompson, Sarah M.</p>
                            <p className="text-sm text-muted-foreground">
                              Services: Methadone Admin + Individual Counseling + Group Counseling
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Rate Code: 7969 | Procedure: G2067 | COS: 0160
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="default">Full Bundle</Badge>
                            <p className="text-sm font-medium text-green-600">$247.50</p>
                            <p className="text-xs text-muted-foreground">Submitted</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">Patient: Rodriguez, Michael A.</p>
                            <p className="text-sm text-muted-foreground">
                              Services: Take-Home Supply Only (No Clinical Contact)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Rate Code: 7970 | Procedure: G2078 | COS: 0160
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">Take-Home</Badge>
                            <p className="text-sm font-medium text-blue-600">$89.25</p>
                            <p className="text-xs text-muted-foreground">Submitted</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">Patient: Johnson, Patricia L.</p>
                            <p className="text-sm text-muted-foreground">
                              Services: Buprenorphine Admin + Psychiatric Evaluation + Peer Services
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Bundle: 7971 (G2068) + APG for Psychiatric Eval & Peer Services
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">Bundle + APG</Badge>
                            <p className="text-sm font-medium text-purple-600">$326.25</p>
                            <p className="text-xs text-muted-foreground">Processing</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dual-eligible">
          <Card>
            <CardHeader>
              <CardTitle>Dual Eligible Medicare/Medicaid Workflow</CardTitle>
              <CardDescription>
                Special billing procedures for patients with both Medicare and Medicaid coverage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Dual Eligible Billing Requirements</h4>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                      <li>• Submit claim to Medicare first using G codes</li>
                      <li>• Crossover to Medicaid using bundle rate codes</li>
                      <li>• Submit separate APG claim for non-bundle services with zero-fill Medicare info</li>
                      <li>• Medicare Advantage plans require manual crossover</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Pending Dual Eligible Claims</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Patient: Williams, Robert K. (Medicare: 1234567890A)</p>
                      <p className="text-sm text-muted-foreground">
                        Medicare Claim: G2067 → Awaiting crossover to Medicaid 7969
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">Dual Eligible</Badge>
                      <p className="text-xs text-muted-foreground">Medicare Pending</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Patient: Davis, Jennifer M. (Medicare Advantage)</p>
                      <p className="text-sm text-muted-foreground">
                        Manual crossover required - Medicare Advantage Plan
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">Manual Crossover</Badge>
                      <p className="text-xs text-muted-foreground">Action Required</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-primary hover:bg-primary/90">Process Medicare Crossovers</Button>
                <Button variant="outline">View Dual Eligible Reports</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special-cases">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Special Billing Scenarios</CardTitle>
                <CardDescription>FQHC, CCBHC, Guest Dosing, and Skilled Nursing Facility billing rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">FQHC Billing Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ul className="text-sm space-y-1">
                        <li>• Cannot bill 1671 rate code + bundle same week</li>
                        <li>• Can choose weekly 1671 OR bundle billing</li>
                        <li>• APG opt-out FQHCs: Use 1671 or bundle (not both)</li>
                        <li>• Dual eligibles: Bill Medicare bundles first</li>
                      </ul>
                      <div className="mt-3">
                        <Badge variant="outline">3 FQHC patients this week</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">CCBHC Billing Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ul className="text-sm space-y-1">
                        <li>• Medication Admin carved out of 1147 rate</li>
                        <li>• Bill Med Admin via APGs</li>
                        <li>• Cannot submit CCBHC rate for qualifying bundle services</li>
                        <li>• Can bill CCBHC rate for non-qualifying services</li>
                      </ul>
                      <div className="mt-3">
                        <Badge variant="outline">1 CCBHC patient this week</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Guest Dosing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ul className="text-sm space-y-1">
                        <li>• Bundle billing NOT allowed for guest dosing</li>
                        <li>• Must use APG billing only</li>
                        <li>• Patient enrolled at different OTP</li>
                        <li>• Temporary service provision</li>
                      </ul>
                      <div className="mt-3">
                        <Badge variant="destructive">2 guest dosing patients</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skilled Nursing Facility</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ul className="text-sm space-y-1">
                        <li>• Nursing home rate = "payment in full"</li>
                        <li>• Cannot bill Medicare for SNF residents</li>
                        <li>• Exception: Medicaid nursing benefit exhausted</li>
                        <li>• Medicaid Advantage Plans must pay OTP services</li>
                      </ul>
                      <div className="mt-3">
                        <Badge variant="secondary">0 SNF patients this week</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>OTP Billing Reports & Analytics</CardTitle>
              <CardDescription>Comprehensive reporting for OASAS compliance and revenue optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <FileText className="h-6 w-6 mb-2" />
                  Weekly Bundle Report
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <DollarSign className="h-6 w-6 mb-2" />
                  Revenue Analysis
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Users className="h-6 w-6 mb-2" />
                  Dual Eligible Summary
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  Compliance Audit
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Clock className="h-6 w-6 mb-2" />
                  Claims Processing
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Package className="h-6 w-6 mb-2" />
                  Bundle vs APG Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
