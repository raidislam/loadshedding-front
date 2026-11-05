import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">PowerGrid BD</p>
          <p className="mt-2 text-sm text-primary-foreground/70">
            Load Shedding &amp; Power Management System. A student project that demonstrates how
            outages, reports and repairs can be managed in one place.
          </p>
        </div>
        <div>
          <p className="font-medium">Quick links</p>
          <ul className="mt-2 space-y-1 text-sm text-primary-foreground/70">
            <li><Link href="/outage-status" className="hover:text-white">Outage status</Link></li>
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium">Demo notice</p>
          <p className="mt-2 text-sm text-primary-foreground/70">
            All outages, schedules and customer data shown here are sample data created for an
            academic assignment. This is not a live feed from any electricity authority.
          </p>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-primary-foreground/60">
        © 2026 PowerGrid BD · Academic demonstration project
      </p>
    </footer>
  );
}
