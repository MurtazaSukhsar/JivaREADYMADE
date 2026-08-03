"use client";

import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const LANGUAGES: { code: Language; label: string; native: string; sub: string }[] = [
  {
    code: "en",
    label: "English",
    native: "English",
    sub: "Continue in English",
  },
  {
    code: "hi",
    label: "Hindi",
    native: "हिन्दी",
    sub: "हिन्दी में जारी रखें",
  },
  {
    code: "gu",
    label: "Gujarati",
    native: "ગુજરાતી",
    sub: "ગુજરાતીમાં આગળ વધો",
  },
];

export default function LanguageSelectorModal() {
  const { hasChosen, setLanguage } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!hasChosen) {
      // Small delay so the page renders before the popup slides in
      const t = setTimeout(() => setVisible(true), 120);
      return () => clearTimeout(t);
    }
  }, [hasChosen]);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setAnimating(true), 10);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  const handleSelect = (lang: Language) => {
    setAnimating(false);
    setTimeout(() => {
      setLanguage(lang);
      setVisible(false);
    }, 350);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(18, 0, 5, 0.94)",
          backdropFilter: "blur(10px)",
          opacity: animating ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Select your language"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.25rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(145deg, #2A0010 0%, #1A0008 100%)",
            border: "1px solid #5C1020",
            borderRadius: "1rem",
            padding: "2.5rem 2rem",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(217,26,60,0.15)",
            opacity: animating ? 1 : 0,
            transform: animating ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
            transition: "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Decorative brand dot */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "radial-gradient(circle, #D91A3C 0%, #7a1828 100%)",
              margin: "0 auto 1.25rem",
              boxShadow: "0 0 24px rgba(217,26,60,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            🌐
          </div>

          <h2
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: "1.6rem",
              fontWeight: 500,
              color: "#F5EDE8",
              textAlign: "center",
              marginBottom: "0.4rem",
              lineHeight: 1.2,
            }}
          >
            Choose Your Language
          </h2>
          <p
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: "0.8rem",
              color: "#C49090",
              textAlign: "center",
              marginBottom: "2rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            अपनी भाषा चुनें &nbsp;·&nbsp; તમારી ભાષા પસંદ કરો
          </p>

          {/* Language buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {LANGUAGES.map((lang, i) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  width: "100%",
                  padding: "1rem 1.25rem",
                  background: "rgba(245,237,232,0.03)",
                  border: "1px solid rgba(245,237,232,0.08)",
                  borderRadius: "0.625rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  animationDelay: `${i * 80}ms`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(217,26,60,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(217,26,60,0.45)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(245,237,232,0.03)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(245,237,232,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateX(0)";
                }}
              >
                {/* Flag badge */}
                <span
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(217,26,60,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "1.15rem",
                    fontFamily: "var(--font-fraunces), serif",
                    color: "#D91A3C",
                    fontWeight: 600,
                  }}
                >
                  {lang.code === "en" ? "A" : lang.code === "hi" ? "अ" : "અ"}
                </span>

                <span style={{ flex: 1 }}>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: "1.05rem",
                      fontWeight: 500,
                      color: "#F5EDE8",
                      lineHeight: 1.2,
                    }}
                  >
                    {lang.native}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: "0.75rem",
                      color: "#C49090",
                      marginTop: "2px",
                    }}
                  >
                    {lang.sub}
                  </span>
                </span>

                {/* Arrow */}
                <span style={{ color: "#D91A3C", fontSize: "1rem", opacity: 0.7 }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
