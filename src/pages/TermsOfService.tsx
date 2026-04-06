import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import SEO from "@/shared/components/SEO";

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background">
            <SEO 
                title="Terms of Service"
                description="Read the Terms of Service for SimpliFi. Understand your rights and responsibilities when using our financial planning tools."
                canonical="https://simplifi.com.my/terms-of-service"
            />
            <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="SimpliFi" className="h-8 w-auto" />
                    </Link>
                    <Button asChild variant="ghost" size="sm">
                        <Link to="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Link>
                    </Button>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
                <p className="text-muted-foreground mb-6">Last Updated: February 25, 2026</p>

                <section className="space-y-8 prose prose-emerald max-w-none text-foreground/80">
                    <p>
                        Welcome to SimpliFi, operated by Innovia AI Technologies. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
                    </p>

                    <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                        <h2 className="text-lg font-bold text-emerald-900 mb-2">IMPORTANT: Financial Disclaimer</h2>
                        <p className="text-emerald-800 text-sm leading-relaxed">
                            SimpliFi provides financial planning tools for educational and illustrative purposes only. <strong>We do not provide professional financial, investment, or legal advice.</strong> The calculations and projections provided are based strictly on user-supplied data and general assumptions which may not reflect actual future results. <strong>Please note that we do not verify the accuracy or authenticity of the financial data you input (such as Monthly Income or EPF balances).</strong> You should consult with a qualified financial professional before making any significant financial decisions.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Use of Service</h2>
                        <p className="mb-3">You agree to use SimpliFi only for lawful purposes and in accordance with these Terms. You are responsible for:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Maintaining the confidentiality of your account credentials.</li>
                            <li>Ensuring the data you provide is accurate and up-to-date.</li>
                            <li>Not attempting to interfere with the security or integrity of the platform.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Intellectual Property</h2>
                        <p>
                            All content, features, and functionality provided by SimpliFi, including but not limited to text, graphics, logos, and algorithms, are the exclusive property of SimpliFi and its licensors and are protected by intellectual property laws.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, SimpliFi and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service, including but not limited to financial losses or decisions made based on platform outputs.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Indemnification</h2>
                        <p>
                            You agree to indemnify and hold harmless SimpliFi and its team from any claims, liabilities, or expenses resulting from your breach of these Terms or your use of the platform.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your access to the platform at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business interests.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">6. Governing Law</h2>
                        <p>
                            These Terms of Service shall be governed by and construed in accordance with the laws of Malaysia. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Malaysia.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">7. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. Your continued use of the platform after changes are posted constitutes your acceptance of the new terms.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms of Service, please contact us at simplifi.fintech@gmail.com.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border bg-emerald-50/10 px-6 py-8 mt-12">
                <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-muted-foreground">
                    <p>© 2026 SimpliFi by Innovia AI Technologies. All rights reserved.</p>
                    <div className="space-x-4">
                        <Link to="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
