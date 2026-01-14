import React, { useEffect } from 'react';
import {
    Plus,
    MessageSquare,
    Trash2,
    Clock,
    Bot,
    X
} from 'lucide-react';

const Sidebar = ({
    sessions,
    currentSessionId,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    isVisible,
    onToggle
}) => {
    // Format timestamp to readable date
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
    };

    // ESC key handler - close sidebar when ESC is pressed
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && isVisible) {
                onToggle();
            }
        };

        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [isVisible, onToggle]);

    // Don't render if not visible
    if (!isVisible) return null;

    return (
        <>
            {/* Dark Overlay */}
            <div
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                onClick={onToggle}
            />

            {/* Sidebar Drawer - Always Fixed */}
            <div className="fixed left-0 top-0 z-50 h-full w-3/4 md:w-80 bg-slate-950 border-r border-slate-800 flex flex-col shadow-2xl animate-slide-in">

                {/* Header with Logo & Close Button */}
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-white text-lg">Mango<span className="text-orange-400">Helpdesk</span></h1>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Chat History</p>
                            </div>
                        </div>
                        <button
                            onClick={onToggle}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* New Chat Button */}
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 
                       bg-gradient-to-r from-orange-500 to-red-500 
                       hover:from-orange-600 hover:to-red-600 
                       text-white font-semibold rounded-xl 
                       transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                       shadow-lg shadow-orange-500/25"
                    >
                        <Plus className="w-5 h-5" />
                        New Chat
                    </button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider px-2 mb-2">
                        Recent Conversations
                    </p>

                    {sessions.length === 0 ? (
                        <div className="text-center py-8 text-slate-600">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No conversations yet</p>
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => onSelectSession(session.id)}
                                className={`
                                    group relative p-3 rounded-xl cursor-pointer
                                    transition-all duration-200
                                    ${session.id === currentSessionId
                                        ? 'bg-slate-800 border border-orange-500/50'
                                        : 'hover:bg-slate-800/50 border border-transparent'}
                                `}
                            >
                                <div className="flex items-start gap-3">
                                    <MessageSquare className={`w-4 h-4 mt-0.5 shrink-0 ${session.id === currentSessionId ? 'text-orange-400' : 'text-slate-500'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium line-clamp-2 ${session.id === currentSessionId ? 'text-white' : 'text-slate-300'
                                            }`}>
                                            {session.title || 'New Chat'}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3 text-slate-600" />
                                            <span className="text-[10px] text-slate-600">
                                                {formatDate(session.updatedAt || session.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this chat history?')) {
                                            onDeleteSession(session.id);
                                        }
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2
                                opacity-0 group-hover:opacity-100
                                hover:bg-red-500/20 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Context-Aware Mode Active
                    </div>
                </div>
            </div >

            {/* Inline animation style */}
            < style > {`
                @keyframes slide-in {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default Sidebar;

