"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { DishImage } from "@/components/brand/DishImage";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Downscale an uploaded photo so it fits comfortably in the mock (localStorage) database. */
async function toCompressedDataUrl(file: File, maxSize = 900): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

interface PhotoDropProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  name: string;
  category: CategoryId;
}

/**
 * Drag-and-drop / click-to-upload photo area. In production, upload the file to
 * your storage (S3, Cloudinary…) and save the returned URL instead of a data URL.
 */
export function PhotoDrop({ value, onChange, name, category }: PhotoDropProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) return setError("That isn't an image — try a JPG, PNG or WebP.");
    if (file.size > 12 * 1024 * 1024) return setError("That photo is over 12 MB.");
    setBusy(true);
    try {
      onChange(await toCompressedDataUrl(file));
    } catch {
      setError("We couldn't read that image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold">Photo</span>
      <div className="flex items-start gap-4">
        <DishImage name={name || "New dish"} category={category} src={value} className="aspect-square w-24 shrink-0" />
        <div className="flex-1">
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-4 text-center text-sm transition-colors",
              "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tomato",
              dragging ? "border-ink bg-mustard-tint/50" : "border-line hover:border-muted/60",
            )}
          >
            <ImagePlus className="mb-1 h-5 w-5 text-muted" aria-hidden />
            <span className="font-semibold">{busy ? "Processing…" : value ? "Replace photo" : "Drop a photo or browse"}</span>
            <span className="text-xs text-muted">JPG, PNG or WebP · square works best</span>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                void handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {value && (
            <button type="button" onClick={() => onChange(undefined)} className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-muted hover:text-tomato">
              <Trash2 className="h-4 w-4" aria-hidden /> Remove photo (use placeholder)
            </button>
          )}
          {error && (
            <p className="mt-2 text-sm font-medium text-tomato" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
