import { createServiceClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/navigation/counts
 * Fetches all navigation item counts for the sidebar
 * Returns counts for all menu items that need dynamic data
 */
export async function GET() {
  try {
    const supabase = createServiceClient()

    // Helper function to safely get count
    const getCount = async (query: Promise<any>, defaultValue = 0): Promise<number> => {
      try {
        const { count, error } = await query
        if (error) {
          console.error(`[Navigation Counts] Query error:`, error)
          return defaultValue
        }
        return count || defaultValue
      } catch (e) {
        console.error(`[Navigation Counts] Exception:`, e)
        return defaultValue
      }
    }

    // Fetch all counts in parallel for better performance
    const [
      totalPatients,
      checkInQueue,
      waitingList,
      intakeQueue,
      patientIntake,
      pregnantWomen,
      careTeams,
      propertyTracking,
      transportation,
      awolRunaway,
      nursingAssessment,
      counselingIntake,
      bioPsychoSocial,
      treatmentPlanning,
      caseManagement,
      peerRecovery,
      physicianDashboard,
      encounters,
      telehealth,
      assessmentLibrary,
      consentForms,
      dischargeSummary,
      clinicalProtocols,
      clinicalAlerts,
      aiCoaching,
      medicationList,
      prescriptions,
      ePrescribing,
      dosingWindow,
      orderManagement,
      guestDosing,
      methadoneDispensing,
      takeHomeMgmt,
      takeHomeBottles,
      diversionControl,
      deaForm222,
      labIntegration,
      toxicologyLab,
      vaccinations,
      dmeManagement,
      rehabilitation,
      countyHealth,
      bedOccupancy,
      insuranceMgmt,
      insuranceVerification,
      clearinghouse,
      priorAuth,
      npiVerification,
      messages,
      patientReminders,
      providerCollaboration,
      hieNetwork,
      researchDashboard,
      regulatoryPortal,
      maseAccess,
      outreachDashboard,
      outreachEvents,
      staffManagement,
      hrManagement,
      staffWorkflows,
      facilityMgmt,
      regulatoryPortal2,
      diversionControl2,
      countyPihpPortal,
      communityCollaboration,
      callbackPolicies,
      notifications,
    ] = await Promise.all([
      // Overview
      getCount(supabase.from("patients").select("*", { count: "exact", head: true })),
      getCount(
        supabase
          .from("patient_check_ins")
          .select("*", { count: "exact", head: true })
          .in("status", ["waiting", "called"])
      ),
      getCount(
        supabase
          .from("waiting_list")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      // Patients
      getCount(
        supabase
          .from("otp_admissions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending_orientation")
      ),
      getCount(
        supabase
          .from("otp_admissions")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending_orientation", "active"])
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ),
      // Pregnant women - check multiple possible fields
      (async () => {
        try {
          // Try different possible field names
          const { count: count1 } = await supabase
            .from("patients")
            .select("*", { count: "exact", head: true })
            .eq("pregnancy_status", "pregnant")
          if (count1) return count1
          
          const { count: count2 } = await supabase
            .from("patients")
            .select("*", { count: "exact", head: true })
            .eq("is_pregnant", true)
          if (count2) return count2
          
          // Fallback: check intake progress for pregnancy test positive
          const { data: intakeData } = await supabase
            .from("patient_intake_progress")
            .select("patient_id")
            .eq("pregnancy_test_positive", true)
          return intakeData?.length || 0
        } catch {
          return 0
        }
      })(),
      getCount(
        supabase
          .from("care_teams")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)
      ),
      getCount(
        supabase
          .from("patient_property")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("transportation_requests")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending", "scheduled"])
      ),
      getCount(
        supabase
          .from("awol_tracking")
          .select("*", { count: "exact", head: true })
          .in("status", ["awol", "runaway"])
      ),
      // Clinical
      getCount(
        supabase
          .from("nursing_assessments")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("counseling_intakes")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("bio_psycho_social")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("treatment_plans")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("case_management")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("peer_recovery")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("physician_dashboard")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending_review")
      ),
      getCount(
        supabase
          .from("encounters")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("telehealth_sessions")
          .select("*", { count: "exact", head: true })
          .in("status", ["scheduled", "in_progress"])
      ),
      getCount(supabase.from("assessment_library").select("*", { count: "exact", head: true })),
      getCount(
        supabase
          .from("consent_forms")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("discharge_summaries")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(supabase.from("clinical_protocols").select("*", { count: "exact", head: true })),
      getCount(
        supabase
          .from("clinical_alerts")
          .select("*", { count: "exact", head: true })
          .eq("is_resolved", false)
      ),
      getCount(
        supabase
          .from("ai_coaching_sessions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      // Medications
      getCount(supabase.from("medications").select("*", { count: "exact", head: true })),
      getCount(
        supabase
          .from("prescriptions")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending", "active"])
      ),
      getCount(
        supabase
          .from("e_prescriptions")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending", "sent"])
      ),
      getCount(
        supabase
          .from("dosing_window")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("medication_orders")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending", "approved"])
      ),
      getCount(
        supabase
          .from("guest_dosing")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("methadone_dispensing")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("take_home_management")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("take_home_bottles")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("diversion_control")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending_review")
      ),
      getCount(
        supabase
          .from("dea_form_222")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      // Lab & Diagnostics
      getCount(
        supabase
          .from("lab_integration")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("toxicology_orders")
          .select("*", { count: "exact", head: true })
          .in("status", ["collected", "in-lab"])
      ),
      getCount(
        supabase
          .from("vaccinations")
          .select("*", { count: "exact", head: true })
          .eq("status", "scheduled")
      ),
      // Ancillary Services
      getCount(
        supabase
          .from("dme_management")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("rehabilitation")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("county_health")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("bed_occupancy")
          .select("*", { count: "exact", head: true })
          .eq("status", "occupied")
      ),
      // Billing & Insurance
      getCount(
        supabase
          .from("insurance")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("insurance_verification")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("clearinghouse")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("prior_authorization")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending", "submitted"])
      ),
      getCount(
        supabase
          .from("npi_verification")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      // Communications
      getCount(
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false)
      ),
      getCount(
        supabase
          .from("patient_reminders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("provider_collaboration")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("hie_network")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      // Reports & Analytics
      getCount(
        supabase
          .from("research_dashboard")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("regulatory_portal")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      // Community Outreach
      getCount(
        supabase
          .from("mase_access")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("outreach_dashboard")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("outreach_events")
          .select("*", { count: "exact", head: true })
          .eq("status", "upcoming")
      ),
      // Administration
      getCount(supabase.from("staff").select("*", { count: "exact", head: true })),
      getCount(
        supabase
          .from("hr_management")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("staff_workflows")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("facility_management")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("regulatory_portal")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("diversion_control")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending_review")
      ),
      getCount(
        supabase
          .from("county_pihp_portal")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("community_collaboration")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
      ),
      getCount(
        supabase
          .from("callback_policies")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      getCount(
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false)
      ),
    ])

      // Return all counts mapped to their navigation keys
    // Use both href paths and simplified keys for flexibility
    return NextResponse.json({
      // Overview
      "check-in": checkInQueue,
      "/check-in": checkInQueue,
      "waiting-list": waitingList,
      "/waiting-list": waitingList,
      "my-work": 0, // This would need user-specific logic
      "/my-work": 0,
      "notifications": notifications,
      "/notifications": notifications,
      // Patients
      "all-patients": totalPatients,
      "patients": totalPatients,
      "/patients": totalPatients,
      "intake-queue": intakeQueue,
      "/intake-queue": intakeQueue,
      "patient-intake": patientIntake,
      "intake": patientIntake,
      "/intake": patientIntake,
      "pregnant-women": pregnantWomen,
      "/pregnant-women": pregnantWomen,
      "care-teams": careTeams,
      "/care-teams": careTeams,
      "patient-property": propertyTracking,
      "/patient-property": propertyTracking,
      "transportation-requests": transportation,
      "/transportation-requests": transportation,
      "awol-tracking": awolRunaway,
      "/awol-tracking": awolRunaway,
      // Clinical
      "nursing-assessment": nursingAssessment,
      "/nursing-assessment": nursingAssessment,
      "counseling-intake": counselingIntake,
      "/counseling-intake": counselingIntake,
      "bio-psycho-social": bioPsychoSocial,
      "/bio-psycho-social": bioPsychoSocial,
      "treatment-planning": treatmentPlanning,
      "/treatment-planning": treatmentPlanning,
      "case-management": caseManagement,
      "/case-management": caseManagement,
      "peer-recovery": peerRecovery,
      "/peer-recovery": peerRecovery,
      "doctor-system": physicianDashboard,
      "/doctor-system": physicianDashboard,
      "encounters": encounters,
      "/encounters": encounters,
      "telehealth": telehealth,
      "/telehealth": telehealth,
      "assessment-library": assessmentLibrary,
      "/assessment-library": assessmentLibrary,
      "consent-forms": consentForms,
      "/consent-forms": consentForms,
      "discharge-summary": dischargeSummary,
      "/discharge-summary": dischargeSummary,
      "clinical-protocols": clinicalProtocols,
      "/clinical-protocols": clinicalProtocols,
      "clinical-alerts": clinicalAlerts,
      "/clinical-alerts": clinicalAlerts,
      "ai-coaching": aiCoaching,
      "/ai-coaching": aiCoaching,
      // Medications
      "medications": medicationList,
      "/medications": medicationList,
      "prescriptions": prescriptions,
      "/prescriptions": prescriptions,
      "e-prescribing": ePrescribing,
      "/e-prescribing": ePrescribing,
      "dosing-window": dosingWindow,
      "/dosing-window": dosingWindow,
      "order-management": orderManagement,
      "/order-management": orderManagement,
      "guest-dosing": guestDosing,
      "/guest-dosing": guestDosing,
      "dispensing": methadoneDispensing,
      "/dispensing": methadoneDispensing,
      "takehome": takeHomeMgmt,
      "/takehome": takeHomeMgmt,
      "dispensing/takehome-bottles": takeHomeBottles,
      "/dispensing/takehome-bottles": takeHomeBottles,
      "takehome-diversion": diversionControl,
      "/takehome-diversion": diversionControl,
      "form-222": deaForm222,
      "/form-222": deaForm222,
      // Lab & Diagnostics
      "lab-integration": labIntegration,
      "toxicology": toxicologyLab,
      "vaccinations": vaccinations,
      // Ancillary Services
      "dme-management": dmeManagement,
      "rehabilitation": rehabilitation,
      "county-health": countyHealth,
      "occupancy": bedOccupancy,
      // Billing & Insurance
      "insurance": insuranceMgmt,
      "insurance-verification": insuranceVerification,
      "clearinghouse": clearinghouse,
      "prior-auth": priorAuth,
      "npi-verification": npiVerification,
      // Communications
      "communications": messages,
      "patient-reminders": patientReminders,
      "provider-collaboration": providerCollaboration,
      "hie-network": hieNetwork,
      // Reports & Analytics
      "research-dashboard": researchDashboard,
      "regulatory/dashboard": regulatoryPortal,
      // Community Outreach
      "mase-access": maseAccess,
      "outreach": outreachDashboard,
      "outreach-events": outreachEvents,
      // Administration
      "staff": staffManagement,
      "hr-management": hrManagement,
      "workflows": staffWorkflows,
      "facility": facilityMgmt,
      "regulatory-portal": regulatoryPortal2,
      "diversion-control": diversionControl2,
      "county-pihp-portal": countyPihpPortal,
      "collaboration": communityCollaboration,
      "callback-policies": callbackPolicies,
    })
  } catch (error) {
    console.error("[Navigation Counts] Error fetching counts:", error)
    // Return empty counts on error to prevent breaking the UI
    return NextResponse.json({}, { status: 200 })
  }
}

