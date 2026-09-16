'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

type Appointment = {
  id: string;
  patientName: string;
  phone: string;
  email: string | null;
  startAt: string;
  endAt: string;
  type: 'CABINET' | 'VIDEO';
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
};

type Rule = {
  id?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  active: boolean;
};

const statusLabels: Record<Appointment['status'], string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  NO_SHOW: 'Absent',
};

const dayLabels = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function DashboardPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState('');
  const [savingRules, setSavingRules] = useState(false);

  async function load() {
    try {
      await apiFetch('/auth/me');
      const [a, r] = await Promise.all([
        apiFetch<Appointment[]>('/admin/appointments'),
        apiFetch<Rule[]>('/admin/availability-rules'),
      ]);
      setAppointments(a);
      setRules(r);
    } catch {
      router.replace('/admin/login');
    }
  }

  useEffect(() => { void load(); }, []);

  const upcoming = useMemo(
    () => appointments.filter((a) => new Date(a.startAt) >= new Date() && a.status !== 'CANCELLED'),
    [appointments],
  );

  async function changeStatus(id: string, status: Appointment['status']) {
    setError('');
    try {
      await apiFetch(`/admin/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setAppointments((current) => current.map((a) => a.id === id ? { ...a, status } : a));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Modification impossible');
    }
  }

  function updateRule(index: number, patch: Partial<Rule>) {
    setRules((current) => current.map((rule, i) => i === index ? { ...rule, ...patch } : rule));
  }

  async function saveRules() {
    setSavingRules(true);
    setError('');
    try {
      const cleaned = rules.map((rule) => ({
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
          slotMinutes: rule.slotMinutes,
          active: rule.active,
        }));
      const saved = await apiFetch<Rule[]>('/admin/availability-rules', {
        method: 'PUT',
        body: JSON.stringify({ rules: cleaned }),
      });
      setRules(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible');
    } finally {
      setSavingRules(false);
    }
  }

  async function logout() {
    await apiFetch('/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Administration</p>
          <h1 className="mt-1 text-3xl font-bold text-emerald-950">Tableau de bord</h1>
        </div>
        <button onClick={logout} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Déconnexion</button>
      </div>

      {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label="Rendez-vous à venir" value={upcoming.length} />
        <Metric label="En attente" value={appointments.filter((a) => a.status === 'PENDING').length} />
        <Metric label="Confirmés" value={appointments.filter((a) => a.status === 'CONFIRMED').length} />
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-emerald-950">Rendez-vous</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3">Date</th><th className="px-6 py-3">Patient</th><th className="px-6 py-3">Contact</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium">{formatDate(a.startAt)}</td>
                  <td className="px-6 py-4">{a.patientName}</td>
                  <td className="px-6 py-4"><div>{a.phone}</div><div className="text-xs text-slate-500">{a.email}</div></td>
                  <td className="px-6 py-4">{a.type === 'CABINET' ? 'Cabinet' : 'Vidéo'}</td>
                  <td className="px-6 py-4">
                    <select
                      value={a.status}
                      onChange={(e) => void changeStatus(a.id, e.target.value as Appointment['status'])}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && <tr><td className="px-6 py-8 text-slate-500" colSpan={5}>Aucun rendez-vous.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-emerald-950">Horaires hebdomadaires</h2>
            <p className="mt-1 text-sm text-slate-500">Les créneaux publics sont générés automatiquement à partir de ces plages.</p>
          </div>
          <button
            type="button"
            onClick={() => setRules((r) => [...r, { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', slotMinutes: 30, active: true }])}
            className="rounded-xl border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-800"
          >
            Ajouter une plage
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          {rules.map((rule, index) => (
            <div key={`${rule.id ?? 'new'}-${index}`} className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto] md:items-center">
              <select value={rule.dayOfWeek} onChange={(e) => updateRule(index, { dayOfWeek: Number(e.target.value) })} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                {dayLabels.slice(1).map((day, i) => <option value={i + 1} key={day}>{day}</option>)}
              </select>
              <input type="time" value={rule.startTime} onChange={(e) => updateRule(index, { startTime: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2" />
              <input type="time" value={rule.endTime} onChange={(e) => updateRule(index, { endTime: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2" />
              <select value={rule.slotMinutes} onChange={(e) => updateRule(index, { slotMinutes: Number(e.target.value) })} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                {[20, 30, 45, 60].map((m) => <option value={m} key={m}>{m} min</option>)}
              </select>
              <button type="button" onClick={() => setRules((r) => r.filter((_, i) => i !== index))} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600">Supprimer</button>
            </div>
          ))}
        </div>
        <button onClick={saveRules} disabled={savingRules} className="mt-5 rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white disabled:opacity-50">
          {savingRules ? 'Enregistrement…' : 'Enregistrer les horaires'}
        </button>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-bold text-emerald-950">{value}</div></div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-MA', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Casablanca',
  }).format(new Date(value));
}
