"use client";

import { useState, type FormEvent } from "react";

const concernOptions = [
  { id: "breathing", icon: "🫁", label: "Breathing or collapse" },
  { id: "injury", icon: "🩹", label: "Bleeding or injury" },
  { id: "medication", icon: "💊", label: "Medication or illness" },
  { id: "behavior", icon: "⚠️", label: "Behavior or safety" },
  { id: "other", icon: "💬", label: "Something else" },
];

export default function EmergencyConcern({ dogName }: { dogName: string }) {
  const [open, setOpen] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  function resetAndClose() {
    setOpen(false);
    setTimeout(() => {
      setSelectedConcern("");
      setNote("");
      setSending(false);
      setSent(false);
      setAcknowledged(false);
      setMessageOpen(false);
    }, 200);
  }

  function notifyStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => setAcknowledged(true), 1400);
    }, 650);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-bold text-red-800 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
      >
        <span aria-hidden="true">!</span>
        Something&apos;s wrong
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="concern-title" className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-900 sm:rounded-3xl">
            {!sent ? (
              <form onSubmit={notifyStaff}>
                <div className="border-b border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-5 dark:border-red-950 dark:from-red-950/50 dark:to-orange-950/30 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-600 text-xl font-black text-white shadow-md">!</span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-700 dark:text-red-300">Urgent care support</p>
                        <h2 id="concern-title" className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">Tell us what&apos;s happening</h2>
                        <p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-200">We&apos;ll alert the on-call shelter coordinator about {dogName} immediately.</p>
                      </div>
                    </div>
                    <button type="button" onClick={resetAndClose} aria-label="Close emergency support" className="grid size-9 shrink-0 place-items-center rounded-full bg-white/80 text-lg text-zinc-600 shadow-sm hover:bg-white dark:bg-zinc-800 dark:text-zinc-200">×</button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                    <p className="font-bold text-red-900 dark:text-red-100">Is {dogName} in immediate danger?</p>
                    <p className="mt-1 text-sm leading-5 text-red-800 dark:text-red-200">For trouble breathing, collapse, uncontrolled bleeding, seizures, or possible poisoning, contact an emergency veterinarian now. You can still alert the shelter below.</p>
                    <a href="tel:+14155550199" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-800">
                      ☎ Call emergency vet · demo number
                    </a>
                  </div>

                  <fieldset className="mt-5">
                    <legend className="text-sm font-bold text-zinc-900 dark:text-white">What&apos;s closest to what you&apos;re seeing?</legend>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Optional—choose one or simply send the alert.</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {concernOptions.map((option) => (
                        <button key={option.id} type="button" aria-pressed={selectedConcern === option.id} onClick={() => setSelectedConcern(option.id)} className={`rounded-xl border p-3 text-left text-sm font-semibold transition ${selectedConcern === option.id ? "border-red-500 bg-red-50 text-red-900 ring-2 ring-red-100 dark:bg-red-950/40 dark:text-red-100 dark:ring-red-950" : "border-zinc-200 bg-white text-zinc-700 hover:border-red-200 hover:bg-red-50/50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"}`}>
                          <span className="mr-2" aria-hidden="true">{option.icon}</span>{option.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <label className="mt-5 block text-sm font-bold text-zinc-900 dark:text-white">
                    Anything staff should know right now?
                    <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder={`Example: ${dogName} has not eaten and seems very tired…`} className="mt-2 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base font-normal text-zinc-950 outline-none placeholder:text-zinc-500 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-400 dark:focus:ring-red-950" />
                  </label>

                  <button type="submit" disabled={sending} className="mt-5 w-full rounded-xl bg-red-700 px-5 py-3.5 text-base font-bold text-white shadow-md transition enabled:hover:-translate-y-0.5 enabled:hover:bg-red-800 disabled:opacity-70">
                    {sending ? "Alerting staff…" : "Alert on-call shelter staff now →"}
                  </button>
                  <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">This creates a high-priority staff item and sends one urgent push. No SMS or repeated alerts.</p>
                </div>
              </form>
            ) : (
              <div>
                <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 p-6 text-white sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div><span className="grid size-12 place-items-center rounded-full bg-white text-2xl font-black text-emerald-800 shadow-lg">✓</span><h2 id="concern-title" className="mt-4 text-2xl font-bold">Shelter staff have been alerted</h2><p className="mt-1 text-sm leading-6 text-emerald-50">You did the right thing. {dogName}&apos;s on-call coordinator now has this concern.</p></div>
                    <button type="button" onClick={resetAndClose} aria-label="Close confirmation" className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-lg hover:bg-white/25">×</button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/70">
                    <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-emerald-800">✓</span><div><p className="text-sm font-bold text-zinc-900 dark:text-white">High-priority staff item created</p><p className="text-xs text-zinc-500 dark:text-zinc-400">Reference FP-2048 · just now</p></div></div>
                    <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-emerald-800">✓</span><div><p className="text-sm font-bold text-zinc-900 dark:text-white">On-call coordinator notified</p><p className="text-xs text-zinc-500 dark:text-zinc-400">One urgent in-app push sent</p></div></div>
                    <div className="flex items-center gap-3"><span className={`grid size-8 place-items-center rounded-full ${acknowledged ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-800"}`}>{acknowledged ? "✓" : "…"}</span><div><p className="text-sm font-bold text-zinc-900 dark:text-white">{acknowledged ? "Jordan, Foster Coordinator, acknowledged" : "Waiting for staff acknowledgment"}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">{acknowledged ? "A human is reviewing Biscuit’s information now" : "Keep this screen open or continue using FosterPack"}</p></div></div>
                  </div>

                  {messageOpen ? (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"><strong>Message channel opened.</strong><br />Jordan can see the concern details and can reply in the in-app Inbox.</div>
                  ) : (
                    <button type="button" onClick={() => setMessageOpen(true)} className="mt-4 w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-zinc-900 dark:text-emerald-200">Message the coordinator</button>
                  )}
                  <a href="tel:+14155550199" className="mt-2 flex w-full items-center justify-center rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white hover:bg-red-800">Call emergency vet · demo number</a>
                  <p className="mt-4 text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">FosterPack coordinates the alert. Medical decisions and treatment always come from authorized humans.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
