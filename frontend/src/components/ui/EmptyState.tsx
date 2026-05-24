import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">{title}</p>
            {description && <p className="text-slate-600 text-sm mt-1">{description}</p>}
        </div>
    );
}
