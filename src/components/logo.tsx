import { Code2 } from 'lucide-react';
import type { FC } from 'react';

export const Logo: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 text-2xl font-bold font-headline text-primary ${className}`}>
      <Code2 className="h-8 w-8" />
      <span>Code Canvas</span>
    </div>
  );
};
