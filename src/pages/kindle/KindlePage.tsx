// Kindle Simple Page - Minimal UI for e-ink displays

import { useEffect, useState, useCallback } from 'react';

interface UsageData {
  sessionTokens: number;
  sessionInput: number;
  sessionOutput: number;
  sessionCwd: string;
  modelName: string;
  gitBranch: string;
  filesModified: number;
  contextPercent: number;
  cacheRemainingSeconds: number;
  sessionMessages: number;
  sessionDuration: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  totalSessions: number;
  totalMessages: number;
}

interface SystemData {
  cpu: number;
  memory: number;
  gpuUsage: number;
  networkUp: number;
  networkDown: number;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toString();
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatCacheTime(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
}

function formatSpeed(speedBps: number): string {
  if (speedBps < 1024) return `${speedBps.toFixed(0)} B/s`;
  if (speedBps < 1024 * 1024) return `${(speedBps / 1024).toFixed(1)} KB/s`;
  return `${(speedBps / 1024 / 1024).toFixed(1)} MB/s`;
}

const API_BASE = `http://${window.location.hostname}:3001/api`;

export function KindlePage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [system, setSystem] = useState<SystemData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [usageRes, sysRes] = await Promise.all([
        fetch(`${API_BASE}/usage`),
        fetch(`${API_BASE}/system`),
      ]);
      setUsage(await usageRes.json());
      setSystem(await sysRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (!usage) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  const projectName = usage.sessionCwd ? usage.sessionCwd.split(/[\\/]/).pop() : '';
  const sessionCost = (usage.sessionInput * 3.0 + usage.sessionOutput * 15.0) / 1_000_000;
  const outputRatio = usage.sessionInput + usage.sessionOutput > 0
    ? ((usage.sessionOutput / (usage.sessionInput + usage.sessionOutput)) * 100).toFixed(1)
    : '0';

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Maho-Mon</h1>
        <span style={styles.subtitle}>Claude Monitor</span>
      </header>

      {/* Session Info */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Current Session</h2>
        <div style={styles.grid}>
          <div style={styles.item}>
            <span style={styles.label}>Project</span>
            <span style={styles.value}>{projectName || '-'}</span>
          </div>
          <div style={styles.item}>
            <span style={styles.label}>Model</span>
            <span style={styles.value}>{usage.modelName || '-'}</span>
          </div>
          <div style={styles.item}>
            <span style={styles.label}>Branch</span>
            <span style={styles.value}>{usage.gitBranch || '-'}</span>
          </div>
          <div style={styles.item}>
            <span style={styles.label}>Files</span>
            <span style={styles.value}>{usage.filesModified}</span>
          </div>
        </div>

        <div style={styles.tokenBox}>
          <div style={styles.tokenValue}>{formatTokens(usage.sessionTokens)}</div>
          <div style={styles.tokenLabel}>
            In: {formatTokens(usage.sessionInput)} / Out: {formatTokens(usage.sessionOutput)}
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.half}>
            <span style={styles.label}>Context</span>
            <span style={styles.value}>{usage.contextPercent}%</span>
          </div>
          <div style={styles.half}>
            <span style={styles.label}>Cache</span>
            <span style={styles.value}>
              {usage.cacheRemainingSeconds > 0 ? formatCacheTime(usage.cacheRemainingSeconds) : 'Expired'}
            </span>
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.half}>
            <span style={styles.label}>Messages</span>
            <span style={styles.value}>{usage.sessionMessages}</span>
          </div>
          <div style={styles.half}>
            <span style={styles.label}>Duration</span>
            <span style={styles.value}>{formatDuration(usage.sessionDuration)}</span>
          </div>
        </div>
      </section>

      {/* System */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>System</h2>
        <div style={styles.barRow}>
          <span style={styles.barLabel}>CPU</span>
          <div style={styles.barBg}>
            <div style={{ ...styles.barFill, width: `${system?.cpu || 0}%` }} />
          </div>
          <span style={styles.barValue}>{Math.round(system?.cpu || 0)}%</span>
        </div>
        <div style={styles.barRow}>
          <span style={styles.barLabel}>MEM</span>
          <div style={styles.barBg}>
            <div style={{ ...styles.barFill, width: `${system?.memory || 0}%` }} />
          </div>
          <span style={styles.barValue}>{Math.round(system?.memory || 0)}%</span>
        </div>
        <div style={styles.barRow}>
          <span style={styles.barLabel}>GPU</span>
          <div style={styles.barBg}>
            <div style={{ ...styles.barFill, width: `${system?.gpuUsage || 0}%` }} />
          </div>
          <span style={styles.barValue}>{Math.round(system?.gpuUsage || 0)}%</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Network</span>
          <span style={styles.value}>
            ↑ {formatSpeed(system?.networkUp || 0)} / ↓ {formatSpeed(system?.networkDown || 0)}
          </span>
        </div>
      </section>

      {/* Total Stats */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Total Stats</h2>
        <div style={styles.tokenBox}>
          <div style={styles.tokenValue}>{formatTokens(usage.totalTokens)}</div>
          <div style={styles.tokenLabel}>Total Tokens</div>
        </div>
        <div style={styles.grid}>
          <div style={styles.item}>
            <span style={styles.label}>Input</span>
            <span style={styles.value}>{formatTokens(usage.inputTokens)}</span>
          </div>
          <div style={styles.item}>
            <span style={styles.label}>Output</span>
            <span style={styles.value}>{formatTokens(usage.outputTokens)}</span>
          </div>
          <div style={styles.item}>
            <span style={styles.label}>Cost</span>
            <span style={styles.value}>${usage.cost.toFixed(2)}</span>
          </div>
          <div style={styles.item}>
            <span style={styles.label}>Sessions</span>
            <span style={styles.value}>{usage.totalSessions}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'Georgia, serif',
    backgroundColor: '#fff',
    color: '#000',
    padding: '16px',
    minHeight: '100vh',
    lineHeight: 1.6,
  },
  header: {
    textAlign: 'center',
    borderBottom: '2px solid #000',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
  },
  section: {
    marginBottom: '20px',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    borderBottom: '1px solid #ddd',
    paddingBottom: '8px',
    marginBottom: '12px',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderTop: '1px solid #eee',
  },
  half: {
    display: 'flex',
    justifyContent: 'space-between',
    flex: 1,
    padding: '0 8px',
  },
  label: {
    fontSize: '14px',
    color: '#666',
  },
  value: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  tokenBox: {
    textAlign: 'center',
    padding: '16px',
    margin: '12px 0',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  tokenValue: {
    fontSize: '32px',
    fontWeight: 'bold',
  },
  tokenLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 0',
  },
  barLabel: {
    width: '40px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  barBg: {
    flex: 1,
    height: '12px',
    backgroundColor: '#ddd',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#000',
    transition: 'width 0.3s',
  },
  barValue: {
    width: '50px',
    textAlign: 'right',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    padding: '40px',
  },
};

export default KindlePage;