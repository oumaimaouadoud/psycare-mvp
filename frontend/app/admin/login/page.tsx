'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError('');
    try {
      await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      router.push('/admin/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-16">
      <form onSubmit={submit} className="w-full rounded-3xl border border-emerald-900/10 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-emerald-950">Espace praticienne</h1>
        <p className="mt-2 text-sm text-slate-500">Connexion réservée à l’administration du cabinet.</p>
        <div className="mt-6 grid gap-4">
          <input name="email" type="email" required placeholder="Email" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" />
          <input name="password" type="password" required placeholder="Mot de passe" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700" />
        </div>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <button disabled={loading} className="mt-6 w-full rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white disabled:opacity-50">
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </main>
  );
}
