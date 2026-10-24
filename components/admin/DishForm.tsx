"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { DIETARY_META } from "@/components/ui/DietaryTags";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { Switch } from "@/components/ui/Switch";
import { toast } from "@/components/ui/Toaster";
import { dishSchema, type DishValues } from "@/lib/schemas";
import { useMenu } from "@/lib/store/menu";
import type { DietaryTag, Dish } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PhotoDrop } from "./PhotoDrop";

const TAGS: DietaryTag[] = ["vegetarian", "vegan", "spicy", "gluten-free"];

const EMPTY: DishValues = {
  name: "",
  badge: "",
  description: "",
  price: 0,
  category: "burgers",
  tags: [],
  available: true,
  featured: false,
  image: undefined,
};

function toValues(dish: Dish | null): DishValues {
  if (!dish) return EMPTY;
  return {
    name: dish.name,
    badge: dish.badge ?? "",
    description: dish.description,
    price: dish.price / 100,
    category: dish.category,
    tags: dish.tags,
    available: dish.available,
    featured: Boolean(dish.featured),
    image: dish.image,
  };
}

interface DishFormProps {
  open: boolean;
  dish: Dish | null; // null → new dish
  onClose: () => void;
}

export function DishForm({ open, dish, onClose }: DishFormProps) {
  const { categories, createDish, updateDish, deleteDish } = useMenu();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DishValues>({ resolver: zodResolver(dishSchema), defaultValues: toValues(dish) });

  useEffect(() => {
    if (open) {
      reset(toValues(dish));
      setConfirmDelete(false);
    }
  }, [open, dish, reset]);

  const description = watch("description") ?? "";
  const name = watch("name");
  const category = watch("category");

  const onSubmit = async (values: DishValues) => {
    const payload = {
      ...values,
      badge: values.badge || undefined,
      price: Math.round(values.price * 100),
    };
    try {
      if (dish) {
        await updateDish(dish.id, payload);
        toast(`Saved “${values.name}”. The public menu is up to date.`);
      } else {
        await createDish(payload);
        toast(`Added “${values.name}” to the menu.`);
      }
      onClose();
    } catch {
      toast("Couldn't save — please try again.", "error");
    }
  };

  const onDelete = async () => {
    if (!dish) return;
    if (!confirmDelete) return setConfirmDelete(true);
    await deleteDish(dish.id);
    toast(`Removed “${dish.name}” from the menu.`, "info");
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={dish ? "Edit dish" : "New dish"}
      description={dish ? "Changes appear on the public menu as soon as you save." : "It will appear on the public menu straight away."}
      className="sm:max-w-lg"
      footer={
        <div className="flex items-center justify-between gap-3 pb-1">
          {dish ? (
            <Button variant="ghost" onClick={onDelete} className={cn(confirmDelete && "text-tomato")}>
              <Trash2 className="h-4 w-4" aria-hidden /> {confirmDelete ? "Click again to delete" : "Delete"}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="dish-form" loading={isSubmitting} loadingText="Saving…" disabled={Boolean(dish) && !isDirty}>
              {dish ? "Save changes" : "Add dish"}
            </Button>
          </div>
        </div>
      }
    >
      <form id="dish-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 pb-6">
        <Controller
          control={control}
          name="image"
          render={({ field }) => <PhotoDrop value={field.value} onChange={field.onChange} name={name} category={category} />}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" error={errors.name?.message} className="sm:col-span-2">
            {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} invalid={invalid} data-autofocus {...register("name")} />}
          </Field>
          <Field label="Badge" optional hint="Short sticker, e.g. New or Fan fave">
            {({ id }) => <Input id={id} placeholder="Fan fave" {...register("badge")} />}
          </Field>
        </div>
        <Field label="Description" error={errors.description?.message} hint={`${description.length}/220 characters`}>
          {({ id, describedBy, invalid }) => <Textarea id={id} aria-describedby={describedBy} invalid={invalid} rows={3} {...register("description")} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price ($)" error={errors.price?.message}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="number" step="0.5" min="0" inputMode="decimal" aria-describedby={describedBy} invalid={invalid} {...register("price", { valueAsNumber: true })} />
            )}
          </Field>
          <Field label="Category" error={errors.category?.message}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} aria-describedby={describedBy} invalid={invalid} {...register("category")}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Dietary tags</legend>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => {
                  const meta = DIETARY_META[tag];
                  const Icon = meta.icon;
                  const on = field.value.includes(tag);
                  return (
                    <label
                      key={tag}
                      className={cn(
                        "inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tomato",
                        on ? "border-ink bg-ink text-cream" : "border-line hover:border-muted/50",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={on}
                        onChange={() => field.onChange(on ? field.value.filter((t) => t !== tag) : [...field.value, tag])}
                      />
                      <Icon className="h-4 w-4" aria-hidden />
                      {meta.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
        />
        <div className="flex flex-wrap gap-x-8 gap-y-2 rounded-xl bg-card p-4 shadow-inset-line">
          <Controller control={control} name="available" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Available today" />} />
          <Controller control={control} name="featured" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Feature on homepage" />} />
        </div>
      </form>
    </Sheet>
  );
}
