"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { ClientGallery } from "@/lib/gallery";

type UploadConfig = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
};

type UploadingFile = {
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
};

export default function AdminGalleriesClient() {
  const [adminSecret, setAdminSecret] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [galleries, setGalleries] = useState<ClientGallery[]>([]);
  const [loading, setLoading] = useState(false);

  const [galleryName, setGalleryName] = useState("");
  const [clientName, setClientName] = useState("");
  const [password, setPassword] = useState("");

  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit modal state
  const [editingGallery, setEditingGallery] = useState<ClientGallery | null>(null);
  const [editName, setEditName] = useState("");
  const [editClientName, setEditClientName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthed) loadGalleries();
  }, [isAuthed]);

  useEffect(() => {
    const stored = localStorage.getItem("admin_secret");
    if (stored) {
      setAdminSecret(stored);
      fetch("/api/gallery/list", { headers: { "x-admin-secret": stored } })
        .then((res) => { if (res.ok) setIsAuthed(true); });
    }
  }, []);

  async function loadGalleries() {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery/list", {
        headers: { "x-admin-secret": adminSecret },
      });
      if (res.ok) {
        const data = await res.json();
        setGalleries(data.galleries);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/gallery/list", {
      headers: { "x-admin-secret": adminSecret },
    });
    if (res.ok) {
      setIsAuthed(true);
      localStorage.setItem("admin_secret", adminSecret);
    } else {
      alert("Pogrešna admin šifra");
    }
  }

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    const newUploads: UploadingFile[] = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...newUploads]);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!galleryName.trim()) { alert("Unesite naziv galerije"); return; }
    if (files.length === 0) { alert("Dodajte bar jednu sliku"); return; }

    setIsCreating(true);
    try {
      const createRes = await fetch("/api/gallery/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
        body: JSON.stringify({ name: galleryName, clientName: clientName || undefined, password: password || undefined }),
      });

      if (!createRes.ok) throw new Error("Failed to create gallery");

      const createData = await createRes.json();
      setCreatedUrl(`${window.location.origin}${createData.url}`);

      const config = createData.upload as UploadConfig;

      for (let i = 0; i < files.length; i++) {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "uploading" } : f));
        try {
          await uploadToCloudinary(files[i].file, config, (progress) => {
            setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, progress } : f));
          });
          setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "done", progress: 100 } : f));
        } catch {
          setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "error" } : f));
        }
      }
      loadGalleries();
    } catch {
      alert("Greška pri kreiranju galerije");
    } finally {
      setIsCreating(false);
    }
  }

  async function uploadToCloudinary(file: File, config: UploadConfig, onProgress: (p: number) => void): Promise<void> {
    const UPLOAD_TIMEOUT = 120000; // 2 minutes per file

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", config.apiKey);
      formData.append("timestamp", config.timestamp.toString());
      formData.append("signature", config.signature);
      formData.append("folder", config.folder);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`);
      xhr.timeout = UPLOAD_TIMEOUT;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.ontimeout = () => reject(new Error("Upload timeout - file too large or slow connection"));
      xhr.send(formData);
    });
  }

  function resetForm() {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setGalleryName("");
    setClientName("");
    setPassword("");
    setCreatedUrl(null);
  }

  async function handleDelete(slug: string, permanent: boolean) {
    if (!confirm(permanent ? "TRAJNO obrisati galeriju?" : "Deaktivirati galeriju?")) return;
    try {
      const res = await fetch("/api/gallery/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
        body: JSON.stringify({ slug, permanent }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Brisanje nije uspelo");
      }
      loadGalleries();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Greška pri brisanju galerije");
    }
  }

  function openEditModal(gallery: ClientGallery) {
    setEditingGallery(gallery);
    setEditName(gallery.name);
    setEditClientName(gallery.clientName || "");
    setEditPassword("");
  }

  async function handleSaveEdit() {
    if (!editingGallery) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/gallery/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
        body: JSON.stringify({
          slug: editingGallery.slug,
          name: editName,
          clientName: editClientName || undefined,
          password: editPassword || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ažuriranje nije uspelo");
      }
      setEditingGallery(null);
      loadGalleries();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Greška pri ažuriranju");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-light text-white">Admin Panel</h1>
          <input type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} placeholder="Admin šifra" className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-white/40 focus:outline-none" />
          <button type="submit" className="w-full rounded-lg bg-white py-3 font-medium text-black">Prijava</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-light text-white">Klijentske Galerije</h1>
          <button onClick={() => { localStorage.removeItem("admin_secret"); setIsAuthed(false); }} className="text-sm text-neutral-400 hover:text-white">Odjava</button>
        </div>

        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg text-white">Nova galerija</h2>
          {createdUrl ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-500/10 p-4">
                <p className="mb-2 text-green-400">Galerija kreirana!</p>
                <div className="flex items-center gap-2">
                  <input type="text" value={createdUrl} readOnly className="flex-1 rounded bg-black/50 px-3 py-2 text-sm text-white" />
                  <button onClick={() => { navigator.clipboard.writeText(createdUrl); alert("Link kopiran!"); }} className="rounded bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">Kopiraj</button>
                </div>
                {password && <p className="mt-2 text-sm text-neutral-400">Šifra: <span className="text-white">{password}</span></p>}
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-neutral-800">
                    <Image src={f.preview} alt="" fill className="object-cover" />
                    <div className={`absolute inset-0 flex items-center justify-center ${f.status === "done" ? "bg-green-500/50" : f.status === "error" ? "bg-red-500/50" : f.status === "uploading" ? "bg-black/50" : "bg-black/30"}`}>
                      {f.status === "uploading" && <span className="text-sm font-bold text-white">{f.progress}%</span>}
                      {f.status === "done" && <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={resetForm} className="rounded-lg bg-white px-6 py-2 font-medium text-black">Kreiraj novu galeriju</button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className="mb-1 block text-sm text-neutral-400">Naziv galerije *</label><input type="text" value={galleryName} onChange={(e) => setGalleryName(e.target.value)} placeholder="npr. Vjenčanje Petrović" required className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-white/40 focus:outline-none" /></div>
                <div><label className="mb-1 block text-sm text-neutral-400">Ime klijenta</label><input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="npr. Marko i Ana" className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-white/40 focus:outline-none" /></div>
                <div><label className="mb-1 block text-sm text-neutral-400">Šifra (opciono)</label><input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ostavi prazno za javnu" className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-white/40 focus:outline-none" /></div>
              </div>
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${isDragging ? "border-white bg-white/10" : "border-white/20 hover:border-white/40"}`}>
                <input type="file" multiple accept="image/*" onChange={(e) => e.target.files && handleFiles(e.target.files)} className="absolute inset-0 cursor-pointer opacity-0" />
                <svg className="mx-auto mb-4 h-12 w-12 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-neutral-400">Prevuci slike ovdje ili <span className="text-white">klikni za odabir</span></p>
              </div>
              {files.length > 0 && (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {files.map((f, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-800">
                      <Image src={f.preview} alt="" fill className="object-cover" />
                      <button type="button" onClick={() => removeFile(i)} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4">
                <button type="submit" disabled={isCreating || files.length === 0} className="rounded-lg bg-white px-6 py-2 font-medium text-black disabled:opacity-50">{isCreating ? "Kreiranje..." : `Kreiraj galeriju (${files.length} slika)`}</button>
                {files.length > 0 && <button type="button" onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); }} className="text-sm text-neutral-400 hover:text-white">Obriši sve</button>}
              </div>
            </form>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg text-white">Postojeće galerije</h2>
          {loading ? <p className="text-neutral-400">Učitavanje...</p> : galleries.length === 0 ? <p className="text-neutral-400">Nema galerija</p> : (
            <div className="space-y-3">
              {galleries.map((g) => (
                <div key={g.slug} className={`rounded-lg border p-4 ${g.active ? "border-white/10 bg-white/5" : "border-red-500/20 bg-red-500/5"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{g.name}</h3>
                        {!g.active && <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">Neaktivna</span>}
                        {g.password && <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">Zaštićena</span>}
                      </div>
                      {g.clientName && <p className="text-sm text-neutral-400">Klijent: {g.clientName}</p>}
                      <p className="text-sm text-neutral-500">Kreirana: {new Date(g.createdAt).toLocaleDateString("sr-RS")}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/g/${g.slug}`); alert("Link kopiran!"); }} className="rounded bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20">Kopiraj link</button>
                      <a href={`/g/${g.slug}`} target="_blank" className="rounded bg-white/10 px-3 py-1 text-center text-sm text-white hover:bg-white/20">Otvori</a>
                      <button onClick={() => openEditModal(g)} className="rounded bg-blue-500/20 px-3 py-1 text-sm text-blue-400 hover:bg-blue-500/30">Izmeni</button>
                      <button onClick={() => handleDelete(g.slug, !g.active)} className="rounded bg-red-500/20 px-3 py-1 text-sm text-red-400 hover:bg-red-500/30">{g.active ? "Deaktiviraj" : "Obriši trajno"}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-neutral-900 p-6">
            <h3 className="mb-4 text-lg font-medium text-white">Izmeni galeriju</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-neutral-400">Naziv galerije</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-neutral-400">Ime klijenta</label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-neutral-400">Nova šifra (ostavi prazno da zadržiš postojeću)</label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Unesi novu šifru..."
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editName.trim()}
                  className="flex-1 rounded-lg bg-white py-2 font-medium text-black disabled:opacity-50"
                >
                  {isSaving ? "Čuvanje..." : "Sačuvaj"}
                </button>
                <button
                  onClick={() => setEditingGallery(null)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/10"
                >
                  Otkaži
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
