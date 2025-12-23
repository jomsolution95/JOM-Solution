import React from "react";

// CV Templates Library — 50 templates
// Default export: CVTemplates component
// Usage:
// import CVTemplates from './cv-templates-50';
// <CVTemplates templateId={1} data={cvData} />

export type CVData = {
    fullName?: string;
    title?: string;
    summary?: string;
    contact?: { email?: string; phone?: string; location?: string; website?: string };
    experiences?: Array<{ role: string; company: string; start: string; end?: string; description?: string }>;
    education?: Array<{ degree: string; school: string; start: string; end?: string }>;
    skills?: string[];
    languages?: string[];
    projects?: Array<{ name: string; desc?: string; link?: string }>;
    photoUrl?: string;
};

const Placeholder: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <div className="text-sm text-gray-500">{children}</div>
);

// A shell that renders a CV given styling props — templates will call this with variants.
const TemplateShell: React.FC<{
    data: CVData;
    layout?: 'left' | 'right' | 'center' | 'two-column';
    accent?: string; // tailwind color like 'indigo-600'
    styleVariant?: number; // small style modifier
}> = ({ data, layout = 'two-column', accent = 'indigo-600', styleVariant = 1 }) => {
    const accentClass = `text-${accent}`;
    const accentBg = `bg-${accent}`;

    // For safety in templates where unknown accent may be passed, fallback classes for Tailwind JIT.
    const safeAccentText = {
        'indigo-600': 'text-indigo-600',
        'blue-600': 'text-blue-600',
        'rose-600': 'text-rose-600',
        'emerald-600': 'text-emerald-600',
        'amber-600': 'text-amber-600',
        'gray-800': 'text-gray-800',
    }[accent] || 'text-indigo-600';

    return (
        <div className="max-w-3xl mx-auto border border-gray-200 p-6 rounded-md bg-white shadow-sm h-full min-h-[800px]" style={{ fontFamily: 'Inter, system-ui' }}>
            <div className={`flex ${layout === 'two-column' ? 'gap-6' : ''} h-full`}>
                {/* Left Column */}
                <div className={`${layout === 'two-column' ? 'w-2/3' : 'w-full'}`}>
                    <div className="flex items-center gap-4">
                        {data.photoUrl ? (
                            <img src={data.photoUrl} alt={data.fullName} className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">Photo</div>
                        )}
                        <div>
                            <h1 className={`text-2xl font-bold ${safeAccentText}`}>{data.fullName || 'Prénom Nom'}</h1>
                            <div className="text-sm text-gray-600">{data.title || 'Titre professionnel'}</div>
                        </div>
                    </div>

                    {data.summary && (
                        <section className="mt-4">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase">Résumé</h2>
                            <p className="mt-1 text-gray-700 text-sm">{data.summary}</p>
                        </section>
                    )}

                    {data.experiences && data.experiences.length > 0 && (
                        <section className="mt-4">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase">Expérience</h2>
                            <div className="mt-2 space-y-3">
                                {data.experiences.map((e, i) => (
                                    <div key={i} className="flex justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">{e.role} — <span className="text-gray-600">{e.company}</span></div>
                                            <div className="text-xs text-gray-500">{e.start} {e.end ? '— ' + e.end : ''}</div>
                                            {e.description && <div className="text-sm text-gray-700 mt-1">{e.description}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.projects && data.projects.length > 0 && (
                        <section className="mt-4">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase">Projets</h2>
                            <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                                {data.projects.map((p, i) => (
                                    <li key={i}><strong>{p.name}</strong>{p.desc ? ` — ${p.desc}` : ''}{p.link ? ` (${p.link})` : ''}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {data.education && data.education.length > 0 && (
                        <section className="mt-4">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase">Formation</h2>
                            <div className="mt-2 space-y-2 text-sm">
                                {data.education.map((ed, i) => (
                                    <div key={i}>
                                        <div className="font-medium text-gray-800">{ed.degree}</div>
                                        <div className="text-xs text-gray-500">{ed.school} — {ed.start} {ed.end ? '— ' + ed.end : ''}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>

                {/* Right Column */}
                <aside className={`${layout === 'two-column' ? 'w-1/3' : 'w-full mt-6'} ${layout === 'two-column' ? 'border-l pl-6 border-gray-100' : ''}`}>
                    <div className="p-4 rounded-sm bg-gray-50">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase">Contact</h3>
                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                            <div>{data.contact?.email || 'email@exemple.com'}</div>
                            <div>{data.contact?.phone || '+221 77 000 00 00'}</div>
                            <div>{data.contact?.location || 'Ville, Pays'}</div>
                            {data.contact?.website && <div>{data.contact?.website}</div>}
                        </div>
                    </div>

                    {data.skills && data.skills.length > 0 && (
                        <div className="mt-4 p-4 rounded-sm bg-gray-50">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase">Compétences</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {data.skills.map((s, i) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-200">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.languages && data.languages.length > 0 && (
                        <div className="mt-4 p-4 rounded-sm bg-gray-50">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase">Langues</h3>
                            <ul className="mt-2 text-sm list-disc list-inside">
                                {data.languages.map((l, i) => <li key={i}>{l}</li>)}
                            </ul>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

// Generate 50 template components by composition against TemplateShell with different props

const Template1: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="indigo-600" />;
const Template2: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="blue-600" styleVariant={2} />;
const Template3: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="left" accent="rose-600" styleVariant={3} />;
const Template4: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="center" accent="emerald-600" styleVariant={4} />;
const Template5: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="amber-600" styleVariant={5} />;
const Template6: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="left" accent="gray-800" styleVariant={6} />;
const Template7: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="indigo-600" styleVariant={7} />;
const Template8: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="right" accent="blue-600" styleVariant={8} />;
const Template9: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="rose-600" styleVariant={9} />;
const Template10: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="left" accent="emerald-600" styleVariant={10} />;
const Template11: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="amber-600" styleVariant={11} />;
const Template12: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="center" accent="gray-800" styleVariant={12} />;
const Template13: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="indigo-600" styleVariant={13} />;
const Template14: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="left" accent="blue-600" styleVariant={14} />;
const Template15: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="rose-600" styleVariant={15} />;
const Template16: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="right" accent="emerald-600" styleVariant={16} />;
const Template17: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="amber-600" styleVariant={17} />;
const Template18: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="center" accent="gray-800" styleVariant={18} />;
const Template19: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="indigo-600" styleVariant={19} />;
const Template20: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="left" accent="blue-600" styleVariant={20} />;
const Template21: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="rose-600" styleVariant={21} />;
const Template22: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="right" accent="emerald-600" styleVariant={22} />;
const Template23: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="amber-600" styleVariant={23} />;
const Template24: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="center" accent="gray-800" styleVariant={24} />;
const Template25: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="indigo-600" styleVariant={25} />;
const Template26: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="left" accent="blue-600" styleVariant={26} />;
const Template27: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="rose-600" styleVariant={27} />;
const Template28: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="right" accent="emerald-600" styleVariant={28} />;
const Template29: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="amber-600" styleVariant={29} />;
const Template30: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="center" accent="gray-800" styleVariant={30} />;
const Template31: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="indigo-600" styleVariant={31} />;
const Template32: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="left" accent="blue-600" styleVariant={32} />;
const Template33: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="rose-600" styleVariant={33} />;
const Template34: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="right" accent="emerald-600" styleVariant={34} />;
const Template35: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="amber-600" styleVariant={35} />;
const Template36: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="center" accent="gray-800" styleVariant={36} />;
const Template37: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="indigo-600" styleVariant={37} />;
const Template38: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="left" accent="blue-600" styleVariant={38} />;
const Template39: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="rose-600" styleVariant={39} />;
const Template40: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="right" accent="emerald-600" styleVariant={40} />;
const Template41: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="amber-600" styleVariant={41} />;
const Template42: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="center" accent="gray-800" styleVariant={42} />;
const Template43: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="indigo-600" styleVariant={43} />;
const Template44: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="left" accent="blue-600" styleVariant={44} />;
const Template45: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="rose-600" styleVariant={45} />;
const Template46: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="right" accent="emerald-600" styleVariant={46} />;
const Template47: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="amber-600" styleVariant={47} />;
const Template48: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="center" accent="gray-800" styleVariant={48} />;
const Template49: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="two-column" accent="indigo-600" styleVariant={49} />;
const Template50: React.FC<{ data: CVData }> = ({ data }) => <TemplateShell data={data} layout="left" accent="blue-600" styleVariant={50} />;

// --- Remastered Legacy Templates (51-55) ---

// 51: Modern Remastered (Bold Header, two column, accent bar)
const Template51: React.FC<{ data: CVData }> = ({ data }) => {
    return (
        <div className="w-full h-full bg-white text-gray-800 font-sans min-h-[1000px]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-10 flex items-start gap-8">
                {data.photoUrl && (
                    <img src={data.photoUrl} alt={data.fullName} className="w-32 h-32 rounded-xl object-cover border-4 border-slate-700" />
                )}
                <div className="flex-1">
                    <h1 className="text-4xl font-bold uppercase tracking-wide mb-2 text-blue-400">{data.fullName}</h1>
                    <div className="text-xl font-light tracking-widest uppercase mb-4 opacity-90">{data.title}</div>
                    <div className="flex flex-wrap gap-4 text-xs opacity-75">
                        {data.contact?.email && <span>{data.contact.email}</span>}
                        {data.contact?.phone && <span>| {data.contact.phone}</span>}
                        {data.contact?.location && <span>| {data.contact.location}</span>}
                        {data.contact?.website && <span>| {data.contact.website}</span>}
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <div className="w-1/3 bg-slate-50 p-8 space-y-8 border-r border-slate-100">
                    {data.skills && data.skills.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase text-slate-900 border-b-2 border-blue-400 pb-2 mb-4">Compétences</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map(s => (
                                    <span key={s} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">{s}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.education && data.education.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase text-slate-900 border-b-2 border-blue-400 pb-2 mb-4">Formation</h3>
                            <div className="space-y-4">
                                {data.education.map((e, i) => (
                                    <div key={i}>
                                        <div className="font-bold text-sm text-slate-800">{e.degree}</div>
                                        <div className="text-xs text-slate-500">{e.school}</div>
                                        <div className="text-xs text-slate-400">{e.start} - {e.end}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.languages && data.languages.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase text-slate-900 border-b-2 border-blue-400 pb-2 mb-4">Langues</h3>
                            <ul className="text-sm space-y-1 text-slate-600">
                                {data.languages.map(l => <li key={l}>• {l}</li>)}
                            </ul>
                        </section>
                    )}
                </div>

                {/* Main */}
                <div className="w-2/3 p-8 space-y-8">
                    {data.summary && (
                        <section>
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <div className="w-2 h-8 bg-blue-500 rounded-sm"></div>
                                Profil
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-sm">{data.summary}</p>
                        </section>
                    )}

                    {data.experiences && data.experiences.length > 0 && (
                        <section>
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <div className="w-2 h-8 bg-blue-500 rounded-sm"></div>
                                Expérience
                            </h3>
                            <div className="space-y-8 border-l-2 border-slate-100 ml-1 pl-6">
                                {data.experiences.map((exp, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white"></div>
                                        <h4 className="text-lg font-bold text-slate-900">{exp.role}</h4>
                                        <div className="text-sm font-medium text-blue-600 mb-1">{exp.company}</div>
                                        <div className="text-xs text-slate-400 mb-2">{exp.start} - {exp.end || 'Présent'}</div>
                                        <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

// 52: Minimalist Remastered (Lots of whitespace, centered, clean)
const Template52: React.FC<{ data: CVData }> = ({ data }) => {
    return (
        <div className="w-full h-full bg-white text-gray-900 font-serif min-h-[1000px] p-16">
            <header className="text-center mb-16 border-b pb-8 border-gray-100">
                <h1 className="text-5xl tracking-tighter mb-4">{data.fullName}</h1>
                <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-6">{data.title}</p>
                <div className="text-xs text-gray-400 flex justify-center gap-4 font-sans">
                    {data.contact?.email && <span>{data.contact.email}</span>}
                    {data.contact?.phone && <span>{data.contact.phone}</span>}
                    {data.contact?.location && <span>{data.contact.location}</span>}
                </div>
            </header>

            <div className="max-w-2xl mx-auto space-y-12">
                {data.summary && (
                    <p className="text-center text-gray-600 italic leading-loose text-lg">"{data.summary}"</p>
                )}

                {data.experiences && data.experiences.length > 0 && (
                    <div className="space-y-8">
                        <h3 className="text-center text-xs font-bold uppercase tracking-widest border-b border-gray-200 pb-2 mb-8">Expérience</h3>
                        {data.experiences.map((exp, i) => (
                            <div key={i} className="grid grid-cols-[1fr_3fr] gap-8">
                                <div className="text-right text-xs text-gray-400 font-sans pt-1">
                                    {exp.start} — {exp.end}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{exp.role}</h4>
                                    <div className="text-sm text-gray-500 mb-2">{exp.company}</div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {data.education && data.education.length > 0 && (
                    <div className="space-y-8">
                        <h3 className="text-center text-xs font-bold uppercase tracking-widest border-b border-gray-200 pb-2 mb-8">Formation</h3>
                        <div className="grid grid-cols-2 gap-8">
                            {data.education.map((edu, i) => (
                                <div key={i} className="text-center">
                                    <div className="font-bold">{edu.degree}</div>
                                    <div className="text-sm text-gray-500">{edu.school}</div>
                                    <div className="text-xs text-gray-400 mt-1">{edu.start} - {edu.end}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 53: Corporate Remastered (Strong sidebar, professional blue)
const Template53: React.FC<{ data: CVData }> = ({ data }) => {
    return (
        <div className="w-full h-full bg-white flex min-h-[1000px] font-sans">
            <aside className="w-[35%] bg-blue-900 text-white p-8 flex flex-col gap-8">
                <div className="text-center">
                    {data.photoUrl ? (
                        <img src={data.photoUrl} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-800 object-cover" />
                    ) : (
                        <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-blue-800 flex items-center justify-center text-2xl font-bold">{data.fullName?.charAt(0)}</div>
                    )}
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-4 border-b border-blue-800 pb-2">Contact</h3>
                    <div className="text-sm space-y-2 opacity-80 text-left">
                        <div>{data.contact?.email}</div>
                        <div>{data.contact?.phone}</div>
                        <div>{data.contact?.location}</div>
                    </div>
                </div>

                {data.skills && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-4 border-b border-blue-800 pb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2 text-sm">
                            {data.skills.map(s => (
                                <span key={s} className="bg-blue-800 px-2 py-1 rounded text-xs">{s}</span>
                            ))}
                        </div>
                    </div>
                )}

                {data.education && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider opacity-50 mb-4 border-b border-blue-800 pb-2">Education</h3>
                        <div className="space-y-4">
                            {data.education.map((e, i) => (
                                <div key={i}>
                                    <div className="font-bold text-sm">{e.degree}</div>
                                    <div className="text-xs opacity-75">{e.school}</div>
                                    <div className="text-xs opacity-50">{e.start} - {e.end}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </aside>

            <main className="w-[65%] p-12">
                <header className="mb-12 border-b-4 border-blue-900 pb-6">
                    <h1 className="text-4xl font-black uppercase text-gray-900 mb-2">{data.fullName}</h1>
                    <div className="text-xl text-blue-800 font-medium">{data.title}</div>
                </header>

                <div className="space-y-10">
                    {data.summary && (
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 uppercase mb-3 text-blue-900">À Propos</h3>
                            <p className="text-gray-600 leading-relaxed text-justify">{data.summary}</p>
                        </section>
                    )}

                    {data.experiences && (
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 uppercase mb-6 text-blue-900">Expérience Professionnelle</h3>
                            <div className="space-y-6">
                                {data.experiences.map((exp, i) => (
                                    <div key={i} className="mb-6">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="text-lg font-bold text-gray-800">{exp.role}</h4>
                                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{exp.start} - {exp.end}</span>
                                        </div>
                                        <div className="text-blue-800 font-medium text-sm mb-2">{exp.company}</div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

// 54: Creative Remastered (Bold color blocks, artistic)
const Template54: React.FC<{ data: CVData }> = ({ data }) => {
    return (
        <div className="w-full h-full bg-neutral-100 min-h-[1000px] relative overflow-hidden font-sans">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-400 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-300 rounded-full blur-3xl opacity-20 translate-y-1/3 -translate-x-1/3"></div>

            <div className="relative z-10 p-12 max-w-4xl mx-auto bg-white/80 backdrop-blur-sm min-h-[900px] shadow-2xl my-8 rounded-2xl">
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 mb-2 pb-2">
                        {data.fullName}
                    </h1>
                    <div className="text-xl font-bold uppercase tracking-widest text-gray-400">{data.title}</div>
                </header>

                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-1 border-r border-gray-200 pr-8 text-right space-y-8">
                        <section>
                            <h3 className="font-bold text-rose-500 uppercase mb-4">Contact</h3>
                            <div className="text-sm space-y-2 text-gray-600">
                                <div>{data.contact?.email}</div>
                                <div>{data.contact?.phone}</div>
                                <div>{data.contact?.location}</div>
                            </div>
                        </section>

                        {data.skills && (
                            <section>
                                <h3 className="font-bold text-rose-500 uppercase mb-4">Talents</h3>
                                <div className="flex flex-wrap justify-end gap-2">
                                    {data.skills.map(s => (
                                        <span key={s} className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">{s}</span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="col-span-2 space-y-8">
                        {data.summary && (
                            <section className="bg-gradient-to-r from-rose-50 to-orange-50 p-6 rounded-xl border border-rose-100">
                                <p className="text-gray-700 leading-relaxed font-medium">{data.summary}</p>
                            </section>
                        )}

                        {data.experiences && (
                            <section>
                                <h3 className="font-bold text-3xl mb-6 text-gray-800">Experience</h3>
                                <div className="space-y-8">
                                    {data.experiences.map((exp, i) => (
                                        <div key={i} className="group">
                                            <h4 className="text-xl font-bold group-hover:text-rose-500 transition-colors">{exp.role}</h4>
                                            <div className="text-sm font-bold uppercase text-gray-400 mb-2">{exp.company} — {exp.start}</div>
                                            <p className="text-gray-600 leading-relaxed text-sm">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 55: ATS Remastered (Clean, Semantic, Scannable)
const Template55: React.FC<{ data: CVData }> = ({ data }) => {
    return (
        <div className="w-full h-full bg-white text-black font-serif p-12 min-h-[1000px] leading-relaxed">
            <header className="border-b-2 border-black pb-4 mb-6">
                <h1 className="text-3xl font-bold uppercase text-center mb-2">{data.fullName}</h1>
                <div className="text-center text-sm flex justify-center gap-4 flex-wrap">
                    <span>{data.contact?.location}</span>
                    <span>|</span>
                    <span>{data.contact?.email}</span>
                    <span>|</span>
                    <span>{data.contact?.phone}</span>
                    {data.contact?.website && (
                        <>
                            <span>|</span>
                            <span>{data.contact?.website}</span>
                        </>
                    )}
                </div>
            </header>

            <div className="space-y-6">
                {data.summary && (
                    <section>
                        <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Professional Summary</h3>
                        <p className="text-sm text-justify">{data.summary}</p>
                    </section>
                )}

                {data.experiences && data.experiences.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-4">Work Experience</h3>
                        <div className="space-y-4">
                            {data.experiences.map((exp, i) => (
                                <div key={i}>
                                    <div className="flex justify-between font-bold text-sm">
                                        <span>{exp.role}</span>
                                        <span>{exp.start} – {exp.end || 'Present'}</span>
                                    </div>
                                    <div className="text-sm italic mb-1">{exp.company}</div>
                                    <p className="text-sm">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {data.education && data.education.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-4">Education</h3>
                        <div className="space-y-2">
                            {data.education.map((edu, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <div>
                                        <span className="font-bold">{edu.degree}</span>, {edu.school}
                                    </div>
                                    <span>{edu.end}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {data.skills && data.skills.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Skills</h3>
                        <p className="text-sm">{data.skills.join(', ')}</p>
                    </section>
                )}
            </div>
        </div>
    );
};

// Map
const TemplateMap: Record<number, React.FC<{ data: CVData }>> = {
    1: Template1,
    2: Template2,
    3: Template3,
    4: Template4,
    5: Template5,
    6: Template6,
    7: Template7,
    8: Template8,
    9: Template9,
    10: Template10,
    11: Template11,
    12: Template12,
    13: Template13,
    14: Template14,
    15: Template15,
    16: Template16,
    17: Template17,
    18: Template18,
    19: Template19,
    20: Template20,
    21: Template21,
    22: Template22,
    23: Template23,
    24: Template24,
    25: Template25,
    26: Template26,
    27: Template27,
    28: Template28,
    29: Template29,
    30: Template30,
    31: Template31,
    32: Template32,
    33: Template33,
    34: Template34,
    35: Template35,
    36: Template36,
    37: Template37,
    38: Template38,
    39: Template39,
    40: Template40,
    41: Template41,
    42: Template42,
    43: Template43,
    44: Template44,
    45: Template45,
    46: Template46,
    47: Template47,
    48: Template48,
    49: Template49,
    50: Template50,
    // Remastered Legacy
    51: Template51,
    52: Template52,
    53: Template53,
    54: Template54,
    55: Template55,
};

export const TemplateList = Object.keys(TemplateMap).map(k => Number(k));

export default function CVTemplates({ templateId = 1, data }: { templateId?: number; data: CVData }) {
    const T = TemplateMap[templateId] || Template1;
    return <T data={data} />;
}
