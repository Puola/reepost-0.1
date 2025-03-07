interface FieldProps {
  label: string;
  value: string;
}

export function Field({ label, value }: FieldProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4 last:mb-0">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}