"use client";

export function ConsorcioToggleField({
  cuit,
  field,
  defaultChecked,
  label,
  action,
}: {
  cuit: string;
  field: string;
  defaultChecked: boolean;
  label: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form
      action={action}
      onChange={(e) => e.currentTarget.requestSubmit()}
    >
      <input type="hidden" name="cuit" value={cuit} />
      <input type="hidden" name="field" value={field} />
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          name="value"
          value="true"
          defaultChecked={defaultChecked}
          className="rounded"
        />
        {label}
      </label>
    </form>
  );
}

export function ConsorcioSelectField({
  cuit,
  field,
  defaultValue,
  options,
  action,
  className,
}: {
  cuit: string;
  field: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  action: (formData: FormData) => void | Promise<void>;
  className?: string;
}) {
  return (
    <form
      action={action}
      onChange={(e) => e.currentTarget.requestSubmit()}
    >
      <input type="hidden" name="cuit" value={cuit} />
      <input type="hidden" name="field" value={field} />
      <select name="value" defaultValue={defaultValue} className={className ?? "input"}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
