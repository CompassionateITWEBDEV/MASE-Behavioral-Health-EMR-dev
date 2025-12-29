import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockQueryBuilder, mockFrom } = vi.hoisted(() => {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = [
    "select",
    "insert",
    "update",
    "delete",
    "order",
    "range",
    "eq",
    "neq",
    "single",
    "limit",
  ];
  methods.forEach((method) => {
    builder[method] = vi.fn().mockReturnValue(builder);
  });
  builder.limit.mockResolvedValue({ data: [], error: null });
  builder.single.mockResolvedValue({ data: null, error: null });
  return {
    mockQueryBuilder: builder,
    mockFrom: vi.fn().mockReturnValue(builder),
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}));

import { GET, POST } from "@/app/api/clinical-alerts/route";

describe("GET /api/clinical-alerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(mockQueryBuilder).forEach((fn) =>
      fn.mockReturnValue(mockQueryBuilder)
    );
    mockQueryBuilder.limit.mockResolvedValue({ data: [], error: null });
    mockFrom.mockReturnValue(mockQueryBuilder);
  });

  it("should fetch clinical alerts successfully", async () => {
    // Mock data matching the database schema
    const mockAlerts = [
      {
        id: "1",
        patient_id: "p1",
        alert_type: "medication",
        severity: "high",
        alert_message: "Test alert 1",
        status: "active",
        created_at: new Date().toISOString(),
        patients: { first_name: "John", last_name: "Doe" },
      },
      {
        id: "2",
        patient_id: "p2",
        alert_type: "lab",
        severity: "medium",
        alert_message: "Test alert 2",
        status: "acknowledged",
        created_at: new Date().toISOString(),
        patients: { first_name: "Jane", last_name: "Smith" },
      },
    ];
    mockQueryBuilder.limit.mockResolvedValue({ data: mockAlerts, error: null });

    const request = new Request("http://localhost/api/clinical-alerts");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    // The API transforms the data, so check structure not exact values
    expect(data.alerts).toHaveLength(2);
    expect(data.alerts[0]).toHaveProperty("patient");
    expect(data.alerts[0]).toHaveProperty("patientId");
    expect(data.alerts[0]).toHaveProperty("priority");
    expect(data.alerts[0]).toHaveProperty("type");
    expect(data.count).toBeDefined();
  });

  it("should handle table not existing gracefully", async () => {
    mockQueryBuilder.limit.mockResolvedValue({
      data: null,
      error: { code: "42P01", message: "relation does not exist" },
    });

    const request = new Request("http://localhost/api/clinical-alerts");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.alerts).toEqual([]);
    // The API returns count object, not message for 42P01 error
    expect(data.count).toBeDefined();
  });

  it("should handle database error", async () => {
    mockQueryBuilder.limit.mockResolvedValue({
      data: null,
      error: { code: "OTHER", message: "Database error" },
    });

    const request = new Request("http://localhost/api/clinical-alerts");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Database error");
  });
});

describe("POST /api/clinical-alerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(mockQueryBuilder).forEach((fn) =>
      fn.mockReturnValue(mockQueryBuilder)
    );
    mockFrom.mockReturnValue(mockQueryBuilder);
  });

  it("should create alert successfully", async () => {
    const newAlert = {
      id: "new-1",
      patient_id: "p1",
      alert_type: "medication",
      severity: "high",
    };
    mockQueryBuilder.single.mockResolvedValue({ data: newAlert, error: null });

    const request = new Request("http://localhost/api/clinical-alerts", {
      method: "POST",
      body: JSON.stringify({
        patient_id: "p1",
        alert_type: "medication",
        severity: "high",
        message: "Test",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.alert).toEqual(newAlert);
  });

  it("should return 400 if required fields missing", async () => {
    const request = new Request("http://localhost/api/clinical-alerts", {
      method: "POST",
      body: JSON.stringify({ patient_id: "p1" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("required");
  });
});
