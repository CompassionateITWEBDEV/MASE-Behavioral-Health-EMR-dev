"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { PatientList } from "@/components/patient-list";
import { PatientStats } from "@/components/patient-stats";
import { AddPatientDialog } from "@/components/add-patient-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Filter, Plus, AlertTriangle, FileText } from "lucide-react";
import { usePatients } from "@/hooks/use-patients";
import { usePatientStats } from "@/hooks/use-patient-stats";
import { ErrorBoundary } from "@/components/error-boundary";
import { PatientErrorFallback } from "@/components/patient-error-fallback";
import type { PatientWithRelations } from "@/types/patient";
import type { PatientListResponse } from "@/types/api";

const DEFAULT_PROVIDER = {
  id: "00000000-0000-0000-0000-000000000001",
  first_name: "Demo",
  last_name: "Provider",
  email: "demo@example.com",
  role: "physician",
};

export default function PatientsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Use React Query hooks for data fetching
  const {
    data: patientsData,
    isLoading: patientsLoading,
    refetch: refetchPatients,
  } = usePatients({
    pagination: { page: currentPage, pageSize },
  });
  const { data: statsData, isLoading: statsLoading } = usePatientStats();

  const patients = patientsData?.patients || [];
  const stats = statsData?.stats || {
    total: 0,
    active: 0,
    highRisk: 0,
    recentAppointments: 0,
  };
  const loading = patientsLoading || statsLoading;
  // Access meta property - using type assertion as workaround for TypeScript language server cache
  // @ts-expect-error - meta property exists in PatientListResponse but TypeScript may not recognize it due to cache
  const pagination = patientsData?.meta;

  // Fetch provider info on mount
  useEffect(() => {
    const fetchProvider = async () => {
      const supabase = createClient();
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: providerData } = await supabase
            .from("providers")
            .select("*")
            .eq("id", user.id)
            .single();
          if (providerData) {
            setProvider(providerData);
          }
        }
      } catch (error) {
        console.log("[v0] Auth check failed, using default provider");
      }
    };
    fetchProvider();
  }, []);

  const handlePatientAdded = () => {
    refetchPatients();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="pl-64">
          <DashboardHeader />
          <main className="p-6">
            <div className="text-center py-12">Loading patients...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<PatientErrorFallback />}>
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="pl-64">
          <DashboardHeader />
          <main className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                  Patient Management
                </h1>
                <p className="text-muted-foreground">
                  Comprehensive patient database and records
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <AddPatientDialog
                  providerId={provider.id}
                  onSuccess={handlePatientAdded}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Patient
                  </Button>
                </AddPatientDialog>
              </div>
            </div>

            <PatientStats stats={stats} />

            <Tabs defaultValue="list" className="space-y-6">
              <TabsList>
                <TabsTrigger value="list">Patient List</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard View</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <PatientList
                  patients={patients}
                  currentProviderId={provider.id}
                  showFilters={showFilters}
                  pagination={pagination}
                  onPageChange={setCurrentPage}
                  isLoading={loading}
                />
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Total Patients
                          </p>
                          <p className="text-2xl font-bold text-card-foreground">
                            {stats.total}
                          </p>
                          <p className="text-xs text-green-600">
                            Active caseload
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Active Treatment
                          </p>
                          <p className="text-2xl font-bold text-card-foreground">
                            {stats.active}
                          </p>
                          <p className="text-xs text-green-600">
                            In active care
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            High Risk
                          </p>
                          <p className="text-2xl font-bold text-card-foreground">
                            {stats.highRisk}
                          </p>
                          <p className="text-xs text-red-600">
                            Require attention
                          </p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Recent Activity
                          </p>
                          <p className="text-2xl font-bold text-card-foreground">
                            {stats.recentAppointments}
                          </p>
                          <p className="text-xs text-blue-600">This week</p>
                        </div>
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
