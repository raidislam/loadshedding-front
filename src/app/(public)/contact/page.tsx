import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageSquare, Phone, Send, Zap } from "lucide-react";
import { ContactForm } from "@/components/public/ContactForm";
import { DemoNotice } from "@/components/public/DemoNotice";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the PowerGrid BD support team.",
  openGraph: { title: "Contact | PowerGrid BD", description: "Questions about outages or the system? Send us a message.", type: "website" },
};

const details = [
  { icon: MapPin, label: "Head office", value: "Demo Office, Agargaon, Dhaka 1207", tint: "from-sky-500 to-cyan-400" },
  { icon: Phone, label: "Emergency hotline", value: "+880 1700-000000 (demo number)", tint: "from-rose-500 to-orange-400" },
  { icon: Mail, label: "Email", value: "support@powergrid.demo", tint: "from-indigo-500 to-violet-400" },
  { icon: Clock, label: "Support hours", value: "24 hours, 7 days a week", tint: "from-emerald-500 to-teal-400" },
];

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden bg-[#020617] text-slate-100">
      {/* Aurora background */}
      <div className="hero-grid-bg hero-grid-mask pointer-events-none absolute inset-0 opacity-60" />
      <div className="about-aurora pointer-events-none absolute -top-40 left-1/2 h-144 w-240 -translate-x-1/2 rounded-full bg-[conic-gradient(from_270deg,#0ea5e9,#22d3ee,#6366f1,#0ea5e9)] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute top-[45%] -left-40 size-112 rounded-full bg-electric/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -right-40 size-112 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-14 px-4 pt-32 pb-20 md:pt-40">
        {/* Hero */}
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-sky-300 backdrop-blur">
            <MessageSquare className="size-3.5" />
            Contact us
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl">
            Let&apos;s keep you{" "}
            <span className="bg-linear-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
              connected.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Have a question about the system? Send a message below. To report a power failure, log
            in and use the Report Outage page so the repair team can track it.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form card with gradient border */}
          <div className="rounded-3xl bg-linear-to-br from-sky-400/40 via-white/10 to-indigo-500/40 p-px lg:col-span-3">
            <div className="dark relative h-full overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#050d24] p-6 text-foreground md:p-8">
              <div className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-electric/20 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-electric to-indigo-600 text-white shadow-lg shadow-electric/40">
                  <Send className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white">Send a message</h2>
                  <p className="text-sm text-slate-400">All fields are required.</p>
                </div>
              </div>
              <div className="contact-form relative mt-6">
                <ContactForm />
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className="space-y-4 lg:col-span-2">
            {details.map((d) => (
              <div
                key={d.label}
                className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/3 p-5 backdrop-blur transition duration-300 hover:translate-x-1 hover:border-white/20 hover:bg-white/6"
              >
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${d.tint} text-white shadow-lg`}>
                  <d.icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{d.label}</p>
                  <p className="mt-1 font-semibold text-white">{d.value}</p>
                </div>
              </div>
            ))}

            {/* Emergency callout */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-linear-to-br from-amber-500/15 to-orange-500/5 p-5">
              <Zap className="pointer-events-none absolute -right-4 -bottom-6 size-24 text-amber-400/10" strokeWidth={1.2} />
              <p className="relative inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
                <Zap className="size-4 fill-amber-400 text-amber-400" />
                Power is out right now?
              </p>
              <p className="relative mt-1.5 text-sm text-slate-400">
                Log in and file a report so a technician can be assigned and you can follow the repair.
              </p>
            </div>
          </div>
        </div>

        <DemoNotice className="border-amber-400/30 bg-amber-400/10 text-amber-200">
          These contact details are examples for the demo and do not belong to a real organisation.
        </DemoNotice>
      </div>
    </div>
  );
}
