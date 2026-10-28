export default function Announcement() {
  // Truthful: in active development, preview-only releases
  return (
    <div className="announcement" role="status" aria-live="polite">
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: '#10B981',
          display: 'inline-block',
          boxShadow: '0 0 8px rgba(16,185,129,0.6)',
          flexShrink: 0,
        }}
        aria-hidden
      />
      <strong>DOTX in active development</strong>
      <span style={{ color: 'var(--text-tertiary)' }}>—</span>
      <span>Preview builds only; no stable release yet</span>
      <a href={`${import.meta.env.BASE_URL}download`}>
        Download preview
        <span aria-hidden>→</span>
      </a>
    </div>
  );
}
