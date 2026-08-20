"use client";

import { useRef } from "react";

export function InlineEditCell({
  entityId,
  field,
  defaultValue,
  action,
  consorcioCuit,
  type = "text",
  placeholder,
  className,
}: {
  entityId: number;
  field: string;
  defaultValue: string | null;
  action: (formData: FormData) => void | Promise<void>;
  consorcioCuit: string;
  type?: "text" | "email" | "tel";
  placeholder?: string;
  className?: string;
}) {
  const original = useRef(defaultValue ?? "");

  return (
    <form action={action}>
      <input type="hidden" name="persona_id" value={entityId} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="consorcio_cuit" value={consorcioCuit} />
      <input
        name="value"
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={
          className ??
          "w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-1 transition-colors text-sm"
        }
        onBlur={(e) => {
          const val = e.currentTarget.value;
          if (val !== original.current) {
            e.currentTarget.form?.requestSubmit();
            original.current = val;
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            e.currentTarget.value = original.current;
            e.currentTarget.blur();
          }
        }}
      />
    </form>
  );
}
