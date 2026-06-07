/**
 * StatusBar — shows server connection status
 */

interface Props {
  status: 'disconnected' | 'connecting' | 'connected';
  port: number | null;
}

export function StatusBar({ status, port }: Props): JSX.Element {
  const label = status === 'connected' ? `Running on :${port}` : status === 'connecting' ? 'Starting…' : 'Offline';
  const cls = `status-dot status-dot--${status}`;
  return (
    <div className="status-bar">
      <span className={cls} />
      <span className="status-label">{label}</span>
    </div>
  );
}
