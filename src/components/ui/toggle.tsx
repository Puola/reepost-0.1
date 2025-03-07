import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
}

export function Toggle({
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  description,
  id
}: ToggleProps) {
  const [checked, setChecked] = useState(defaultChecked);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  const handleToggle = () => {
    if (disabled) return;
    const newChecked = !checked;
    setChecked(newChecked);
    onChange?.(newChecked);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={cn(
        'flex items-center rounded-full transition-all duration-300 ease-in-out w-[60px] h-[25px] relative',
        checked ? 'bg-primary' : 'bg-white border border-gray-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div
        className={cn(
          'absolute w-[19px] h-[19px] rounded-full transition-all duration-300 ease-in-out',
          checked ? 'right-[3px] bg-white' : 'left-[3px] bg-gray-400'
        )}
      />
    </button>
  );
}