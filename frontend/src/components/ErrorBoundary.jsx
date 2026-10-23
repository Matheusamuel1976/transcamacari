import { Component } from 'react';

export class ErrorBoundary extends Component {
  static propTypes = { children: (props, name) => props[name] == null ? new Error('ErrorBoundary requer conteúdo.') : null };
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error('Falha de renderização', error, info.componentStack); }
  render() {
    if (this.state.failed) return (
      <section className="container" role="alert" style={{ paddingBlock: '8rem' }}>
        <h1>Não foi possível abrir esta página.</h1>
        <p>Seus dados foram preservados. Tente recarregar ou volte para a consulta de linhas.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Tentar novamente</button>{' '}
        <a href="/linhas">Consultar linhas</a>
      </section>
    );
    return this.props.children;
  }
}
