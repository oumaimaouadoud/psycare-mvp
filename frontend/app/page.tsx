import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '../lib/site';

const specialties = [
  ['Anxiété', 'Évaluation et accompagnement des troubles anxieux.'],
  ['Dépression', 'Consultation, suivi clinique et orientation thérapeutique.'],
  ['Troubles du sommeil', 'Évaluation des difficultés d’endormissement et du sommeil.'],
  ['Suivi psychiatrique', 'Consultations de suivi adaptées à la situation du patient.'],
];

export default function HomePage() {
  return (
    <main>
      <section className="bg-[radial-gradient(circle_at_top_right,#d7eee8,transparent_42%)]">
        <div className="mx-auto grid min-h-[620px] max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2">
          <div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900">Psychiatrie • Tanger</span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-emerald-950 md:text-6xl">
              Un espace d’écoute, de soins et de confiance.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Présentation du cabinet, informations pratiques et prise de rendez-vous en ligne avec confirmation simple.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/rendez-vous" className="rounded-xl bg-emerald-800 px-6 py-3 font-semibold text-white shadow-sm hover:bg-emerald-900">
                Prendre rendez-vous
              </Link>
              <a href="#cabinet" className="rounded-xl border border-emerald-900/20 bg-white px-6 py-3 font-semibold text-emerald-900">
                Découvrir le cabinet
              </a>
            </div>
          </div>
          <div className="rounded-[2rem] border border-emerald-900/10 bg-white p-8 shadow-xl shadow-emerald-950/5">
            <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-emerald-100 to-teal-50 text-center">
              <div>
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white p-3 shadow-sm">
  <Image
    src={siteConfig.logo}
    alt={`Logo ${siteConfig.doctorName}`}
    width={100}
    height={100}
    className="h-full w-full object-contain"
  />
</div>

<p className="mt-5 text-xl font-bold text-emerald-950">
  {siteConfig.doctorName}
</p>

<p className="mt-1 text-slate-600">
  {siteConfig.specialty}
</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="specialites" className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Domaines de consultation</p>
        <h2 className="mt-3 text-3xl font-bold text-emerald-950">Principales prises en charge</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {specialties.map(([title, text]) => (
            <article key={title} className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-emerald-950">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="cabinet" className="bg-emerald-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-300">Le cabinet</p>
            <h2 className="mt-3 text-3xl font-bold">Informations pratiques</h2>
            <p className="mt-5 leading-7 text-emerald-50/80">
              Remplace ce contenu par la biographie, les diplômes, l’expérience et l’approche de la psychiatre.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Info title="Adresse" value="6ème étage Numéro 33, Chellah office center, Rue Allal Ben Abdellah, Tanger 90000, Maroc" />
            <Info title="Consultation" value="Sur rendez-vous" />
            <Info title="Téléconsultation" value="Optionnelle" />
            <Info title="Contact" value="+212 6 66 99 77 86" />
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <div className="text-sm text-emerald-200">{title}</div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}
