import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn--primary',
  secondary: '',
  ghost: 'btn--ghost',
  danger: 'btn--danger',
};

export function Button({ variant = 'secondary', block = true, className, ...rest }: ButtonProps) {
  const classes = ['btn', VARIANT_CLASS[variant], block ? 'btn--block' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return <button type="button" className={classes} {...rest} />;
}
