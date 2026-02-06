import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Billing() {
    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Billing Information</h2>
                    <p className="text-muted-foreground">Manage your subscription and billing details</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Billing Details</CardTitle>
                        <CardDescription>Your billing information will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Billing integration is coming soon.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
