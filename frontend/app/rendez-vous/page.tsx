'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';

type Slot = { startAt: string; endAt: string; label: string };
type AvailabilityResponse = { date: string; timezone: string; slots: Slot[] };

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AppointmentPage() {
  const [date, setDate] = useState(localDateString());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const minDate = useMemo(() => localDateString(), []);

  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    setSelected('');
    setError('');
    apiFetch<AvailabilityResponse>(`/availability?date=${date}`)
      .then((data) => {
        if (!cancelled) setSlots(data.slots);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => { cancelled = true; };
  }, [date]);

async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  // On mémorise le formulaire AVANT le await
  const formElement = event.currentTarget;

  setError('');
  setSuccess('');

  if (!selected) {
    setError('Veuillez choisir un créneau.');
    return;
  }

  const form = new FormData(formElement);

  setSending(true);

  try {
    await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify({
        patientName: form.get('patientName'),
        phone: form.get('phone'),
        email: form.get('email') || undefined,
        type: form.get('type'),
        startAt: selected,
      }),
    });

    // Retirer le créneau qui vient d'être réservé
    setSlots((current) =>
      current.filter((slot) => slot.startAt !== selected)
    );

    setSelected('');

    // Vider le formulaire sans provoquer l'erreur "null reset"
    formElement.reset();

    // Garder le message de confirmation en vert
    setSuccess(
      'Votre demande de rendez-vous a été enregistrée. Le cabinet pourra ensuite la confirmer.'
    );

  } catch (e) {
    setError(
      e instanceof Error
        ? e.message
        : 'Une erreur est survenue.'
    );
  } finally {
    setSending(false);
  }
}
  return (
    <main className="mx-auto max-w-5xl px-5 py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Rendez-vous</p>
        <h1 className="mt-2 text-4xl font-bold text-emerald-950">Choisissez votre créneau</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Cette première version ne demande aucune information sur le motif médical. Les données collectées servent uniquement à organiser le rendez-vous.
        </p>
      </div>

      <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm md:p-8">
          <label className="text-sm font-semibold text-slate-700">Date</label>
          <input
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-700"
          />

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Créneaux disponibles</span>
              {loadingSlots && <span className="text-xs text-slate-500">Chargement…</span>}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {!loadingSlots && slots.map((slot) => (
                <button
                  type="button"
                  key={slot.startAt}
                  onClick={() => setSelected(slot.startAt)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    selected === slot.startAt
                      ? 'border-emerald-800 bg-emerald-800 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            {!loadingSlots && slots.length === 0 && (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Aucun créneau disponible pour cette date.</div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-emerald-950">Vos coordonnées</h2>
          <div className="mt-5 grid gap-4">
            <Field label="Nom complet" name="patientName" required placeholder="Nom et prénom" />
            <Field label="Téléphone" name="phone" required placeholder="+212 6 XX XX XX XX" />
            <Field label="Email (facultatif)" name="email" type="email" placeholder="vous@exemple.com" />
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Type de consultation
              <select name="type" className="rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-emerald-700">
                <option value="CABINET">Au cabinet</option>
                <option value="VIDEO">Téléconsultation</option>
              </select>
            </label>
          </div>

          {error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {success && <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{success}</div>}

          <button
            disabled={sending}
            className="mt-6 w-full rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {sending ? 'Enregistrement…' : 'Demander le rendez-vous'}
          </button>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            N’utilisez pas ce formulaire pour une urgence ni pour transmettre des informations médicales sensibles.
          </p>
        </section>
      </form>
    </main>
  );
}

function Field({ label, name, type = 'text', required = false, placeholder }: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-emerald-700"
      />
    </label>
  );
}
