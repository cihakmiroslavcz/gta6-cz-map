"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import MaterialIcon from "@/components/MaterialIcon";

export default function MobileMapDialog({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const viewport = window.visualViewport;

    function positionDialog() {
      if (!dialog || !viewport) return;
      // The layout viewport can remain full height when a mobile keyboard opens.
      dialog.style.setProperty("--editor-top", `${viewport.offsetTop}px`);
      dialog.style.setProperty("--editor-left", `${viewport.offsetLeft}px`);
      dialog.style.setProperty("--editor-width", `${viewport.width}px`);
      dialog.style.setProperty("--editor-height", `${viewport.height}px`);
    }

    positionDialog();
    dialog.showModal();
    viewport?.addEventListener("resize", positionDialog);
    viewport?.addEventListener("scroll", positionDialog);
    return () => {
      viewport?.removeEventListener("resize", positionDialog);
      viewport?.removeEventListener("scroll", positionDialog);
      dialog.close();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      className="mobile-point-editor"
      aria-labelledby={headingId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="point-card">
        <header className="point-card-heading">
          <h2 id={headingId}>{title}</h2>
          <button type="button" className="point-editor-close" aria-label="Zavřít formulář" onClick={onClose}>
            <MaterialIcon name="close" />
          </button>
        </header>
        {children}
      </section>
    </dialog>,
    document.body,
  );
}
