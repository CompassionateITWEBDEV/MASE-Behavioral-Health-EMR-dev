"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CreatePortalAccountFormProps {
  patientId: string;
  patientEmail: string;
  patientName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreatePortalAccountForm({
  patientId,
  patientEmail,
  patientName,
  onSuccess,
  onCancel,
}: CreatePortalAccountFormProps) {
  const [email, setEmail] = useState(patientEmail || "");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/patient-portal/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: patientId,
          email: email.trim(),
          send_invitation: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create portal account");
      }

      setTempPassword(data.temporary_password);
      setCreated(true);
      toast.success("Portal account created successfully!");
    } catch (error: any) {
      console.error("Error creating portal account:", error);
      toast.error(error.message || "Failed to create portal account");
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    toast.success("Password copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (created) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-900">
              Portal Account Created Successfully!
            </h3>
          </div>
          <p className="text-sm text-green-700 mb-4">
            The portal account has been created for {patientName}. Please share
            the temporary password with the patient securely.
          </p>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email:</Label>
            <p className="text-sm font-mono bg-white p-2 rounded border">
              {email}
            </p>
            
            <Label className="text-sm font-medium">Temporary Password:</Label>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono bg-white p-2 rounded border flex-1">
                {tempPassword}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyPassword}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            Next Steps:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Share the email and temporary password with the patient</li>
            <li>Patient should log in at /auth/patient-login</li>
            <li>Patient will be prompted to change password on first login</li>
            <li>An invitation email will be sent (if email service is configured)</li>
          </ul>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onSuccess} className="w-full">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="patient@example.com"
          required
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          This email will be used for portal login. A temporary password will be
          generated automatically.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
    </form>
  );
}
