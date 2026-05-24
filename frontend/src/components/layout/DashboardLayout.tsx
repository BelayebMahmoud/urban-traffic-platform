import { Sidebar } from './Sidebar';
import { AuthGuard } from './AuthGuard';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-slate-950">
                <Sidebar />
                <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
