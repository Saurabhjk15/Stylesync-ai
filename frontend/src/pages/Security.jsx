import { Link } from 'react-router-dom';

export default function Security() {
    return (
        <div className="bg-background-dark text-slate-100 font-display min-h-screen pt-24 px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-luxury text-white mb-6">Security Protocols</h1>
                    <div className="h-1 w-24 bg-primary"></div>
                    <p className="mt-6 text-slate-400 text-lg leading-relaxed">
                        At StyleSync, your digital privacy is as important as your personal style. We employ military-grade encryption and strict access controls to ensure your biometric and personal data remains yours alone.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Protocol 1 */}
                    <section className="bg-surface-card border border-white/5 p-8 rounded-xl hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-icons text-primary">lock</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-3">End-to-End Encryption</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    All biometric data from your body scans is encrypted locally on your device before transfer. We use AES-256 encryption for data at rest and TLS 1.3 for data in transit, ensuring that your measurements are unreadable to any unauthorized interceptors.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Protocol 2 */}
                    <section className="bg-surface-card border border-white/5 p-8 rounded-xl hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-icons text-primary">fingerprint</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-3">Biometric Data Isolation</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Your 3D body mesh data is stored in isolated, air-gapped secure servers separate from your personal identity information (PII). This pseudonymization ensures that even in the unlikely event of a breach, biometric data cannot be linked back to individual users.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Protocol 3 */}
                    <section className="bg-surface-card border border-white/5 p-8 rounded-xl hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-icons text-primary">delete_forever</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-3">Right to Erasure</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    You retain full ownership of your data. You can request a complete deletion of your account and all associated data records at any time through your profile settings. We adhere to GDPR and CCPA standards for immediate and permanent data purging.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Protocol 4 */}
                    <section className="bg-surface-card border border-white/5 p-8 rounded-xl hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-icons text-primary">verified_user</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-3">Third-Party Audits</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Our security infrastructure undergoes regular penetration testing and security audits by independent cybersecurity firms to identify and remediate potential vulnerabilities proactively.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-500 mb-6">Have specific security concerns?</p>
                    <Link to="/contact" className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest hover:text-white transition-colors">
                        Contact our Security Team <span className="material-icons text-sm">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
