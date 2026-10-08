"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      return (
        <div className="min-h-screen bg-[#181818] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">Something went wrong</h1>
            <p className="text-zinc-400 mb-6">
              We caught an unexpected error. The development team has been notified.
            </p>
            {process.env.NODE_ENV === "development" && error && (
              <details className="text-left bg-[#1f1f1f] rounded-xl p-4 mb-6 text-xs text-zinc-500 max-h-64 overflow-auto">
                <summary className="cursor-pointer font-medium text-zinc-300 mb-2">Error Details</summary>
                <pre>{error.toString()}</pre>
                {errorInfo?.componentStack && (
                  <pre className="mt-2">{errorInfo.componentStack}</pre>
                )}
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#58c28d] text-sm font-semibold text-[#181818] transition hover:brightness-110"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-[#1f1f1f] text-sm font-medium text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;