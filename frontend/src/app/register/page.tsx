'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(p => ({ ...p, [field]: e.target.value }));

    const pwStrength = form.password.length === 0 ? 0
        : form.password.length < 8 ? 1
            : form.password.length < 12 ? 2 : 3;
    const pwLabel = ['', 'Weak', 'Good', 'Strong'];
    const pwColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-green-500'];

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
        setLoading(true);
        try {
            await register(form);
            router.push('/');
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-2xl shadow-brand-600/30 mb-4">
                        <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-slate-500 text-sm mt-1">Join the Urban Traffic Platform</p>
                </div>

                {/* Card */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input required className="input pl-9" placeholder="John"
                                        value={form.firstName} onChange={set('firstName')} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Last Name</label>
                                <input required className="input" placeholder="Doe"
                                    value={form.lastName} onChange={set('lastName')} />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="email" required className="input pl-10" placeholder="you@example.com"
                                    value={form.email} onChange={set('email')} />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type={showPw ? 'text' : 'password'} required className="input pl-10 pr-10"
                                    placeholder="Min. 8 characters" value={form.password} onChange={set('password')} />
                                <button type="button" onClick={() => setShowPw(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {form.password.length > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex gap-1 flex-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength ? pwColor[pwStrength] : 'bg-slate-800'
                                                }`} />
                                        ))}
                                    </div>
                                    <span className={`text-xs font-medium ${pwStrength === 3 ? 'text-green-400' : pwStrength === 2 ? 'text-amber-400' : 'text-red-400'
                                        }`}>{pwLabel[pwStrength]}</span>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="btn-primary w-full justify-center py-2.5 text-base mt-2">
                            {loading
                                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><CheckCircle className="w-4 h-4" /> Create Account</>
                            }
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-600 mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
