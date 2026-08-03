"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import AdminNav from "@/components/AdminNav";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; slug: string; name: string }
  | { state: "error"; message: string };

export default function AdminPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [colors, setColors] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setName("");
    setPrice("");
    setSizes("S, M, L, XL");
    setColors("");
    setDescription("");
    setImages("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ state: "submitting" });

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
          colors: colors.split(",").map((c) => c.trim()).filter(Boolean),
          description,
          images: images.split(",").map((i) => i.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ state: "error", message: data.error ?? "Something went wrong." });
        return;
      }

      setStatus({ state: "success", slug: data.product.slug, name: data.product.name });
      resetForm();
    } catch {
      setStatus({ state: "error", message: "Could not reach the server. Try again." });
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <AdminNav />

      <div className="mt-8">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ember">
          Catalog manager
        </p>
        <h1 className="mt-2 font-display text-3xl text-cream">Add a product</h1>
      </div>
      <p className="mt-2 max-w-md font-body text-sm text-ash">
        Saving this puts it straight at the top of the homepage and gives it its
        own page at <span className="font-mono text-cream">/product/[name]</span> —
        nothing else needs to be built or deployed.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-6 rounded-sm border border-line/60 bg-slate/40 p-6 sm:p-8"
      >
        <Field label="Name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ribbed Knit Sweater"
            className="input"
          />
        </Field>

        <Field label={`Price (${siteConfig.currency})`}>
          <input
            required
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="249"
            className="input"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sizes (comma separated)">
            <input
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="S, M, L, XL"
              className="input"
            />
          </Field>

          <Field label="Colors (comma separated)">
            <input
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="Ink, Stone"
              className="input"
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Fabric, fit, and what makes it worth wearing."
            className="input resize-none"
          />
        </Field>

        <Field label="Images (Upload or URLs)">
          <div className="mb-3">
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isUploading}
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                
                setIsUploading(true);
                try {
                  const urls: string[] = [];
                  for (let i = 0; i < files.length; i++) {
                    const formData = new FormData();
                    formData.append("file", files[i]);
                    
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });
                    
                    if (res.ok) {
                      const data = await res.json();
                      urls.push(data.url);
                    } else {
                      const data = await res.json().catch(() => ({}));
                      throw new Error(data.error || "Some uploads failed");
                    }
                  }
                  
                  setImages((prev) => {
                    const existing = prev ? prev.split(",").map(x => x.trim()).filter(Boolean) : [];
                    const all = [...existing, ...urls];
                    return all.join(", ");
                  });
                  setStatus({ state: "idle" });
                } catch (error: any) {
                  setStatus({ state: "error", message: error.message || "Upload failed" });
                } finally {
                  setIsUploading(false);
                  e.target.value = '';
                }
              }}
              className="text-xs text-ash file:mr-4 file:rounded-sm file:border-0 file:bg-slate/50 file:px-4 file:py-2 file:font-mono file:text-[11px] file:uppercase file:tracking-widest2 file:text-cream hover:file:bg-slate/80 cursor-pointer disabled:opacity-50"
            />
            {isUploading && <span className="text-xs text-ember ml-2">Uploading...</span>}
          </div>
          <input
            value={images}
            onChange={(e) => setImages(e.target.value)}
            placeholder="https://... , /uploads/..."
            className="input"
          />
          <p className="mt-1.5 font-body text-xs text-ash/60">
            Upload an image or manually enter URLs (comma separated). Leave blank for placeholder.
          </p>
        </Field>

        <button
          type="submit"
          disabled={status.state === "submitting" || isUploading}
          className="w-full rounded-sm bg-ember py-3.5 font-mono text-xs uppercase tracking-widest2 text-carbon transition-all duration-200 hover:shadow-glow hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
        >
          {status.state === "submitting" ? "Adding…" : "Add product"}
        </button>

        {status.state === "success" && (
          <p className="rounded-sm border border-brass/40 bg-brass/10 px-4 py-3 font-body text-sm text-cream">
            {status.name} is live at the top of the homepage. View its{" "}
            <Link
              href={`/product/${status.slug}`}
              className="font-mono text-brass underline underline-offset-2"
            >
              product page
            </Link>
            .
          </p>
        )}
        {status.state === "error" && (
          <p className="rounded-sm border border-ember/40 bg-ember/10 px-4 py-3 font-body text-sm text-ember">
            {status.message}
          </p>
        )}
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash/80">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
