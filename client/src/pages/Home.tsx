import { FormEvent, useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Fingerprint,
  Landmark,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const MAP_URL = "https://maps.app.goo.gl/teUrUsAM1ZpB8xB26";
const PHONE = "+880 1717-098287";

const services = [
  {
    icon: Banknote,
    number: "01",
    title: "Deposit & cash access",
    body: "Get support with everyday cash deposits and withdrawals through the local agent outlet, subject to Bank Asia rules and verification.",
  },
  {
    icon: WalletCards,
    number: "02",
    title: "Account & account-service support",
    body: "Ask about account opening support, balance-related service needs, and the documents you may need before visiting.",
  },
  {
    icon: Send,
    number: "03",
    title: "Remittance & benefit access",
    body: "Receive guidance for inward remittance and selected government or social-safety-net payment services available through agent banking.",
  },
  {
    icon: UsersRound,
    number: "04",
    title: "Local digital support",
    body: "Use a nearby access point for banking questions, digital-service guidance, and help understanding your next step.",
  },
];

const queryTypes = [
  "Agent banking service",
  "Account opening support",
  "Cash deposit or withdrawal",
  "Remittance or benefit payment",
  "Digital Centre service",
  "Other question",
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    queryType: queryTypes[0],
    message: "",
    consentGiven: false,
  });
  const submitQuery = trpc.queries.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: "", phone: "", email: "", queryType: queryTypes[0], message: "", consentGiven: false });
      toast.success("Your query is with the outlet team.");
    },
    onError: error => toast.error(error.message || "We could not send your query. Please try again."),
  });

  const update = (field: keyof typeof form, value: string | boolean) => setForm(current => ({ ...current, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    if (!form.consentGiven) {
      toast.error("Please confirm that we may use your details to respond.");
      return;
    }
    submitQuery.mutate({ ...form, consentGiven: true });
  };

  return (
    <div className="site-shell">
      <div className="notice-bar">
        <div className="page-width notice-inner">
          <span className="notice-dot" />
          <span>Local agent-banking access point</span>
          <span className="notice-separator">·</span>
          <span>Not a Bank Asia branch or corporate website</span>
          <a href="/admin" className="notice-admin">Staff sign-in <ArrowUpRight size={13} /></a>
        </div>
      </div>

      <header className="site-header">
        <div className="page-width header-inner">
          <a className="brand-lockup" href="#top" aria-label="Jhenaidah Pourshova Bank Asia Agent Banking home">
            <span className="brand-mark"><span /></span>
            <span className="brand-copy"><strong>Bank Asia</strong><small>Agent Banking · Jhenaidah</small></span>
          </a>
          <button className="mobile-menu" onClick={() => setMenuOpen(value => !value)} aria-label="Toggle navigation">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className={menuOpen ? "main-nav is-open" : "main-nav"}>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#partnership" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#visit" onClick={() => setMenuOpen(false)}>Find us</a>
            <a className="nav-cta" href="#ask" onClick={() => setMenuOpen(false)}>Ask a question <ArrowUpRight size={15} /></a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-grid page-width">
            <div className="hero-copy">
              <div className="eyebrow light-eyebrow"><span>JHENAIDAH POURSHOVA</span><span className="eyebrow-line" /></div>
              <h1>Everyday banking,<br /><em>closer to home.</em></h1>
              <p className="hero-lede">A trusted local access point for Bank Asia agent banking — with practical help, clear guidance, and a team that knows the community.</p>
              <div className="hero-actions">
                <a className="button button-violet" href="#services">Explore services <ChevronRight size={17} /></a>
                <a className="text-link light-link" href={`tel:${PHONE.replace(/\s/g, "")}`}><Phone size={16} /> Call the outlet</a>
              </div>
              <div className="hero-footnote"><ShieldCheck size={16} /> Agent banking under Bank Asia PLC · supported by a2i Digital Centre model</div>
            </div>
            <div className="hero-panel-wrap">
              <div className="hero-orbit orbit-one" />
              <div className="hero-orbit orbit-two" />
              <div className="hero-panel">
                <div className="panel-topline"><span className="live-pill"><span /> Local access point</span><span className="panel-code">01 / 04</span></div>
                <div className="panel-icon-row"><span className="panel-icon"><Fingerprint size={28} /></span><span className="panel-label">What this means</span></div>
                <h2>Banking support with a human face.</h2>
                <p>Agent banking brings selected banking services closer to people, especially where a full branch is not nearby.</p>
                <div className="panel-checks">
                  <span><CheckCircle2 size={16} /> Clear next steps</span>
                  <span><CheckCircle2 size={16} /> Local guidance</span>
                  <span><CheckCircle2 size={16} /> Secure verification</span>
                </div>
                <a className="panel-link" href="#ask">Tell us what you need <ArrowUpRight size={16} /></a>
              </div>
            </div>
          </div>
          <div className="hero-stripe" />
        </section>

        <section className="trust-row">
          <div className="page-width trust-grid">
            <div className="trust-intro"><span className="trust-kicker">YOUR NEARBY ACCESS POINT</span><strong>Jhenaidah 7300</strong></div>
            <div className="trust-item"><MapPin size={19} /><span><small>Located at</small>Municipality Building</span></div>
            <div className="trust-item"><Phone size={19} /><span><small>Call the team</small>{PHONE}</span></div>
            <div className="trust-item"><Clock3 size={19} /><span><small>Listing detail</small>Opens 9:00 AM Sunday</span></div>
          </div>
        </section>

        <section className="section section-services" id="services">
          <div className="page-width">
            <div className="section-heading split-heading">
              <div><div className="eyebrow"><span>01 · SERVICES</span><span className="eyebrow-line" /></div><h2>Useful banking,<br /><em>without the long trip.</em></h2></div>
              <p>Start with the service you need. Our team can explain what is available through this agent outlet and what documents or verification may be required.</p>
            </div>
            <div className="service-grid">
              {services.map(service => (
                <article className="service-card" key={service.number}>
                  <div className="service-top"><span className="service-number">{service.number}</span><span className="service-icon"><service.icon size={22} /></span></div>
                  <h3>{service.title}</h3><p>{service.body}</p><a href="#ask" className="card-link">Ask about this <ArrowUpRight size={15} /></a>
                </article>
              ))}
            </div>
            <p className="small-note"><span className="note-mark">i</span> Service availability, limits, fees, and verification follow Bank Asia PLC policy. This outlet does not present itself as a full branch.</p>
          </div>
        </section>

        <section className="section partnership-section" id="partnership">
          <div className="page-width partnership-grid">
            <div className="partnership-copy">
              <div className="eyebrow"><span>02 · HOW IT WORKS</span><span className="eyebrow-line" /></div>
              <h2>Three partners.<br /><em>One closer-to-home experience.</em></h2>
              <p>Bank Asia PLC’s agent-banking model extends selected financial services beyond traditional branches. In Bangladesh, a2i helps Digital Centres become trusted last-mile access points for people and entrepreneurs.</p>
              <div className="source-links"><a href="http://www.bankasia-bd.com/agentbanking" target="_blank" rel="noreferrer">Bank Asia agent banking <ExternalLink size={14} /></a><a href="https://digitalcentre.gov.bd/page/core-initiatives" target="_blank" rel="noreferrer">a2i Digital Centre initiative <ExternalLink size={14} /></a></div>
            </div>
            <div className="partnership-rail">
              <div className="rail-item"><span className="rail-number">01</span><div><span className="rail-tag">BANKING PARTNER</span><h3>Bank Asia PLC</h3><p>Banking products, policy, transaction systems, and agent-network oversight.</p></div><Landmark size={22} /></div>
              <div className="rail-connector" />
              <div className="rail-item active"><span className="rail-number">02</span><div><span className="rail-tag">GOVERNMENT INNOVATION</span><h3>a2i · Aspire to Innovate</h3><p>Helping bring essential digital and financial services to the last mile.</p></div><Building2 size={22} /></div>
              <div className="rail-connector" />
              <div className="rail-item"><span className="rail-number">03</span><div><span className="rail-tag">LOCAL ACCESS</span><h3>Digital Centre model</h3><p>Community-based entrepreneurs help people access services closer to home.</p></div><UsersRound size={22} /></div>
            </div>
          </div>
        </section>

        <section className="section ask-section" id="ask">
          <div className="page-width ask-grid">
            <div className="ask-intro">
              <div className="eyebrow light-eyebrow"><span>03 · HAVE A QUESTION?</span><span className="eyebrow-line" /></div>
              <h2>Let’s make your<br /><em>next step clear.</em></h2>
              <p>Share a few details and the outlet team can follow up. Please do not include passwords, PINs, full NID numbers, or sensitive account credentials in this form.</p>
              <div className="ask-contact"><MessageCircle size={20} /><span><small>Prefer to speak?</small><a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a></span></div>
            </div>
            <div className="query-card">
              {submitted ? (
                <div className="success-state"><span className="success-icon"><CheckCircle2 size={28} /></span><span className="eyebrow"><span>QUERY RECEIVED</span><span className="eyebrow-line" /></span><h3>Thanks — your message is on its way.</h3><p>Our outlet team will review your question and use the contact details you provided to follow up.</p><button className="button button-outline" onClick={() => setSubmitted(false)}>Send another question <ArrowUpRight size={16} /></button></div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-head"><span className="form-step">SEND A QUERY</span><span className="form-required">* Required</span></div>
                  <div className="form-row"><label>Name *<input required value={form.name} onChange={event => update("name", event.target.value)} placeholder="Your full name" /></label><label>Phone *<input required value={form.phone} onChange={event => update("phone", event.target.value)} placeholder="01XXXXXXXXX" /></label></div>
                  <div className="form-row"><label>Email <span className="label-muted">(optional)</span><input type="email" value={form.email} onChange={event => update("email", event.target.value)} placeholder="you@example.com" /></label><label>What is this about? *<select value={form.queryType} onChange={event => update("queryType", event.target.value)}>{queryTypes.map(type => <option key={type}>{type}</option>)}</select></label></div>
                  <label>How can we help? *<textarea required minLength={10} value={form.message} onChange={event => update("message", event.target.value)} placeholder="Tell us what you would like to know..." rows={5} /></label>
                  <label className="consent-label"><input type="checkbox" checked={form.consentGiven} onChange={event => update("consentGiven", event.target.checked)} /><span>I agree that the outlet team may use these details to respond to my query. Please do not share sensitive banking credentials here.</span></label>
                  <button className="button button-primary form-submit" type="submit" disabled={submitQuery.isPending}>{submitQuery.isPending ? "Sending..." : "Send my query"} <Send size={16} /></button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="section visit-section" id="visit">
          <div className="page-width visit-grid">
            <div className="visit-map-card"><div className="map-lines map-lines-one" /><div className="map-lines map-lines-two" /><div className="map-pin"><MapPin size={21} /></div><div className="map-label"><span className="map-label-dot" /> Verified listing</div><div className="map-caption"><span>G5VF+QQ</span><strong>Jhenaidah, Bangladesh</strong></div></div>
            <div className="visit-copy"><div className="eyebrow"><span>04 · FIND THE OUTLET</span><span className="eyebrow-line" /></div><h2>Come by when<br /><em>you’re nearby.</em></h2><div className="address-block"><MapPin size={19} /><div><strong>Jhenaidah Pourshova Bank Asia Agent Bank</strong><span>Municipality Building, Jhenaidah 7300, Bangladesh</span></div></div><div className="visit-actions"><a className="button button-primary" href={MAP_URL} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={16} /></a><a className="text-link dark-link" href={`tel:${PHONE.replace(/\s/g, "")}`}><Phone size={16} /> {PHONE}</a></div><p className="small-note"><span className="note-mark">i</span> Google Maps listing currently shows “Opens 9 am Sun”. Please call ahead for current hours on other days.</p></div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="page-width footer-grid"><div className="footer-brand"><a className="brand-lockup light-brand" href="#top"><span className="brand-mark"><span /></span><span className="brand-copy"><strong>Bank Asia</strong><small>Agent Banking · Jhenaidah</small></span></a><p>A local agent-banking access point working under Bank Asia PLC’s agent network and the a2i Digital Centre model.</p></div><div className="footer-column"><span className="footer-label">Explore</span><a href="#services">Services</a><a href="#partnership">How it works</a><a href="#ask">Ask a question</a></div><div className="footer-column"><span className="footer-label">Official references</span><a href="http://www.bankasia-bd.com/agentbanking" target="_blank" rel="noreferrer">Bank Asia PLC <ExternalLink size={13} /></a><a href="https://digitalcentre.gov.bd/page/core-initiatives" target="_blank" rel="noreferrer">Digital Centre / a2i <ExternalLink size={13} /></a><a href={MAP_URL} target="_blank" rel="noreferrer">Google Maps listing <ExternalLink size={13} /></a></div></div><div className="page-width footer-bottom"><span>© {new Date().getFullYear()} Jhenaidah Pourshova Bank Asia Agent Bank</span><span>Local outlet website · not the official bank website</span></div></footer>
    </div>
  );
}
