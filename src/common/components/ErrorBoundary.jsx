import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log 3D-specific errors for debugging
    if (error.message?.includes('WebGL') || error.message?.includes('three') || error.message?.includes('Canvas')) {
      console.warn('3D rendering error detected. Falling back to static content.');
    }
  }

  render() {
    if (this.state.hasError) {
      // If there's a custom fallback, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback: show a proper error message
      return (
        <div style={{ 
          padding: '2rem', 
          color: 'white', 
          textAlign: 'center',
          backgroundColor: '#dc2626',
          margin: '1rem',
          borderRadius: '0.5rem'
        }}>
          <h2>Something went wrong</h2>
          <p>The application encountered an error. Please refresh the page to try again.</p>
          <details style={{ marginTop: '1rem', textAlign: 'left' }}>
            <summary>Error Details</summary>
            <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

