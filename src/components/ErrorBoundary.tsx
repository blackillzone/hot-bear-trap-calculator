import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — Capture les erreurs de rendu React et affiche un fallback propre.
 *
 * Enveloppe l'arbre principal pour éviter un écran blanc en cas d'erreur inattendue.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
          <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center space-y-4">
            <p className="text-3xl">⚠️</p>
            <h1 className="text-lg font-bold text-white">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-400">
              An unexpected error occurred. Your saved profiles are safe in
              localStorage.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-600 font-mono bg-gray-800 rounded px-3 py-2 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
