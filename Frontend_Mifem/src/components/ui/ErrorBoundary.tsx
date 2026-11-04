import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-slate-950">
          <div className="text-center px-4">
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Welcome to MIFEM
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/60 max-w-xl mx-auto">
              Something went wrong loading the hero section. Please refresh the page.
            </p>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
