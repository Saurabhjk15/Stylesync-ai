import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 text-white p-10 font-mono">
                    <h1 className="text-3xl text-red-500 mb-4">Something went wrong.</h1>
                    <h2 className="text-xl text-yellow-500 mb-2">{this.state.error && this.state.error.toString()}</h2>
                    <details className="whitespace-pre-wrap text-sm text-gray-400">
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        className="mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                        onClick={() => window.location.href = '/'}
                    >
                        Go Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
