import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled Application Error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected interface error occurred. You can safely reload the page or return to the main hotel view.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-2 bg-slate-950/80 rounded border border-slate-800 text-[11px] text-rose-400 font-mono text-left break-all">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <Home className="w-4 h-4" /> Reload HABESHA-HOTEL
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

