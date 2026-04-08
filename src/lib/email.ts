import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.FROM_EMAIL || 'echo11 <onboarding@echo11.com>'
const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3000/portal'

interface InvitationEmailParams {
  to: string
  contactName: string
  companyName: string
  projectName?: string
  token?: string
}

export async function sendClientInvitation({
  to,
  contactName,
  companyName,
  projectName,
  token
}: InvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.log('📧 [DEV MODE] Client invitation email would be sent to:', to)
    console.log('📧 [DEV MODE] Contact:', contactName)
    console.log('📧 [DEV MODE] Company:', companyName)
    console.log('📧 [DEV MODE] Project:', projectName)
    return { success: true }
  }

  try {
    const loginLink = token 
      ? `${PORTAL_URL}/auth/verify?token=${token}&email=${encodeURIComponent(to)}`
      : PORTAL_URL

    const projectsText = projectName ? 's' : ''

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: to,
      subject: `You have been invited to view your project${projectName ? `: ${projectName}` : ''}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: system-ui, sans-serif; background-color: #0f0f0f; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">echo11</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.8);">Digital Agency</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: #ffffff;">
                You have been invited!
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                Hi ${contactName || 'there'},
              </p>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                <strong style="color: #ffffff;">${companyName}</strong> has invited you to view your project${projectName ? ` <strong>${projectName}</strong>` : ''} through our client portal.
              </p>
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                You can now track project progress, view milestones, tasks, and invoices all in one place.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${loginLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      View Your Project${projectsText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.5);">
                If the button does not work, copy and paste this link into your browser:<br>
                <span style="color: #6366f1; word-break: break-all;">${loginLink}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #141414; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                &copy; ${new Date().getFullYear()} echo11 Digital Agency. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('Invitation email sent:', data?.id)
    return { success: true }
  } catch (error) {
    console.error('Failed to send invitation email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

interface WelcomeEmailParams {
  to: string
  name: string
  projectName?: string
}

export async function sendWelcomeEmail({
  to,
  name,
  projectName
}: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.log('📧 [DEV MODE] Welcome email would be sent to:', to)
    return { success: true }
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: to,
      subject: `Welcome to echo11${projectName ? ` - ${projectName}` : ''}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: system-ui, sans-serif; background-color: #0f0f0f; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">echo11</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.8);">Digital Agency</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: #ffffff;">
                Welcome, ${name}!
              </h2>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                Thank you for working with echo11. We are excited to help bring your vision to life!
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #141414; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                &copy; ${new Date().getFullYear()} echo11 Digital Agency. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to send email' }
  }
}

interface SendContractEmailParams {
  to: string
  clientName: string
  companyName: string
  contractTitle: string
  contractValue?: number | null
  contractUrl: string
}

export async function sendContractEmail({
  to,
  clientName,
  companyName,
  contractTitle,
  contractValue,
  contractUrl
}: SendContractEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.log('📧 [DEV MODE] Contract email would be sent to:', to)
    console.log('📧 Contract:', contractTitle, '| Value:', contractValue)
    console.log('📧 URL:', contractUrl)
    return { success: true }
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: FROM_EMAIL,
      to: to,
      subject: `Contract for Review: ${contractTitle}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: system-ui, sans-serif; background-color: #0f0f0f; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 0; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 40px; text-align: center; border-bottom: 2px solid #00E5FF;">
              <h1 style="margin: 0; font-size: 28px; color: #00E5FF; font-weight: 700;">echo11</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #a1a1a1;">Contract for Review</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; color: #fcfcfc;">Hello ${clientName},</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #a1a1a1; line-height: 1.6;">
                ${companyName} has sent you a contract for review. Please find the details below:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border: 1px solid #222222; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #00E5FF; text-transform: uppercase; letter-spacing: 1px;">Contract</p>
                    <p style="margin: 0 0 16px; font-size: 18px; color: #fcfcfc; font-weight: 600;">${contractTitle}</p>
                    ${contractValue ? `<p style="margin: 0; font-size: 14px; color: #a1a1a1;">Value: <span style="color: #fcfcfc; font-weight: 600;">$${contractValue.toLocaleString()}</span></p>` : ''}
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <a href="${contractUrl}" style="display: inline-block; padding: 14px 32px; background-color: #00E5FF; color: #0a0a0a; text-decoration: none; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      View Contract
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; font-size: 12px; color: #666; text-align: center;">
                If you have any questions, please contact ${companyName} directly.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a0a0a; padding: 24px; text-align: center; border-top: 1px solid #222222;">
              <p style="margin: 0; font-size: 12px; color: #666;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to send email' }
  }
}

interface TeamInvitationParams {
  to: string
  role: string
  inviteId: string
  invitedByEmail: string
}

export async function sendTeamInvitation({
  to,
  role,
  inviteId,
  invitedByEmail
}: TeamInvitationParams): Promise<{ success: boolean; error?: string }> {
  const LAB_URL = process.env.NEXT_PUBLIC_LAB_URL || 'http://localhost:3000/lab'
  const signupLink = `${LAB_URL}/auth/team-signup?invite=${inviteId}`

  if (!resend) {
    console.log('📧 [DEV MODE] Team invite email would be sent to:', to)
    console.log('📧 [DEV MODE] Role:', role)
    console.log('📧 [DEV MODE] Link:', signupLink)
    return { success: true }
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `You've been invited to join echo11!`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: system-ui, sans-serif; background-color: #0f0f0f; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 0; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 40px; text-align: center; border-bottom: 2px solid #00E5FF;">
              <h1 style="margin: 0; font-size: 28px; color: #00E5FF; font-weight: 700;">echo11</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #a1a1a1;">Team Invitation</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; color: #fcfcfc;">Hello,</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #a1a1a1; line-height: 1.6;">
                You have been invited by <strong>${invitedByEmail}</strong> to join the echo11 platform as a <strong>${role}</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border: 1px solid #222222; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #00E5FF; text-transform: uppercase; letter-spacing: 1px;">Join Our Mission</p>
                    <p style="margin: 0 0 16px; font-size: 14px; color: #fcfcfc;">Set up your profile to review projects and connect with the team.</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <a href="${signupLink}" style="display: inline-block; padding: 14px 32px; background-color: #00E5FF; color: #0a0a0a; text-decoration: none; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.5);">
                If the button does not work, copy and paste this link into your browser:<br>
                <span style="color: #00E5FF; word-break: break-all;">${signupLink}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a0a0a; padding: 24px; text-align: center; border-top: 1px solid #222222;">
              <p style="margin: 0; font-size: 12px; color: #666;">&copy; ${new Date().getFullYear()} echo11. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send team invitation email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
