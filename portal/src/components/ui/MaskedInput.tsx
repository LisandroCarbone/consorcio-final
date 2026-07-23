"use client";

import { IMaskInput } from "react-imask";
import { forwardRef, useCallback } from "react";

type MaskPreset = "cuit" | "phone" | "money" | "cbu" | "percentage";

const MASK_CONFIGS: Record<MaskPreset, Record<string, unknown>> = {
  cuit: {
    mask: "00-00000000-0",
    lazy: false,
    placeholderChar: "_",
  },
  phone: {
    mask: "00-0000-0000",
    lazy: false,
    placeholderChar: "_",
  },
  money: {
    mask: Number,
    scale: 2,
    radix: ",",
    mapToRadix: ["."],
    thousandsSeparator: ".",
    padFractionalZeros: true,
    normalizeZeros: true,
    min: 0,
  },
  cbu: {
    mask: "0000 0000 0000 0000 0000 00",
    lazy: false,
    placeholderChar: "_",
  },
  percentage: {
    mask: Number,
    scale: 4,
    radix: ",",
    mapToRadix: ["."],
    min: 0,
    max: 100,
    padFractionalZeros: false,
    normalizeZeros: true,
  },
};

type Props = {
  preset: MaskPreset;
  name: string;
  defaultValue?: string | number | null;
  required?: boolean;
  className?: string;
  placeholder?: string;
};

function stripMask(value: string, preset: MaskPreset): string {
  if (preset === "cuit" || preset === "phone") return value.replace(/[-_\s]/g, "");
  if (preset === "cbu") return value.replace(/[_\s]/g, "");
  if (preset === "money") return value.replace(/\./g, "").replace(",", ".");
  if (preset === "percentage") return value.replace(",", ".");
  return value;
}

function toDisplay(value: string | number | null | undefined, preset: MaskPreset): string {
  if (value === null || value === undefined || value === "") return "";
  const s = String(value);
  if (preset === "money") {
    const n = Number(s);
    if (isNaN(n)) return s;
    return n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  if (preset === "percentage") {
    const n = Number(s);
    if (isNaN(n)) return s;
    return String(n).replace(".", ",");
  }
  return s;
}

const MaskedInput = forwardRef<HTMLInputElement, Props>(function MaskedInput(
  { preset, name, defaultValue, required, className = "input", placeholder },
  _ref
) {
  const config = MASK_CONFIGS[preset];
  const initial = toDisplay(defaultValue, preset);

  const handleAccept = useCallback(
    (_value: string, maskRef: unknown) => {
      const el = (maskRef as { el?: { input?: HTMLElement } })?.el?.input;
      const hidden = el?.parentElement?.querySelector(
        `input[name="${name}"]`
      ) as HTMLInputElement | null;
      if (hidden) {
        hidden.value = stripMask(_value, preset);
      }
    },
    [name, preset]
  );

  return (
    <span style={{ position: "relative", display: "block" }}>
      <input
        type="hidden"
        name={name}
        defaultValue={defaultValue != null
          ? (preset === "money" || preset === "percentage")
            ? String(Number(defaultValue) || 0)
            : stripMask(String(defaultValue), preset)
          : ""}
      />
      <IMaskInput
        {...(config as Record<string, unknown>)}
        defaultValue={initial}
        onAccept={handleAccept}
        className={className}
        placeholder={placeholder}
        {...(required ? { required: true } : {})}
      />
    </span>
  );
});

export default MaskedInput;
