import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Inbox,
  LogIn,
  MessageCircle,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const statusLabels = { new: "New", in_progress: "In progress", resolved: "Resolved" } as const;
type Status = keyof typeof statusLabels;

type QueryRecord = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  queryType: string;
  message: string;
  status: Status;
  internalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export default function Admin() {
  const [localUsername, setLocalUsername] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<QueryRecord | null>(null);
  const [editStatus, setEditStatus] = useState<Status>("new");
  const [notes, setNotes] = useState("");
  const me = trpc.auth.me.useQuery();
  const queryList = trpc.queries.adminList.useQuery(filter === "all" ? undefined : { status: filter }, { enabled: me.data?.role === "admin" });
  const exportList = trpc.queries.adminList.useQuery(undefined, { enabled: me.data?.role === "admin" });
  const updateQuery = trpc.queries.adminUpdate.useMutation({
    onSuccess: async () => { toast.success("Query updated."); await queryList.refetch(); setSelected(null); },
    onError: error => toast.error(error.message),
  });
  const deleteQuery = trpc.queries.adminDelete.useMutation({
    onSuccess: async () => { toast.success("Query removed."); await queryList.refetch(); setSelected(null); },
    onError: error => toast.error(error.message),
  });

  const records = (queryList.data ?? []) as QueryRecord[];
  const counts = useMemo(() => ({ all: records.length, new: records.filter(record => record.status === "new").length, in_progress: records.filter(record => record.status === "in_progress").length, resolved: records.filter(record => record.status === "resolved").length }), [records]);

  const openRecord = (record: QueryRecord) => { setSelected(record); setEditStatus(record.status); setNotes(record.internalNotes ?? ""); };

  const exportQueries = () => {
    const exportRecords = (exportList.data ?? []) as QueryRecord[];
    if (!exportRecords.length) {
      toast.info("There are no customer queries to export yet.");
      return;
    }
    const header = ["ID", "Name", "Phone", "Email", "Query type", "Message", "Status", "Internal notes", "Submitted", "Updated"];
    const rows = exportRecords.map(record => [record.id, record.name, record.phone, record.email, record.queryType, record.message, statusLabels[record.status], record.internalNotes, formatDate(record.createdAt), formatDate(record.updatedAt)]);
    const csv = "\uFEFF" + [header, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agent-banking-queries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`${exportRecords.length} quer${exportRecords.length === 1 ? "y" : "ies"} exported.`);
  };

  const submitLocalLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalSubmitting(true);
    setLocalError("");
    try {
      const response = await fetch("/api/local-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: localUsername, password: localPassword }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Could not sign in.");
      window.location.reload();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setLocalSubmitting(false);
    }
  };

  const localLogout = async () => {
    await fetch("/api/local-admin/logout", { method: "POST", credentials: "include" });
    window.location.reload();
  };

  if (me.isLoading) return <div className="admin-loading"><RefreshCw className="spin" size={22} /> Checking staff access...</div>;

  if (!me.data) return (
    <div className="admin-gate"><div className="admin-gate-card"><a className="back-link" href="/"><ArrowLeft size={15} /> Back to public site</a><span className="gate-icon"><ShieldCheck size={30} /></span><span className="eyebrow"><span>STAFF AREA</span><span className="eyebrow-line" /></span><h1>Keep customer questions moving.</h1><p>Use the project owner’s Manus account, or sign in with the local admin credentials configured for this outlet.</p><button className="button button-primary" onClick={() => startLogin()}>Sign in with Manus <LogIn size={16} /></button><div className="login-divider"><span>or use local admin login</span></div><form className="local-login-form" onSubmit={submitLocalLogin}><label>Username<input required value={localUsername} onChange={event => setLocalUsername(event.target.value)} autoComplete="username" placeholder="Admin username" /></label><label>Password<input required type="password" value={localPassword} onChange={event => setLocalPassword(event.target.value)} autoComplete="current-password" placeholder="Admin password" /></label>{localError && <p className="local-login-error">{localError}</p>}<button className="button button-outline local-login-button" type="submit" disabled={localSubmitting}><KeyRound size={15} /> {localSubmitting ? "Signing in..." : "Sign in locally"}</button></form></div></div>
  );

  if (me.data.role !== "admin") return (
    <div className="admin-gate"><div className="admin-gate-card"><a className="back-link" href="/"><ArrowLeft size={15} /> Back to public site</a><span className="gate-icon warning"><UserRound size={30} /></span><span className="eyebrow"><span>ACCESS LIMITED</span><span className="eyebrow-line" /></span><h1>This account is not an admin.</h1><p>You are signed in as <strong>{me.data.name || me.data.email || "a staff user"}</strong>, but the dashboard is limited to authorized admin accounts.</p><a className="button button-outline" href="/">Return to public site <ArrowLeft size={16} /></a></div></div>
  );

  return (
    <div className="admin-shell">
      <header className="admin-header"><div className="page-width admin-header-inner"><a className="brand-lockup" href="/"><span className="brand-mark"><span /></span><span className="brand-copy"><strong>Bank Asia</strong><small>Agent Banking · Staff dashboard</small></span></a><div className="admin-user"><span><small>Signed in as</small>{me.data.name || me.data.email || "Admin"}</span>{me.data.loginMethod === "local" && <button className="admin-logout" onClick={localLogout}>Sign out</button>}<a href="/">Public site <ArrowLeft size={14} /></a></div></div></header>
      <main className="admin-main page-width">
        <div className="admin-title-row"><div><div className="eyebrow"><span>STAFF DASHBOARD</span><span className="eyebrow-line" /></div><h1>Customer queries</h1><p>Review questions from the Jhenaidah Pourshova outlet website and keep each response moving.</p></div><div className="admin-title-actions"><button className="button button-outline refresh-button" onClick={() => queryList.refetch()}><RefreshCw size={15} className={queryList.isFetching ? "spin" : ""} /> Refresh</button><button className="button button-primary refresh-button" onClick={exportQueries} disabled={exportList.isLoading}><Download size={15} /> Export CSV</button></div></div>
        <div className="metrics-grid"><div className="metric-card"><span className="metric-icon"><Inbox size={18} /></span><span className="metric-label">All queries</span><strong>{counts.all}</strong><span className="metric-foot">Visible in this view</span></div><div className="metric-card accent-new"><span className="metric-icon"><MessageCircle size={18} /></span><span className="metric-label">New</span><strong>{counts.new}</strong><span className="metric-foot">Needs first review</span></div><div className="metric-card accent-progress"><span className="metric-icon"><Clock3 size={18} /></span><span className="metric-label">In progress</span><strong>{counts.in_progress}</strong><span className="metric-foot">Being followed up</span></div><div className="metric-card accent-resolved"><span className="metric-icon"><CheckCircle2 size={18} /></span><span className="metric-label">Resolved</span><strong>{counts.resolved}</strong><span className="metric-foot">Closed by the team</span></div></div>
        <div className="admin-workspace"><section className="query-list-card"><div className="list-head"><div><span className="section-label">INBOX</span><h2>Recent questions</h2></div><label className="filter-control"><span>Filter</span><select value={filter} onChange={event => setFilter(event.target.value as "all" | Status)}><option value="all">All statuses</option><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select><ChevronDown size={14} /></label></div>{queryList.isLoading ? <div className="empty-state"><RefreshCw className="spin" size={20} /> Loading queries...</div> : queryList.isError ? <div className="empty-state error-state">Could not load query records. Please refresh and try again.</div> : records.length === 0 ? <div className="empty-state"><Inbox size={24} /><strong>No questions here yet.</strong><span>New customer queries will appear in this inbox.</span></div> : <div className="query-list">{records.map(record => <button className={selected?.id === record.id ? "query-row selected" : "query-row"} key={record.id} onClick={() => openRecord(record)}><span className="query-avatar">{record.name.slice(0, 1).toUpperCase()}</span><span className="query-summary"><strong>{record.name}</strong><span>{record.queryType} · {formatDate(record.createdAt)}</span></span><span className={`status-chip ${record.status}`}>{statusLabels[record.status]}</span><ChevronDown className="row-chevron" size={15} /></button>)}</div>}</section>
          <aside className={selected ? "query-detail-card is-open" : "query-detail-card"}>{selected ? <><div className="detail-head"><div><span className="section-label">QUERY #{String(selected.id).padStart(4, "0")}</span><h2>{selected.name}</h2></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close query"><X size={18} /></button></div><div className="detail-meta"><a href={`tel:${selected.phone.replace(/\s/g, "")}`}><PhoneIcon /> {selected.phone}</a>{selected.email && <a href={`mailto:${selected.email}`}><MailIcon /> {selected.email}</a>}</div><div className="detail-field"><span>Topic</span><strong>{selected.queryType}</strong></div><div className="detail-field"><span>Customer message</span><p>{selected.message}</p></div><div className="detail-field"><label htmlFor="status">Status</label><select id="status" value={editStatus} onChange={event => setEditStatus(event.target.value as Status)}><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></div><div className="detail-field"><label htmlFor="notes">Internal notes</label><textarea id="notes" value={notes} onChange={event => setNotes(event.target.value)} placeholder="Add a private follow-up note..." rows={4} /></div><div className="detail-actions"><button className="button button-primary" disabled={updateQuery.isPending} onClick={() => updateQuery.mutate({ id: selected.id, status: editStatus, internalNotes: notes })}><Save size={15} /> {updateQuery.isPending ? "Saving..." : "Save changes"}</button><button className="delete-button" disabled={deleteQuery.isPending} onClick={() => { if (window.confirm("Remove this query from the dashboard?")) deleteQuery.mutate({ id: selected.id }); }}><Trash2 size={15} /> Remove record</button></div><span className="detail-created">Submitted {formatDate(selected.createdAt)}</span></> : <div className="detail-placeholder"><span className="placeholder-icon"><MessageCircle size={24} /></span><strong>Select a query</strong><span>Choose a customer question to review its details and update the follow-up status.</span></div>}</aside>
        </div>
      </main>
    </div>
  );
}

function PhoneIcon() { return <span className="tiny-icon">☎</span>; }
function MailIcon() { return <span className="tiny-icon">✉</span>; }
