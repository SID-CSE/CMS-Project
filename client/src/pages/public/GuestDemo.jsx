import { useState } from "react";
import { useNavigate } from "react-router-dom";

const roles = {
  ADMIN: {
    label: "Admin",
    description: "Manage projects, proposals, tasks and approvals.",
    stats: [["Projects", "12"], ["Active Tasks", "8"], ["Pending Reviews", "3"], ["Completed Deliverables", "24"]],
    items: ["Website Redesign proposal ready for review", "Landing Page v2 submitted by Demo Editor", "Acme Corporation sign-off due Friday"],
  },
  EDITOR: {
    label: "Editor",
    description: "View assigned tasks and submit deliverables.",
    stats: [["My Tasks", "3"], ["Upcoming Deadlines", "2"], ["Submitted Work", "7"], ["Revision Requests", "1"]],
    items: ["Create Landing Page · In Progress", "Create About Page · Pending Review", "Fix Mobile Layout · Revision Requested"],
  },
  STAKEHOLDER: {
    label: "Stakeholder",
    description: "Create requests, review proposals and sign off deliveries.",
    stats: [["My Projects", "2"], ["Project Requests", "1"], ["Proposals", "2"], ["Feedback", "4"]],
    items: ["Website Redesign · In Progress", "Mobile App Design · Awaiting Approval", "Landing Page v2 · Ready for sign-off"],
  },
};

const workflow = [
  ["Stakeholder", "A request starts with a clear description of the work."],
  ["Project Request", "The request captures scope, goals and timeline."],
  ["Admin Review", "The admin reviews the request and creates a proposal."],
  ["Proposal", "The stakeholder accepts the proposed scope and timing."],
  ["Task Assignment", "Approved work becomes tasks assigned to editors."],
  ["Editor Work", "Editors complete work and submit deliverables."],
  ["Admin Review", "The admin approves the work or requests revisions."],
  ["Sign-off", "The stakeholder signs off and leaves feedback."],
];

const walkthrough = [
  "Request created", "Proposal created", "Proposal accepted", "Task assigned", "Editor submits work",
  "Admin reviews", "Revision requested", "Editor resubmits", "Admin approves", "Stakeholder signs off",
];

export default function GuestDemo() {
  const navigate = useNavigate();
  const [role, setRole] = useState("ADMIN");
  const [step, setStep] = useState(0);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showDisabled, setShowDisabled] = useState(false);
  const selectedRole = roles[role];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <button type="button" onClick={() => navigate("/")} className="text-left">
            <span className="block text-xl font-bold tracking-tight text-white">Contify</span>
            <span className="text-xs uppercase tracking-[0.24em] text-cyan-300">Read-only demo</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">Demo Mode</span>
            <button type="button" onClick={() => navigate("/login")} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Exit Demo</button>
          </div>
        </header>

        <section className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">DEMO MODE</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">You are exploring a read-only demonstration of Contify CMS. All data is fictional, stored only in this browser session, and cannot modify production records.</p>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Explore Contify CMS</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">See the workflow from every seat.</h1>
            <p className="mt-4 max-w-xl text-slate-300">Choose a role to tour the sample workspace. The experience mirrors the real product without creating an account, issuing a JWT, or calling the API.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {Object.entries(roles).map(([key, value]) => (
                <button key={key} type="button" onClick={() => setRole(key)} className={`rounded-xl border p-4 text-left transition ${role === key ? "border-cyan-300 bg-cyan-300/15" : "border-white/10 bg-white/5 hover:border-white/30"}`}>
                  <span className="font-bold text-white">{value.label}</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-400">{value.description}</span>
                </button>
              ))}
            </div>
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-2xl shadow-cyan-950/30">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{selectedRole.label} workspace</p><h2 className="mt-1 text-2xl font-bold text-white">{selectedRole.label} dashboard</h2></div>
              <button type="button" onClick={() => setShowDisabled(true)} className="rounded-lg border border-amber-300/50 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-300/10">Try a write action</button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">{selectedRole.stats.map(([label, value]) => <div key={label} className="rounded-xl bg-slate-900/70 p-4"><p className="text-2xl font-black text-cyan-200">{value}</p><p className="mt-1 text-xs leading-4 text-slate-400">{label}</p></div>)}</div>
            <div className="mt-6"><h3 className="font-semibold text-white">Sample activity</h3><div className="mt-3 space-y-2">{selectedRole.items.map((item) => <div key={item} className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">{item}</div>)}</div></div>
          </section>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Guided overview</p><h2 className="mt-1 text-2xl font-bold text-white">How Contify works</h2></div><button type="button" onClick={() => setShowWorkflow((value) => !value)} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200">{showWorkflow ? "Hide workflow" : "▶ See How Contify Works"}</button></div>
          {showWorkflow && <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{workflow.map(([title, description], index) => <div key={`${title}-${index}`} className="animate-[fadeIn_400ms_ease-out] rounded-xl border border-white/10 bg-slate-900/60 p-4"><span className="text-xs font-bold text-cyan-300">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-2 font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-5 text-slate-400">{description}</p></div>)}</div>}
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Website Redesign</p><h2 className="mt-1 text-2xl font-bold text-white">Sample project walkthrough</h2></div><span className="text-sm text-slate-400">Step {step + 1} of {walkthrough.length}</span></div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-300 transition-all duration-500" style={{ width: `${((step + 1) / walkthrough.length) * 100}%` }} /></div>
          <div className="mt-6 flex items-center gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-300 font-black text-slate-950">{step + 1}</div><div><h3 className="text-xl font-bold text-white">{walkthrough[step]}</h3><p className="mt-1 text-sm text-slate-400">A fictional milestone showing how work moves from request to stakeholder feedback.</p></div></div>
          <div className="mt-6 flex flex-wrap gap-3"><button type="button" disabled={step === 0} onClick={() => setStep((value) => value - 1)} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Back</button><button type="button" disabled={step === walkthrough.length - 1} onClick={() => setStep((value) => value + 1)} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-slate-400"><span>Fictional sample data only. No production records are connected.</span><div className="flex gap-4"><button type="button" onClick={() => navigate("/roles")} className="text-cyan-300 hover:text-cyan-200">Sign Up</button><button type="button" onClick={() => navigate("/login")} className="text-cyan-300 hover:text-cyan-200">Log In</button></div></footer>
      </div>
      {showDisabled && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Demo Action</p><h2 className="mt-2 text-2xl font-bold text-white">This action is disabled in Guest Mode.</h2><p className="mt-3 text-sm leading-6 text-slate-400">Sign up or log in to use the full application. The demo never creates users, changes projects, or writes to the production database.</p><div className="mt-6 flex gap-3"><button type="button" onClick={() => navigate("/roles")} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950">Sign Up</button><button type="button" onClick={() => navigate("/login")} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">Log In</button><button type="button" onClick={() => setShowDisabled(false)} className="ml-auto rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white">Close</button></div></div></div>}
    </main>
  );
}
