import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Brand } from './Brand';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Trip render error:', error, info.componentStack); }
  render() {
    if (this.state.failed) return <main className="session-loading"><Brand /><h1>Vamos retomar sua viagem?</h1><p>Ocorreu um problema ao abrir esta tela.</p><button className="auth-submit" style={{ width: 'auto', padding: '14px 24px' }} onClick={() => window.location.reload()}>Recarregar aplicativo</button></main>;
    return this.props.children;
  }
}
