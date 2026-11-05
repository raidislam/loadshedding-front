import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/public/ContactForm";
import { DemoNotice } from "@/components/public/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the PowerGrid BD support team.",
  openGraph: { title: "Contact | PowerGrid BD", description: "Questions about outages or the system? Send us a message.", type: "website" },
};

const details = [
  { icon: MapPin, label: "Head office", value: "Demo Office, Agargaon, Dhaka 1207" },
  { icon: Phone, label: "Emergency hotline", value: "+880 1700-000000 (demo number)" },
  { icon: Mail, label: "Email", value: "support@powergrid.demo" },
  { icon: Clock, label: "Support hours", value: "24 hours, 7 days a week" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary">Contact us</h1>
        <p className="mt-3 text-muted-foreground">
          Have a question about the system? Send a message below. To report a power failure, log in
          and use the Report Outage page so the repair team can track it.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>All fields are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {details.map((d) => (
            <Card key={d.label} size="sm">
              <CardContent className="flex items-start gap-3">
                <d.icon className="mt-0.5 size-5 text-electric" />
                <div>
                  <p className="text-sm text-muted-foreground">{d.label}</p>
                  <p className="font-medium">{d.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <DemoNotice>These contact details are examples for the demo and do not belong to a real organisation.</DemoNotice>
    </div>
  );
}
