function otpEmailTemplate({ name, otp }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Verify Your Email</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Segoe UI,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
    <table width="480" cellpadding="0" cellspacing="0" style="background:#12142a;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
      <tr><td style="padding:40px 32px 24px;text-align:center;">
        <h1 style="color:#8b5cf6;font-size:28px;margin:0;font-weight:900;letter-spacing:-1px;">LocalServe</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:8px;">India's Trusted Home Services</p>
      </td></tr>
      <tr><td style="padding:0 32px 32px;">
        <p style="color:#e2e8f0;font-size:16px;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">Your one-time password (OTP) for account verification is:</p>
        <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="color:#8b5cf6;font-size:36px;font-weight:900;letter-spacing:8px;margin:0;">${otp}</p>
          <p style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:8px;text-transform:uppercase;letter-spacing:1px;">Valid for 10 minutes</p>
        </div>
        <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">If you didn't request this, please ignore this email. Do not share this OTP with anyone.</p>
      </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
        <p style="color:#8b5cf6;font-size:14px;font-weight:700;margin:0 0 4px;">LocalServe</p>
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0 0 4px;">India's Trusted Home Services</p>
        <p style="color:rgba(255,255,255,0.2);font-size:10px;margin:0;">support@localserve.in | www.localserve.in</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

function bookingAcceptedTemplate({ userName, serviceCategory, bookingDate, bookingSlot, providerName, providerMobile, pricePerHour, customerAddress, customerMobile, paymentMode, paymentStatus }) {
  const dateStr = new Date(bookingDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const isPaid = paymentStatus === 'Paid';
  const statusColor = isPaid ? '#10b981' : '#f59e0b';
  const statusText = isPaid ? 'Paid' : 'Pending';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Booking Confirmed</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:40px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#12142a;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">
      <!-- Header -->
      <tr><td style="padding:36px 32px 20px;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:14px;"><tr>
          <td style="width:52px;height:52px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:14px;text-align:center;vertical-align:middle;font-size:24px;">✅</td>
        </tr></table>
        <h1 style="color:#10b981;font-size:26px;margin:0;font-weight:900;">Booking Confirmed!</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:8px 0 0;">Your service request has been accepted</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:0 32px 24px;">
        <p style="color:#e2e8f0;font-size:16px;margin:0 0 16px;">Hi <strong>${userName}</strong>,</p>
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">Great news! <strong style="color:#e2e8f0;">${providerName}</strong> has accepted your <strong style="color:#e2e8f0;">${serviceCategory}</strong> booking. Here are your appointment details:</p>

        <!-- Appointment Details -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;margin-bottom:14px;"><tr><td style="padding:18px;">
          <p style="color:#8b5cf6;font-size:11px;font-weight:900;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Appointment Details</p>

          <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Service</p>
          <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0 0 14px;">${serviceCategory}</p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;"><tr>
            <td width="50%" valign="top" style="padding-right:8px;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Date</p>
              <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0;">${dateStr}</p>
            </td>
            <td width="50%" valign="top" style="padding-left:8px;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Time Slot</p>
              <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0;">${bookingSlot || 'Not specified'}</p>
            </td>
          </tr></table>

          <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Your Address</p>
          <p style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0;line-height:1.5;">${customerAddress || 'Not provided'}</p>
        </td></tr></table>

        <!-- Provider Details -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;margin-bottom:14px;"><tr><td style="padding:18px;">
          <p style="color:#3b82f6;font-size:11px;font-weight:900;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Provider Details</p>

          <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Name</p>
          <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0 0 12px;">${providerName}</p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="50%" valign="top" style="padding-right:8px;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Contact</p>
              <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0;">${providerMobile || 'N/A'}</p>
            </td>
            <td width="50%" valign="top" style="padding-left:8px;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Rate</p>
              <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0;">₹${pricePerHour || '0'}/hr</p>
            </td>
          </tr></table>
        </td></tr></table>

        <!-- Payment Details -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;margin-bottom:18px;"><tr><td style="padding:18px;">
          <p style="color:#f59e0b;font-size:11px;font-weight:900;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Payment Details</p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="50%" valign="top" style="padding-right:8px;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Payment Mode</p>
              <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0;">${paymentMode || 'COD'}</p>
            </td>
            <td width="50%" valign="top" style="padding-left:8px;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Status</p>
              <p style="color:${statusColor};font-size:15px;font-weight:700;margin:0;">${statusText}</p>
            </td>
          </tr></table>
        </td></tr></table>

        <!-- Note -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(139,92,246,0.05);border:1px solid rgba(139,92,246,0.15);border-radius:12px;margin-bottom:18px;"><tr><td style="padding:14px 16px;">
          <p style="color:#8b5cf6;font-size:12px;font-weight:700;margin:0;line-height:1.5;">📍 Provider will arrive at your address during the selected time slot. Please keep your phone reachable at ${customerMobile || 'your registered number'}.</p>
        </td></tr></table>

        <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">You can track your booking status or contact the provider anytime from your dashboard.</p>
      </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
        <p style="color:#8b5cf6;font-size:14px;font-weight:700;margin:0 0 4px;">LocalServe</p>
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0 0 4px;">India's Trusted Home Services</p>
        <p style="color:rgba(255,255,255,0.2);font-size:10px;margin:0;">support@localserve.in | www.localserve.in</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

function providerReminderTemplate({ providerName, serviceCategory, bookingDate, bookingSlot, customerName, customerMobile, customerAddress }) {
  const dateStr = new Date(bookingDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Booking Reminder</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:40px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#12142a;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">
      <tr><td style="padding:36px 32px 20px;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:14px;"><tr>
          <td style="width:52px;height:52px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:14px;text-align:center;vertical-align:middle;font-size:24px;">🔔</td>
        </tr></table>
        <h1 style="color:#3b82f6;font-size:26px;margin:0;font-weight:900;">Booking Reminder</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:8px 0 0;">You have a service appointment today</p>
      </td></tr>
      <tr><td style="padding:0 32px 24px;">
        <p style="color:#e2e8f0;font-size:16px;margin:0 0 16px;">Hi <strong>${providerName}</strong>,</p>
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">This is a friendly reminder that you have a <strong style="color:#e2e8f0;">${serviceCategory}</strong> appointment scheduled for today.</p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;margin-bottom:18px;"><tr><td style="padding:18px;">
          <p style="color:#3b82f6;font-size:11px;font-weight:900;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Today's Appointment</p>

          <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Service</p>
          <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0 0 14px;">${serviceCategory}</p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;"><tr>
            <td width="50%" valign="top" style="padding-right:8px;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Date</p>
              <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0;">${dateStr}</p>
            </td>
            <td width="50%" valign="top" style="padding-left:8px;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Time Slot</p>
              <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0;">${bookingSlot || 'Not specified'}</p>
            </td>
          </tr></table>

          <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Customer</p>
          <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0 0 14px;">${customerName}</p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;"><tr>
            <td width="50%" valign="top" style="padding-right:8px;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Contact</p>
              <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0;">${customerMobile || 'N/A'}</p>
            </td>
            <td width="50%" valign="top" style="padding-left:8px;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">Address</p>
              <p style="color:#e2e8f0;font-size:15px;font-weight:700;margin:0;">${customerAddress || 'N/A'}</p>
            </td>
          </tr></table>
        </td></tr></table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.15);border-radius:12px;margin-bottom:18px;"><tr><td style="padding:14px 16px;">
          <p style="color:#3b82f6;font-size:12px;font-weight:700;margin:0;line-height:1.5;">⏰ Please arrive on time and complete the service professionally. Mark the booking as completed once done.</p>
        </td></tr></table>

        <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">Need help? Contact support at support@localserve.in</p>
      </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
        <p style="color:#8b5cf6;font-size:14px;font-weight:700;margin:0 0 4px;">LocalServe</p>
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0 0 4px;">India's Trusted Home Services</p>
        <p style="color:rgba(255,255,255,0.2);font-size:10px;margin:0;">support@localserve.in | www.localserve.in</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

module.exports = { otpEmailTemplate, bookingAcceptedTemplate, providerReminderTemplate };
