import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '30px',
          margin: '20px auto',
          maxWidth: '800px',
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          color: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <AlertTriangle size={24} color="#F43F5E" />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F43F5E' }}>組件渲染遇到異常</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '14px' }}>
            {this.state.error?.toString() || '未知錯誤'}
          </p>
          <pre style={{
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '11px',
            overflowX: 'auto',
            color: '#94a3b8',
            marginBottom: '16px'
          }}>
            {this.state.error?.stack || ''}
          </pre>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#F43F5E',
              color: '#fff',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} /> 重新整理組件
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
