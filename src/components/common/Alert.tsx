interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    onDismiss?: () => void;
}

const typeStyles = {
    success: 'bg-emerald-900/50 border-success text-emerald-200',
    error: 'bg-red-900/50 border-danger text-red-200',
    warning: 'bg-amber-900/50 border-warning text-amber-200',
    info: 'bg-blue-900/50 border-blue-500 text-blue-200',
};

const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
};

export function Alert({ type, message, onDismiss }: AlertProps) {
    return (
        <div className={`border rounded-lg p-3 flex items-start gap-2 ${typeStyles[type]}`} role="alert">
            <span className="font-bold text-sm flex-shrink-0 mt-0.5">{icons[type]}</span>
            <p className="text-sm flex-1">{message}</p>
            {onDismiss && (
                <button onClick={onDismiss} className="text-current opacity-70 hover:opacity-100 ml-2" aria-label="Dismiss">
                    ✕
                </button>
            )}
        </div>
    );
}
