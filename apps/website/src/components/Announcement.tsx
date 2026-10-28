export default function Announcement() {
  const base = import.meta.env.BASE_URL;
  const directDownload = () => {
    const a = document.createElement('a');
    a.href = `${base}downloads/DOTX_0.1.0_x64_en-US.msi`;
    a.download = 'DOTX_0.1.0_x64_en-US.msi';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  return (
    <div className="announcement" role="status" aria-live="polite">
      <span style={{ width: 6, height: 6, borderRadius: 999, background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px rgba(16,185,129,0.6)', flexShrink: 0 }} aria-hidden />
      <strong>DOTX in active development</strong>
      <span style={{ color: 'var(--text-tertiary)' }}>—</span>
      <span>Preview builds only; no stable release yet</span>
      <button onClick={directDownload} style={{ background: 'none', border: 0, color: 'var(--violet)', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'inherit' }}>
        Download preview <span aria-hidden>→</span>
      </button>
      <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>· direct from this site</span>
    </div>
  );
}
