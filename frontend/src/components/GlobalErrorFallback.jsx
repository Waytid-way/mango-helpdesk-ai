
import { AlertTriangle, RotateCcw } from 'lucide-react';

export const GlobalErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
                <p className="text-slate-400 mb-6">
                    The application encountered an unexpected error. Our team has been notified.
                </p>

                <div className="bg-slate-950 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32 border border-slate-800">
                    <code className="text-xs text-red-400 font-mono">
                        {error.message}
                    </code>
                </div>

                <button
                    onClick={resetErrorBoundary}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all active:scale-95"
                >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                </button>
            </div>
        </div>
    );
};
