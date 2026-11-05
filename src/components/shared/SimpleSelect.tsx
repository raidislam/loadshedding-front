import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimpleSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
}

// A dropdown that takes plain { value, label } options.
// Use it inside React Hook Form's <Controller>.
export function SimpleSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select...",
  invalid,
  disabled,
}: SimpleSelectProps) {
  return (
    <Select
      items={options}
      value={value || null}
      onValueChange={(v) => onChange(v ?? "")}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
