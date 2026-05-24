import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center justify-center py-12', className)}>
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center py-12">
            <p className="text-red-400 text-sm">Error: {message}</p>
        </div>
    );
}
