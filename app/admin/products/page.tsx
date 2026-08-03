"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminNav from "@/components/AdminNav";
import { siteConfig } from "@/lib/config";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  sizes: string[];
  colors: string[];
  description: string;
  images: string[];
  hidden?: boolean;
  rowNumber?: number;
};

type EditState = {
  name: string;
  price: string;
  sizes: string;
  colors: string;
  description: string;
  images: string;
};

export default function ManageProductsPage() {
  type ColorPair = { id: string; color: string; image: string };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [colorPairs, setColorPairs] = useState<ColorPair[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState<string | null>(null); // product id being saved
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
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
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const addColorPair = () => {
    setColorPairs([
      ...colorPairs,
      { id: Math.random().toString(36).substring(2, 9), color: "", image: "" }
    ]);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Use the admin endpoint that includes hidden products
      const res = await fetch("/api/products/admin");
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      showToast("Could not load products.", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    const numColors = p.colors.length;
    const generalImages = p.images.slice(numColors);

    setEditState({
      name: p.name,
      price: String(p.price),
      sizes: p.sizes.join(", "),
      colors: p.colors.join(", "),
      description: p.description,
      images: generalImages.join(", "),
    });

    const pairs = p.colors.map((c, idx) => ({
      id: `${p.id}-color-${idx}`,
      color: c,
      image: p.images[idx] ?? "",
    }));
    setColorPairs(pairs);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
    setColorPairs([]);
  };

  const saveEdit = async (p: Product) => {
    if (!editState || !p.rowNumber) return;
    setSaving(p.id);

    const finalColors = colorPairs.map(cp => cp.color.trim()).filter(Boolean);
    const colorImages = colorPairs.map(cp => cp.image.trim()).filter(Boolean);
    const generalImages = editState.images.split(",").map(img => img.trim()).filter(Boolean);
    const finalImages = [...colorImages, ...generalImages];

    const bodyToSubmit = {
      ...editState,
      colors: finalColors.join(", "),
      images: finalImages.join(", "),
    };

    try {
      const res = await fetch(`/api/products/${p.rowNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyToSubmit),
      });
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? "Save failed.", false);
      } else {
        showToast("Product updated ✓");
        setEditingId(null);
        setEditState(null);
        setColorPairs([]);
        await loadProducts();
      }
    } catch {
      showToast("Network error.", false);
    } finally {
      setSaving(null);
    }
  };

  const toggleHide = async (p: Product) => {
    if (!p.rowNumber) return;
    setSaving(p.id);
    try {
      const res = await fetch(`/api/products/${p.rowNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !p.hidden }),
      });
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? "Failed.", false);
      } else {
        showToast(p.hidden ? "Product visible again ✓" : "Product hidden from store ✓");
        await loadProducts();
      }
    } catch {
      showToast("Network error.", false);
    } finally {
      setSaving(null);
    }
  };

  const confirmDelete = async (p: Product) => {
    if (!p.rowNumber) return;
    setSaving(p.id);
    setDeleteConfirm(null);
    try {
      const res = await fetch(`/api/products/${p.rowNumber}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? "Delete failed.", false);
      } else {
        showToast("Product deleted ✓");
        await loadProducts();
      }
    } catch {
      showToast("Network error.", false);
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <AdminNav />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-5 top-5 z-50 rounded-sm border px-5 py-3 font-mono text-xs uppercase tracking-widest2 shadow-lift transition-all ${
            toast.ok
              ? "border-brass/40 bg-brass/10 text-cream"
              : "border-ember/40 bg-ember/10 text-ember"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mt-8">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ember">
          Catalog manager
        </p>
        <h1 className="mt-2 font-display text-3xl text-cream">Manage Products</h1>
        <p className="mt-1 font-body text-sm text-ash">
          Edit details, hide from storefront, or permanently delete a product.
        </p>
      </div>

      {loading ? (
        <div className="mt-16 text-center font-mono text-xs uppercase tracking-widest2 text-ash">
          Loading…
        </div>
      ) : products.length === 0 ? (
        <div className="mt-16 text-center font-mono text-xs uppercase tracking-widest2 text-ash">
          No products yet. Add one from the Add product tab.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {products.map((p) => {
            const isEditing = editingId === p.id;
            const isBusy = saving === p.id;

            return (
              <div
                key={p.id}
                className={`rounded-sm border bg-slate/30 transition-all ${
                  p.hidden ? "border-line/30 opacity-60" : "border-line/60"
                }`}
              >
                {/* Product header row */}
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-sm bg-carbon">
                      {p.images[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-display text-lg text-cream">{p.name}</p>
                      <p className="font-mono text-xs text-ash">
                        ₹{p.price.toLocaleString("en-IN")}
                        {p.hidden && (
                          <span className="ml-3 rounded-sm bg-ember/15 px-2 py-0.5 text-ember">
                            Hidden
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0 justify-start sm:justify-end">
                    {/* Edit */}
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(p)}
                        disabled={isBusy}
                        className="rounded-sm border border-line/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest2 text-ash transition-colors hover:border-cream/40 hover:text-cream disabled:opacity-40"
                      >
                        Edit
                      </button>
                    )}

                    {/* Hide / Unhide */}
                    <button
                      onClick={() => toggleHide(p)}
                      disabled={isBusy}
                      className={`rounded-sm border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest2 transition-colors disabled:opacity-40 ${
                        p.hidden
                          ? "border-brass/40 text-brass hover:bg-brass/10"
                          : "border-line/60 text-ash hover:border-ash/40 hover:text-cream"
                      }`}
                    >
                      {isBusy ? "…" : p.hidden ? "Unhide" : "Hide"}
                    </button>

                    {/* Delete */}
                    {deleteConfirm === p.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-ember">Sure?</span>
                        <button
                          onClick={() => confirmDelete(p)}
                          disabled={isBusy}
                          className="rounded-sm bg-ember px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest2 text-carbon transition-all hover:brightness-110 disabled:opacity-40"
                        >
                          Yes, delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="rounded-sm border border-line/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest2 text-ash hover:text-cream"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(p.id)}
                        disabled={isBusy}
                        className="rounded-sm border border-ember/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest2 text-ember transition-colors hover:bg-ember/10 disabled:opacity-40"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline edit form */}
                {isEditing && editState && (
                  <div className="border-t border-line/60 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70">
                          Name
                        </span>
                        <input
                          className="input mt-1"
                          value={editState.name}
                          onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70">
                          Price ({siteConfig.currency})
                        </span>
                        <input
                          type="number"
                          className="input mt-1"
                          value={editState.price}
                          onChange={(e) => setEditState({ ...editState, price: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70">
                          Sizes (comma separated)
                        </span>
                        <input
                          className="input mt-1"
                          value={editState.sizes}
                          onChange={(e) => setEditState({ ...editState, sizes: e.target.value })}
                        />
                      </label>
                      <div className="sm:col-span-2 border-t border-line/40 pt-4 mt-2">
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
                                                  showToast("Upload complete ✓");
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
                      <label className="block sm:col-span-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70">
                          Description
                        </span>
                        <textarea
                          rows={3}
                          className="input mt-1 resize-none"
                          value={editState.description}
                          onChange={(e) =>
                            setEditState({ ...editState, description: e.target.value })
                          }
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70">
                          Images (Upload or URLs)
                        </span>
                        <div className="mb-2 mt-1">
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

                                setEditState((prev) => {
                                  if (!prev) return prev;
                                  const existing = prev.images ? prev.images.split(",").map(x => x.trim()).filter(Boolean) : [];
                                  const all = [...existing, ...urls];
                                  return { ...prev, images: all.join(", ") };
                                });
                                showToast("Upload complete ✓");
                              } catch (error: any) {
                                showToast(error.message || "Upload failed.", false);
                              } finally {
                                setIsUploading(false);
                                e.target.value = '';
                              }
                            }}
                            className="text-xs text-ash file:mr-4 file:rounded-sm file:border-0 file:bg-slate/50 file:px-4 file:py-2 file:font-mono file:text-[10px] file:uppercase file:tracking-widest2 file:text-cream hover:file:bg-slate/80 cursor-pointer disabled:opacity-50"
                          />
                          {isUploading && <span className="text-xs text-ember ml-2">Uploading...</span>}
                        </div>
                        <input
                          className="input mt-1"
                          value={editState.images}
                          onChange={(e) => setEditState({ ...editState, images: e.target.value })}
                          placeholder="https://... , /uploads/..."
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => saveEdit(p)}
                        disabled={isBusy}
                        className="rounded-sm bg-ember px-5 py-2 font-mono text-xs uppercase tracking-widest2 text-carbon transition-all hover:shadow-glow hover:brightness-110 disabled:opacity-50"
                      >
                        {isBusy ? "Saving…" : "Save changes"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-sm border border-line/60 px-5 py-2 font-mono text-xs uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
