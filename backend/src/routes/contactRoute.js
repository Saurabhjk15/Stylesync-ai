import express from 'express';
import axios from 'axios';

const router = express.Router();

// POST /api/contact
router.post('/', async (req, res) => {
    const { name, email, type = 'General Inquiry', message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    const resendKey    = process.env.RESEND_API_KEY;
    const senderEmail  = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'; // use this until you verify a domain

    console.log('[Contact] RESEND_API_KEY set:', !!resendKey);

    if (!resendKey || resendKey.includes('your_resend')) {
        console.warn('[Contact] Resend API key not configured — skipping email.');
        return res.json({ success: true, message: 'Message received. We will contact you soon. Thank you for your cooperation.' });
    }

    const year = new Date().getFullYear();

    // ── Auto-reply to user ─────────────────────────────────────────────────
    const userPayload = {
        from:    `StyleSync <${senderEmail}>`,
        to:      [email],
        subject: 'We received your message — StyleSync',
        html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#16130f;color:#e8e0d5;padding:40px 32px;border-radius:8px;">
            <p style="font-family:Georgia,serif;font-size:26px;font-weight:300;color:#c8a97e;margin:0 0 24px;">StyleSync</p>
            <h2 style="font-size:20px;font-weight:500;margin:0 0 16px;">Thank you, ${name} 👋</h2>
            <p style="font-size:14px;line-height:1.75;color:#a89a8c;margin:0 0 20px;">
                We've received your message about <strong style="color:#e8e0d5;">${type}</strong>.
                Our team will review it and get back to you within 24 hours.
            </p>
            <div style="background:#1e1a14;border:1px solid #3a3228;border-radius:6px;padding:20px 24px;margin-bottom:28px;">
                <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6b5d52;margin:0 0 8px;">Your message</p>
                <p style="font-size:13px;color:#a89a8c;margin:0;line-height:1.7;">${message.replace(/\n/g, '<br/>')}</p>
            </div>
            <p style="font-size:12px;color:#6b5d52;margin:32px 0 0;border-top:1px solid #3a3228;padding-top:20px;">
                © ${year} StyleSync · Your data is private and encrypted
            </p>
        </div>`,
    };

    // ── Owner notification ─────────────────────────────────────────────────
    const ownerEmail  = process.env.GMAIL_USER || senderEmail;
    const ownerPayload = {
        from:    `StyleSync Contact <${senderEmail}>`,
        to:      [ownerEmail],
        subject: `[Contact] ${type} from ${name}`,
        text:    `Name: ${name}\nEmail: ${email}\nType: ${type}\n\n${message}`,
    };

    try {
        const ownerEmail = process.env.GMAIL_USER || 'saurabhjk6376@gmail.com';
        const year = new Date().getFullYear();

        // ── Notification to owner (works without domain verification) ──────
        await axios.post('https://api.resend.com/emails', {
            from:     `StyleSync Contact <onboarding@resend.dev>`,
            to:       [ownerEmail],
            reply_to: email,            // owner can hit Reply → goes to form submitter
            subject:  `[Contact] ${type} from ${name}`,
            html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#16130f;color:#e8e0d5;padding:36px 28px;border-radius:8px;">
                <p style="font-family:Georgia,serif;font-size:24px;font-weight:300;color:#c8a97e;margin:0 0 20px;">StyleSync — New Contact</p>
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                    <tr><td style="padding:8px 0;color:#6b5d52;font-size:11px;letter-spacing:.1em;text-transform:uppercase;width:120px;">Name</td><td style="padding:8px 0;font-size:14px;">${name}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b5d52;font-size:11px;letter-spacing:.1em;text-transform:uppercase;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${email}" style="color:#c8a97e;">${email}</a></td></tr>
                    <tr><td style="padding:8px 0;color:#6b5d52;font-size:11px;letter-spacing:.1em;text-transform:uppercase;">Type</td><td style="padding:8px 0;font-size:14px;">${type}</td></tr>
                </table>
                <div style="background:#1e1a14;border:1px solid #3a3228;border-radius:6px;padding:18px 20px;margin-bottom:24px;">
                    <p style="font-size:11px;color:#6b5d52;letter-spacing:.1em;text-transform:uppercase;margin:0 0 8px;">Message</p>
                    <p style="font-size:13px;color:#a89a8c;margin:0;line-height:1.7;">${message.replace(/\n/g, '<br/>')}</p>
                </div>
                <p style="font-size:12px;color:#6b5d52;">Hit <strong>Reply</strong> to respond directly to ${name}.</p>
                <p style="font-size:11px;color:#3a3228;margin:24px 0 0;border-top:1px solid #3a3228;padding-top:16px;">© ${year} StyleSync</p>
            </div>`,
        }, { headers: { Authorization: `Bearer ${resendKey}` } });

        console.log('[Contact] Owner notification sent ✅');
        res.json({ success: true, message: 'Message sent successfully.' });
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        console.error('[Contact] Resend error:', errMsg);
        res.json({ success: true, message: 'Message received. We will contact you soon. Thank you for your cooperation.' });
    }
});

export default router;
