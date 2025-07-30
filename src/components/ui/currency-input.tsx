'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value' | 'onBlur'> {
  value: number;
  onValueChange: (value: number) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const format = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '';
  }
  return new Intl.NumberFormat('id-ID').format(value);
};

const parse = (value: string): number => {
    const numberValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return isNaN(numberValue) ? 0 : numberValue;
};


export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, onBlur, ...props }, ref) => {
    
    const [displayValue, setDisplayValue] = React.useState(format(value));

    React.useEffect(() => {
        const numericValue = parse(displayValue);
        if (numericValue !== value) {
            setDisplayValue(format(value));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const stringValue = e.target.value;
      const numericValue = parse(stringValue);
      setDisplayValue(format(numericValue));
      onValueChange(numericValue);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const numericValue = parse(e.target.value);
      setDisplayValue(format(numericValue));
      // The onValueChange would have already been called in handleChange
      if (onBlur) {
        onBlur(e);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        type="text"
        inputMode="numeric"
      />
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';
