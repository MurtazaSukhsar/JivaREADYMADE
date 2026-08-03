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
  type ColorPair = { id: string; color: string; image: string };

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [colorPairs, setColorPairs] = useState<ColorPair[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [isUploading, setIsUploading] = useState(false);

  const STANDARD_COLORS = [
    "Pink",
    "Light Blue",
    "Violet",
    "Dark Green",
    "Grey",
    "Light Green",
    "Red",
    "Blue",
    "Green",
    "Black",
    "White",
    "Yellow",
    "Orange",
    "Purple",
    "Navy",
    "Beige",
    "Charcoal",
    "Stone"
  ];

  const showToast = (msg: string, ok = true) => {
    if (!ok) {
      setStatus({ state: "error", message: msg });
    }
  };

  const addColorPair = () => {
    setColorPairs([
      ...colorPairs,
      { id: Math.random().toString(36).substring(2, 9), color: "", image: "" }
    ]);
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setSizes("S, M, L, XL");
    setColorPairs([]);
    setDescription("");
    setImages("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ state: "submitting" });

    const finalColors = colorPairs.map((p) => p.color.trim()).filter(Boolean);
    const colorImages = colorPairs.map((p) => p.image.trim()).filter(Boolean);
    const generalImages = images.split(",").map((i) => i.trim()).filter(Boolean);
    const finalImages = [...colorImages, ...generalImages];

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
          colors: finalColors,
          description,
          images: finalImages,
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

        <div className="space-y-4">
          <Field label="Sizes (comma separated)">
            <input
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="S, M, L, XL"
              className="input"
            />
          </Field>

          <div className="border-t border-line/40 pt-4">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash/80 block mb-1">
              Color-Specific Options & Images (Optional)
            </span>
            <p className="font-body text-xs text-ash/60 mb-3">
              Add colors and upload/paste their corresponding images so the customer sees the correct image when selecting that color.
            </p>

            <div className="space-y-3">
              {colorPairs.map((pair, index) => (
                <div key={pair.id} className="rounded-sm border border-line/40 bg-slate/20 p-3 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Color Name Input */}
                    <div className="flex-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70 block mb-1">
                        Colour Name
                      </span>
                      <input
                        className="input text-xs"
                        placeholder="e.g. Grey, Pink, Lavender"
                        value={pair.color}
                        onChange={(e) => {
                          const newPairs = [...colorPairs];
                          newPairs[index].color = e.target.value;
                          setColorPairs(newPairs);
                        }}
                      />
                    </div>
                  </div>

                    {/* Image Upload/URL for this color */}
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70 block mb-1">
                        Colour Image
                      </span>
                      
                      <div className="flex items-center gap-3">
                        {/* Thumbnail Preview */}
                        <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded-sm bg-carbon border border-line/40">
                          {pair.image ? (
                            <img
                              src={pair.image}
                              alt="preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-mono text-ash/40">
                              No Img
                            </div>
                          )}
                        </div>

                        {/* Upload Button */}
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <label className="relative cursor-pointer rounded-sm border border-line/60 bg-slate/50 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest2 text-cream hover:bg-slate/80 transition-colors">
                              <span>Upload Img</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  
                                  setUploadingIndex(index);
                                  try {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    
                                    const res = await fetch("/api/upload", {
                                      method: "POST",
                                      body: formData,
                                    });
                                    
                                    if (res.ok) {
                                      const data = await res.json();
                                      const newPairs = [...colorPairs];
                                      newPairs[index].image = data.url;
                                      setColorPairs(newPairs);
                                    } else {
                                      const data = await res.json().catch(() => ({}));
                                      showToast(data.error || "Upload failed", false);
                                    }
                                  } catch {
                                    showToast("Upload failed", false);
                                  } finally {
                                    setUploadingIndex(null);
                                  }
                                }}
                              />
                            </label>
                            {uploadingIndex === index && (
                              <span className="text-[10px] text-ember font-mono animate-pulse">Uploading...</span>
                            )}
                          </div>

                          {/* URL text field */}
                          <input
                            className="input text-xs"
                            placeholder="Or paste image URL"
                            value={pair.image}
                            onChange={(e) => {
                              const newPairs = [...colorPairs];
                              newPairs[index].image = e.target.value;
                              setColorPairs(newPairs);
                            }}
                          />
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newPairs = colorPairs.filter((_, i) => i !== index);
                            setColorPairs(newPairs);
                          }}
                          className="rounded-sm border border-ember/30 p-2 text-ember hover:bg-ember/10 transition-colors"
                          title="Remove color option"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <button
              type="button"
              onClick={addColorPair}
              className="mt-3 rounded-sm border border-line/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest2 text-ash hover:border-cream/40 hover:text-cream transition-colors"
            >
              + Add Color Option
            </button>
          </div>
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
