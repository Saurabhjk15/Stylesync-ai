import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', type: 'General Inquiry', message: '' });
    const [sending, setSending] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields.');
            return;
        }
        setSending(true);
        try {
            const res = await api.post('/contact', formData);
            if (res.data.success) {
                toast.success('Message sent! Check your inbox — we\'ll be in touch within 24 hours.', { duration: 5000 });
                setFormData({ name: '', email: '', type: 'General Inquiry', message: '' });
            } else {
                throw new Error(res.data.error || 'Send failed');
            }
        } catch (err) {
            console.error('Contact send error:', err);
            toast.error('Could not send message. Please try again or email us directly.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="contact-layout" style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: '"DM Sans", sans-serif' }}>

            {/* Left — editorial image + info */}
            <div className="contact-editorial-panel" style={{ width: '45%', position: 'relative', overflow: 'hidden', background: 'var(--color-surface)', borderRight: '0.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flexShrink: 0 }}>
                <img
                    alt="Fashion editorial"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHyWu0L-8dTHDUfLGMzXbvIY0f1aUK6WDKoUjpTQI813ewlHdRLp_u7Mj9T-x5P527m6kxkodgkWLvhXzChBZmCDh79lkyYYGoeTn4Vvij27DQu1sTIHXL1h2miGOJuAYfKnWbX8VR7QQ_hCqf3KSDu29knrf16krISTHQXP6KNpg9SNdADttq5zWlBrriuPcsE-1yXmZ9VsuVI1_sotkAbeCk1nnY9wu11WqCvnrjig2mHPpWOI9Ca6ajYLqHA2rCdBgRpG2VVyah"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', opacity: 0.55 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(22,19,15,0.95) 0%, rgba(22,19,15,0.2) 60%, transparent 100%)' }} />
                <div style={{ position: 'relative', padding: '0 40px 56px' }}>
                    <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(44px, 5vw, 64px)', fontWeight: 300, lineHeight: 0.95, margin: '0 0 20px', color: 'var(--color-text)' }}>
                        Get in<br />
                        <em style={{ color: 'var(--color-accent)' }}>touch</em>
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.7, maxWidth: 300, marginBottom: 32 }}>
                        Concierge support for your digital style journey.
                    </p>
                    <a href="mailto:concierge@stylesync.ai" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-text)', textDecoration: 'none', fontWeight: 500 }}>
                        <span className="material-icons" style={{ fontSize: 18, color: 'var(--color-accent)' }}>email</span>
                        concierge@stylesync.ai
                    </a>
                </div>
            </div>

            {/* Right — form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px,4vw,40px) clamp(20px,5vw,64px)', paddingTop: 'calc(var(--navbar-height) + 40px)' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: '100%', maxWidth: 480 }}
                >
                    <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 32, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 6px' }}>
                        Send a message
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: '0 0 32px' }}>
                        We respond within 24 hours.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label className="label" htmlFor="name" style={{ display: 'block', marginBottom: 8 }}>Full name</label>
                            <input className="input" type="text" id="name" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div>
                            <label className="label" htmlFor="email" style={{ display: 'block', marginBottom: 8 }}>Email address</label>
                            <input className="input" type="email" id="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div>
                            <label className="label" style={{ display: 'block', marginBottom: 8 }}>Inquiry type</label>
                            <select className="input" name="type" value={formData.type} onChange={handleChange} style={{ cursor: 'pointer', backgroundColor: 'var(--color-surface)' }}>
                                <option>General Inquiry</option>
                                <option>Personal Styling Help</option>
                                <option>Technical Support</option>
                                <option>Partnership Opportunity</option>
                            </select>
                        </div>

                        <div>
                            <label className="label" htmlFor="message" style={{ display: 'block', marginBottom: 8 }}>Message</label>
                            <textarea
                                className="input"
                                id="message"
                                name="message"
                                placeholder="How can we help you?"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                style={{ resize: 'vertical', minHeight: 120 }}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            className="btn btn-primary"
                            whileHover={sending ? {} : { y: -1 }}
                            whileTap={sending ? {} : { scale: 0.97 }}
                            disabled={sending}
                            style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: sending ? 0.7 : 1 }}
                        >
                            {sending ? (
                                <>
                                    <span className="material-icons" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>autorenew</span>
                                    Sending…
                                </>
                            ) : (
                                <>
                                    <span className="material-icons" style={{ fontSize: 16 }}>send</span>
                                    Send Message
                                </>
                            )}
                        </motion.button>
                    </form>

                    <p style={{ marginTop: 24, fontSize: 12, color: 'var(--color-dim)', textAlign: 'center' }}>
                        Your data is private and will never be shared.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
