import { useEffect, useMemo, useState } from "react";
import {
  api,
  DASHBOARDS,
  type SignalRow,
  type TaskRow,
  type NotificationRow,
} from "./api";

export function App() {
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [notifs, setNotifs] = useState<NotificationRow[]>([]);
  const [active, setActive] = useState<string>("ALL");

  async function load() {
    const [s, t, n] = await Promise.all([
      api.signals(),
      api.tasks(),
      api.notifications(),
    ]);
    setSignals(s);
    setTasks(t);
    setNotifs(n);
  }
  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const c = { GREEN: 0, YELLOW: 0, RED: 0 };
    for (const s of signals) c[s.signal]++;
    return c;
  }, [signals]);

  const total = signals.length || 1;
  const shown =
    active === "ALL" ? signals : signals.filter((s) => s.dashboard === active);

  async function approve(id: number) {
    try {
      await api.approve(id, "ferhan");
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="dot" />
          <span>
            <b>MTFG Paperclip</b>
            <small>Canlı Kalp · v0.3</small>
          </span>
        </div>
        <nav className="nav">
          <button
            className={`nav-item ${active === "ALL" ? "active" : ""}`}
            onClick={() => setActive("ALL")}
          >
            <span className="no">★</span> Genel Bakış
          </button>
          {DASHBOARDS.map((d) => (
            <button
              key={d.key}
              className={`nav-item ${active === d.key ? "active" : ""}`}
              onClick={() => setActive(d.key)}
            >
              <span className="no">{d.no}</span> {d.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <div>
            <h1>Komuta Paneli</h1>
            <div className="sub">
              Ritim → Rutin → Tetikleyici → Sinyal → Odak ·{" "}
              {new Date().toLocaleDateString("tr-TR")}
            </div>
          </div>
          <div className="topbar-right">
            <span className="pill">
              📥 Bildirim Kutusu <b>{notifs.length}</b>
            </span>
            <span className="avatar">FY</span>
          </div>
        </header>

        {/* Signal strip */}
        <div
          className="strip"
          title={`🟢 ${counts.GREEN}  🟡 ${counts.YELLOW}  🔴 ${counts.RED}`}
        >
          <span className="g" style={{ width: `${(counts.GREEN / total) * 100}%` }} />
          <span className="y" style={{ width: `${(counts.YELLOW / total) * 100}%` }} />
          <span className="r" style={{ width: `${(counts.RED / total) * 100}%` }} />
        </div>

        {/* Stats */}
        <section className="stats">
          <div className="card stat">
            <div className="label">Açık Sinyal</div>
            <div className="value">{signals.length}</div>
          </div>
          <div className="card stat r">
            <div className="label">🔴 Kırmızı</div>
            <div className="value">{counts.RED}</div>
          </div>
          <div className="card stat y">
            <div className="label">🟡 Sarı</div>
            <div className="value">{counts.YELLOW}</div>
          </div>
          <div className="card stat p">
            <div className="label">Onay Bekleyen</div>
            <div className="value">{notifs.length}</div>
          </div>
        </section>

        <div className="cols">
          {/* Signals */}
          <div className="card">
            <div className="section-title">
              Sinyaller{" "}
              <span className="muted" style={{ fontSize: "0.8rem" }}>
                {active === "ALL"
                  ? "tüm paneller"
                  : DASHBOARDS.find((d) => d.key === active)?.label}
              </span>
            </div>
            {shown.length === 0 && <div className="muted">Sinyal yok.</div>}
            {shown.map((s) => (
              <div className="srow" key={s.id}>
                <span className={`badge ${s.signal}`}>
                  {s.signal === "RED" ? "🔴" : s.signal === "YELLOW" ? "🟡" : "🟢"}
                </span>
                <div className="body">
                  <b>
                    {s.org_label} · {s.source}
                  </b>
                  <div className="meta">
                    {s.reason}
                    {s.suggested_action ? ` → ${s.suggested_action}` : ""}
                  </div>
                </div>
                <span className="tag">
                  {DASHBOARDS.find((d) => d.key === s.dashboard)?.no ?? "•"}
                </span>
              </div>
            ))}
          </div>

          {/* Inbox */}
          <div className="card">
            <div className="section-title">📥 Bildirim Kutusu</div>
            {notifs.length === 0 && (
              <div className="muted">Onay bekleyen taslak yok.</div>
            )}
            {notifs.map((n) => (
              <div className="notif" key={n.id}>
                <div className="head">
                  <span className="subj">{n.subject}</span>
                  <span className={`prio ${n.priority}`}>{n.priority}</span>
                </div>
                {n.draft_text && <pre>{n.draft_text}</pre>}
                <div className="guardrail">
                  ⛔ Dış gönderim yok — onay yalnızca insanın kararıdır
                </div>
                <button className="btn" onClick={() => approve(n.id)}>
                  İNSAN olarak onayla
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="card">
          <div className="section-title">📋 Odak — İş Kalemleri</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Açıklama</th>
                <th>İştirak</th>
                <th>Sorumlu</th>
                <th>Hedef</th>
                <th>Sinyal</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="muted">{t.id}</td>
                  <td>{t.description}</td>
                  <td>{t.org_slug ?? "-"}</td>
                  <td className="muted">{t.responsible_role ?? "-"}</td>
                  <td className="muted">{t.due_date ?? "—"}</td>
                  <td>
                    {t.signal ? (
                      <span className={`badge ${t.signal}`}>
                        {t.signal === "RED" ? "🔴" : t.signal === "YELLOW" ? "🟡" : "🟢"}
                      </span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`chip ${t.status}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
