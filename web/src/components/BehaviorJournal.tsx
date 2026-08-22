"use client";
/* eslint-disable @next/next/no-img-element -- previews use local object URLs selected by the foster */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { loadDogContext, saveDogContext } from "@/lib/profile-context";
import type { BehaviorCategory, BehaviorObservation, ConcernLevel, JournalAuthorRole, ObservationMedia } from "@/types";

const categoryLabels: Record<BehaviorCategory, string> = {
  temperament: "Temperament",
  routine: "Daily routine",
  trigger: "Trigger",
  progress: "Positive progress",
};

const concernLabels: Record<ConcernLevel, string> = {
  routine: "Routine note",
  watch: "Keep watching",
  urgent: "Contact shelter",
};

function formatObservationDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function fileToDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function inferDetails(note: string, hasVoice: boolean, hasVisual: boolean) {
  const lower = note.toLowerCase();
  const urgent = ["blood", "seizure", "collapsed", "can't breathe", "cannot breathe"].some((word) => lower.includes(word));
  const isTrigger = ["bark", "scared", "afraid", "visitor", "delivery", "noise", "pull"].some((word) => lower.includes(word));
  const isRoutine = ["breakfast", "dinner", "walk", "sleep", "water", "medication"].some((word) => lower.includes(word));
  const isProgress = ["calm", "relax", "settled", "played", "approached", "improved"].some((word) => lower.includes(word));
  const category: BehaviorCategory = isTrigger ? "trigger" : isRoutine ? "routine" : isProgress ? "progress" : "temperament";
  const concernLevel: ConcernLevel = urgent ? "urgent" : isTrigger ? "watch" : "routine";
  const fallback = hasVoice ? "Voice observation from foster home" : hasVisual ? "Visual update from foster home" : "New foster observation";
  const firstSentence = note.trim().split(/[.!?]/)[0]?.trim();
  const behavior = firstSentence ? `${firstSentence.slice(0, 90)}${firstSentence.length > 90 ? "…" : ""}` : fallback;
  const context = note.trim() || (hasVoice && hasVisual ? "Voice note and visual context added by the foster." : hasVoice ? "Voice note added by the foster." : "Photo or video context added by the foster.");
  return { category, concernLevel, behavior, context };
}

