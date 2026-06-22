'use client';

export function PeriodoSelect({
  options,
  selected,
}: {
  options: { value: string; label: string }[];
  selected: string;
}) {
  return (
    <select
      className="input text-sm py-1.5"
      value={selected}
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set('periodo', e.target.value);
        window.location.href = url.toString();
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

