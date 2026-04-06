import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import SEO from "@/shared/components/SEO";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background">
            <SEO 
                title="Privacy Policy"
                description="Learn how SimpliFi protects your personal and financial information. We are committed to data security and privacy."
                canonical="https://simplifi.com.my/privacy-policy"
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
                <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
                <p className="text-muted-foreground mb-6">Last Updated: February 25, 2026</p>

                <section className="space-y-8 prose prose-emerald max-w-none text-foreground/80">
                    <p>
                        SimpliFi, a product of Innovia AI Technologies ("we," "our," or "us"), is committed to protecting your privacy and ensuring your personal data is handled in accordance with the Malaysian Personal Data Protection Act 2010 (PDPA). This Privacy Policy explains how we collect, use, and safeguard your information.
                    </p>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                        <p className="mb-3">To provide our financial planning services, we collect the following personal data:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Identification:</strong> Name and email address.</li>
                            <li><strong>Financial Data:</strong> Monthly income, current EPF (Employees Provident Fund) balance, and other financial inputs provided by you. <em>Please note that we do not verify this data against external sources.</em></li>
                            <li><strong>Demographic Data:</strong> Current age.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Purpose of Collection</h2>
                        <p className="mb-3">We process your personal data for the following purposes:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To provide financial health assessments and retirement projections.</li>
                            <li>To allow you to save and access your financial plans across devices.</li>
                            <li>To communicate important updates or changes to our services.</li>
                            <li>To improve our tools and user experience through anonymized analytics.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Consent and Choice</h2>
                        <p>
                            By using SimpliFi and providing your information, you consent to the collection and processing of your data as described in this policy. You have the choice to withdraw your consent at any time; however, please note that certain features of the service may be unavailable without the required data.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Disclosure to Third Parties</h2>
                        <p>
                            We do not sell, rent, or trade your personal data. We may only disclose your information to trusted service providers (such as hosting and database providers) who assist us in operating our platform, subject to strict confidentiality agreements, or as required by law.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Security</h2>
                        <p>
                            We implement industry-standard technical and organizational security measures to protect your data from unauthorized access, loss, or misuse. This includes encryption of data in transit and at rest.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Retention</h2>
                        <p>
                            We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy or to comply with legal obligations. If you delete your account, your personal data will be removed from our active systems.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights</h2>
                        <p className="mb-3">Under the PDPA, you have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access your personal data held by us.</li>
                            <li>Request correction of inaccurate or incomplete data.</li>
                            <li>Inquire about our data handling practices.</li>
                        </ul>
                        <p className="mt-4">To exercise these rights, please contact us at simplifi.fintech@gmail.com.</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. Significant changes will be notified to you via email or a prominent notice on our platform.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border bg-emerald-50/10 px-6 py-8 mt-12">
                <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-muted-foreground">
                    <p>© 2026 SimpliFi by Innovia AI Technologies. All rights reserved.</p>
                    <div className="space-x-4">
                        <Link to="/terms-of-service" className="hover:text-foreground">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
