import { Twilio } from "twilio"

// Initialize Twilio client
// Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER env vars
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
  to: string
  message: string
  sentAt: string
}

export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  const sentAt = new Date().toISOString()

  // Clean phone number - remove non-digits except leading +
  const cleanPhone = to.startsWith("+") ? "+" + to.slice(1).replace(/\D/g, "") : "+1" + to.replace(/\D/g, "") // Default to US country code

  if (!twilioClient) {
    console.log("[SMS] Twilio not configured - would send to:", cleanPhone, "message:", message)
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      to: cleanPhone,
      message,
      sentAt,
    }
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      to: cleanPhone,
      from: process.env.TWILIO_PHONE_NUMBER,
    })

    return {
      success: true,
      messageId: result.sid,
      to: cleanPhone,
      message,
      sentAt,
    }
  } catch (error: any) {
    console.error("[SMS] Failed to send:", error.message)
    return {
      success: false,
      error: error.message,
      to: cleanPhone,
      message,
      sentAt,
    }
  }
}

export async function sendBulkSMS(recipients: Array<{ phone: string; message: string }>): Promise<SMSResult[]> {
  const results = await Promise.all(recipients.map(({ phone, message }) => sendSMS(phone, message)))
  return results
}

// Template-based SMS
export function formatReminderMessage(template: string, variables: Record<string, string>): string {
  let message = template
  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`\\{${key}\\}`, "g"), value)
  }
  return message
}
