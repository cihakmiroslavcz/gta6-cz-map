import Image from "next/image";
import { Suspense, type ReactNode } from "react";
import styles from "@/app/map-feedback.module.css";
import { mapContactEmail, publicMapOrigin } from "@/lib/map-contact";

export function MapFeedbackPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className={styles.page}>
      <section className={`map-glass ${styles.panel}`} aria-labelledby="feedback-title">
        <Image
          className={styles.logo}
          src="/logo/gta6-cz-map-logo.svg"
          alt="GTA VI Interaktivní mapa"
          width={216}
          height={54}
          unoptimized
        />
        <h1 id="feedback-title">{title}</h1>
        <Suspense fallback={<p role="status">Načítám údaje o místě…</p>}>{children}</Suspense>
      </section>
    </main>
  );
}

export function MapFeedbackForm({
  label,
  subject,
  returnHref,
  submitLabel,
  children,
}: {
  label: string;
  subject: string;
  returnHref: string;
  submitLabel: string;
  children: ReactNode;
}) {
  const recipient = encodeURIComponent(mapContactEmail).replace("%40", "@");
  return (
    <form className={styles.form} action={`https://formsubmit.co/${recipient}`} method="post" aria-label={label}>
      <input type="hidden" name="_subject" value={subject} />
      <input type="hidden" name="_next" value={new URL(returnHref, publicMapOrigin).href} />
      {children}
      <button className={styles.submit} type="submit">{submitLabel}</button>
      <p className={styles.note}>
        Formulář zpracovává <a href="https://formsubmit.co/">FormSubmit</a>.
      </p>
    </form>
  );
}