export default function BehaviorJournal({ dogId, dogName, temperament, initialObservations, authorRole = "foster", authorName }: {
  dogId: string;
  dogName: string;
  temperament: string[];
  initialObservations: BehaviorObservation[];
  authorRole?: JournalAuthorRole;
  authorName?: string;
}) {
  const [observations, setObservations] = useState(initialObservations);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [pendingMedia, setPendingMedia] = useState<ObservationMedia[]>([]);
  const [voiceMedia, setVoiceMedia] = useState<ObservationMedia | null>(null);
  const [category, setCategory] = useState<BehaviorCategory>("progress");
  const [concernLevel, setConcernLevel] = useState<ConcernLevel>("routine");
  const [sharedWithShelter, setSharedWithShelter] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTouched, setDetailsTouched] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const profileInsights = useMemo(() => [...temperament, ...observations.slice(0, 3).map((observation) => observation.behavior)], [observations, temperament]);
  const profileMedia = useMemo(() => observations.flatMap((observation) => observation.media ?? []).filter((media) => media.type !== "audio"), [observations]);

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      const stored = loadDogContext(dogId);
      if (stored) setObservations(stored.observations);
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, [dogId]);

  function resetComposer() {
    setEditingId(null); setNote(""); setPendingMedia([]); setVoiceMedia(null);
    setCategory("progress"); setConcernLevel("routine"); setSharedWithShelter(true);
    setDetailsOpen(false); setDetailsTouched(false); setRecordingError(""); setRecordingSeconds(0);
  }

  function startNew() { resetComposer(); setSavedMessage(""); setComposerOpen(true); }

  function startEdit(observation: BehaviorObservation) {
    const media = observation.media ?? [];
    setEditingId(observation.id);
    setNote(observation.context);
    setPendingMedia(media.filter((item) => item.type !== "audio"));
    setVoiceMedia(media.find((item) => item.type === "audio") ?? null);
    setCategory(observation.category); setConcernLevel(observation.concernLevel);
    setSharedWithShelter(observation.sharedWithShelter); setDetailsTouched(true);
    setDetailsOpen(false); setSavedMessage(""); setComposerOpen(true);
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null; setIsRecording(false);
  }

  function closeComposer() { if (isRecording) stopRecording(); resetComposer(); setComposerOpen(false); }

  async function startRecording() {
    setRecordingError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream; recorderRef.current = recorder; chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const url = await fileToDataUrl(blob).catch(() => URL.createObjectURL(blob));
        setVoiceMedia({ id: `voice-${Date.now()}`, type: "audio", url, name: "Foster voice note" });
        streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null;
      };
      recorder.start(); setRecordingSeconds(0); setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000);
    } catch { setRecordingError("Microphone access was not available. You can still type or add a photo/video."); }
  }

  async function addMedia(files: FileList | null) {
    if (!files) return;
    const additions = await Promise.all(Array.from(files).slice(0, Math.max(0, 4 - pendingMedia.length)).map(async (file, index) => ({
      id: `media-${Date.now()}-${index}`,
      type: file.type.startsWith("video/") ? "video" as const : "image" as const,
      url: await fileToDataUrl(file).catch(() => URL.createObjectURL(file)), name: file.name,
    })));
    setPendingMedia((current) => [...current, ...additions]);
  }

  function saveObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!note.trim() && !voiceMedia && pendingMedia.length === 0) return;
    const inferred = inferDetails(note, Boolean(voiceMedia), pendingMedia.length > 0);
    const resolvedCategory = detailsTouched ? category : inferred.category;
    const resolvedConcern = detailsTouched ? concernLevel : inferred.concernLevel;
    const media = [...(voiceMedia ? [voiceMedia] : []), ...pendingMedia];
    let nextObservations: BehaviorObservation[];
    if (editingId) {
      nextObservations = observations.map((observation) => observation.id === editingId ? { ...observation, category: resolvedCategory, concernLevel: resolvedConcern, behavior: inferred.behavior, context: inferred.context, sharedWithShelter, media } : observation);
      setSavedMessage(`${dogName}’s profile has been updated.`);
    } else {
      nextObservations = [{ id: `behavior-${Date.now()}`, category: resolvedCategory, concernLevel: resolvedConcern, behavior: inferred.behavior, context: inferred.context, observedAt: new Date().toISOString(), sharedWithShelter, media, authorRole, authorName }, ...observations];
      setSavedMessage(`This moment is now part of ${dogName}’s profile.`);
    }
    setObservations(nextObservations);
    saveDogContext(dogId, nextObservations);
    resetComposer(); setComposerOpen(false);
  }

  const hasInput = Boolean(note.trim() || voiceMedia || pendingMedia.length);

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50/70 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/25">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">{dogName}’s profile</p>
          <h3 className="mt-1 text-xl font-bold text-zinc-950 dark:text-white">Help us get to know {dogName}</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-700 dark:text-zinc-200">Speak, type, or show us a moment from home. Use one, two, or all three—whatever feels easiest.</p>
        </div>
        {!composerOpen && <button type="button" onClick={startNew} className="shrink-0 rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-600">+ Capture a moment</button>}
      </div>

      {composerOpen && (
        <form onSubmit={saveObservation} className="mx-4 mb-5 rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg dark:border-emerald-800 dark:bg-zinc-900 sm:mx-6 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">{editingId ? "Update this moment" : "Capture a moment"}</p><h4 className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">What did you notice about {dogName}?</h4></div>
            <button type="button" onClick={closeComposer} className="rounded-full px-3 py-2 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white">Cancel</button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`rounded-2xl border p-4 text-left transition ${isRecording ? "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200" : "border-emerald-200 bg-emerald-50/70 hover:border-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/30"}`}>
              <span className="text-2xl">{isRecording ? "■" : "🎤"}</span><span className="mt-2 block text-sm font-bold">{isRecording ? `Stop · 0:${String(recordingSeconds).padStart(2, "0")}` : voiceMedia ? "Record again" : "Speak"}</span><span className="mt-0.5 block text-xs opacity-70">{voiceMedia ? "Voice note ready" : "Tell us naturally"}</span>
            </button>
            <label htmlFor="behavior-note" className="cursor-text rounded-2xl border border-sky-200 bg-sky-50/70 p-4 transition hover:border-sky-400 dark:border-sky-900 dark:bg-sky-950/30"><span className="text-2xl">✍️</span><span className="mt-2 block text-sm font-bold text-zinc-900 dark:text-white">Type</span><span className="mt-0.5 block text-xs text-zinc-600 dark:text-zinc-300">One simple message</span></label>
            <label className="cursor-pointer rounded-2xl border border-amber-200 bg-amber-50/70 p-4 transition hover:border-amber-400 dark:border-amber-900 dark:bg-amber-950/30"><span className="text-2xl">📷</span><span className="mt-2 block text-sm font-bold text-zinc-900 dark:text-white">Photo or video</span><span className="mt-0.5 block text-xs text-zinc-600 dark:text-zinc-300">Add up to four</span><input type="file" accept="image/*,video/*" multiple onChange={(event) => addMedia(event.target.files)} className="sr-only" /></label>
          </div>

          {recordingError && <p role="alert" className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{recordingError}</p>}
          {voiceMedia && <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30"><span className="grid size-9 place-items-center rounded-full bg-emerald-700 text-white">🎙</span><audio src={voiceMedia.url} controls className="h-9 min-w-0 flex-1" aria-label="Recorded foster voice note" /><button type="button" onClick={() => setVoiceMedia(null)} aria-label="Remove voice note" className="grid size-8 place-items-center rounded-full text-zinc-500 hover:bg-white hover:text-zinc-900">×</button></div>}

          <label className="mt-4 block"><span className="sr-only">Anything else you noticed?</span><textarea id="behavior-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder={`Anything else you noticed? Example: ${dogName} calmed down when I sat nearby…`} className="w-full resize-y rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-950 outline-none placeholder:text-zinc-500 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-400" /></label>

          {pendingMedia.length > 0 && <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{pendingMedia.map((media) => <div key={media.id} className="relative overflow-hidden rounded-xl bg-zinc-900">{media.type === "image" ? <img src={media.url} alt={media.name} className="h-28 w-full object-cover" /> : <video src={media.url} aria-label={media.name} className="h-28 w-full object-cover" />}<button type="button" aria-label={`Remove ${media.name}`} onClick={() => setPendingMedia((current) => current.filter((item) => item.id !== media.id))} className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/75 text-sm font-bold text-white">×</button></div>)}</div>}

          <button type="button" onClick={() => setDetailsOpen((open) => !open)} className="mt-4 text-sm font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-300">{detailsOpen ? "Hide details ↑" : "Review details (optional) ↓"}</button>
          {detailsOpen && <div className="mt-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/70"><p className="text-xs leading-5 text-zinc-500 dark:text-zinc-300">FosterPack organizes these details automatically. Change them only if something looks wrong.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Moment type<select value={category} onChange={(event) => { setCategory(event.target.value as BehaviorCategory); setDetailsTouched(true); }} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Attention<select value={concernLevel} onChange={(event) => { setConcernLevel(event.target.value as ConcernLevel); setDetailsTouched(true); }} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900">{Object.entries(concernLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><label className="mt-3 flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-200"><input type="checkbox" checked={sharedWithShelter} onChange={(event) => setSharedWithShelter(event.target.checked)} className="size-4 accent-emerald-700" />Share this update with {dogName}’s shelter care team</label></div>}

          <button type="submit" disabled={!hasInput} className="mt-5 w-full rounded-xl bg-emerald-800 px-5 py-3.5 text-base font-bold text-white shadow-md transition enabled:hover:-translate-y-0.5 enabled:hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-600">{editingId ? `Update ${dogName}’s profile` : `Add to ${dogName}’s profile →`}</button><p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">You can review and update this moment anytime.</p>
        </form>
      )}

      <div className="border-y border-emerald-100 bg-white/80 px-5 py-4 dark:border-emerald-900 dark:bg-zinc-950/40 sm:px-6">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">What {dogName}’s care circle knows</p><div className="mt-2 flex flex-wrap gap-2">{profileInsights.map((insight, index) => <span key={`${insight}-${index}`} className={`rounded-full px-3 py-1 text-xs font-medium ${index < temperament.length ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"}`}>{insight}</span>)}</div>
        {profileMedia.length > 0 && <div className="mt-4"><p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Latest photos and videos from home</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{profileMedia.slice(0, 4).map((media) => media.type === "image" ? <img key={media.id} src={media.url} alt={media.name} className="h-24 w-full rounded-xl object-cover ring-1 ring-emerald-100" /> : <video key={media.id} src={media.url} aria-label={media.name} controls className="h-24 w-full rounded-xl bg-black object-cover" />)}</div></div>}
      </div>

      {savedMessage && <div role="status" className="mx-5 mt-4 flex flex-col gap-3 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 sm:mx-6 sm:flex-row sm:items-center sm:justify-between"><span>✓ {savedMessage}</span><Link href="/admin/fosters/f1" className="w-fit rounded-full bg-white px-3 py-2 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-50 dark:bg-zinc-900 dark:text-emerald-200">Demo: view updated admin context →</Link></div>}

      <div className="flex flex-col gap-3 p-5 sm:p-6">
        {observations.map((observation) => {
          const audio = observation.media?.find((media) => media.type === "audio");
          const visuals = observation.media?.filter((media) => media.type !== "audio") ?? [];
          return <article key={observation.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="flex items-start justify-between gap-4"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">{categoryLabels[observation.category]}</span><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${observation.concernLevel === "urgent" ? "bg-red-100 text-red-800" : observation.concernLevel === "watch" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-700"}`}>{concernLabels[observation.concernLevel]}</span></div><button type="button" onClick={() => startEdit(observation)} className="shrink-0 rounded-full px-3 py-1.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300">Update</button></div><h4 className="mt-3 font-bold text-zinc-950 dark:text-white">{observation.behavior}</h4><p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{observation.context}</p>{audio && <audio src={audio.url} controls className="mt-3 h-10 w-full" aria-label="Foster voice observation" />}{visuals.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{visuals.map((media) => media.type === "image" ? <img key={media.id} src={media.url} alt={media.name} className="h-32 w-full rounded-xl object-cover" /> : <video key={media.id} src={media.url} aria-label={media.name} controls className="h-32 w-full rounded-xl bg-black object-cover" />)}</div>}<div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400"><span>{formatObservationDate(observation.observedAt)}</span><span>{observation.sharedWithShelter ? "✓ Shared with shelter" : "Private foster note"}</span></div></article>;
        })}
      </div>
    </section>
  );
}
