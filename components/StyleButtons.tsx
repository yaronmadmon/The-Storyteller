"use client";

import { Button } from "@/components/ui/button";
import type { StyleOption } from "@/lib/types";

const STYLE_OPTIONS: { value: StyleOption; label: string }[] = [
  { value: "casual", label: "More Casual" },
  { value: "formal", label: "More Formal" },
  { value: "humor", label: "Add Humor" },
  { value: "darker", label: "Make Darker" },
  { value: "simplify", label: "Simplify" },
];

interface StyleButtonsProps {
  selected: StyleOption;
  onSelect: (style: StyleOption) => void;
  onRegenerate: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function StyleButtons({
  selected,
  onSelect,
  onRegenerate,
  loading = false,
  disabled = false,
}: StyleButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STYLE_OPTIONS.map(({ value, label }) => (
        <Button
          key={value}
          variant={selected === value ? "secondary" : "outline"}
          size="sm"
          onClick={() => onSelect(value)}
          disabled={disabled || loading}
        >
          {label}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRegenerate}
        disabled={disabled || loading}
      >
        {loading ? "Regenerating..." : "Regenerate"}
      </Button>
    </div>
  );
}
