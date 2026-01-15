import { twMerge } from 'tailwind-merge';

const Button = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary hover:bg-primaryHover text-white focus:ring-primary',
        secondary: 'bg-surface hover:bg-surfaceHover text-textMain border border-border focus:ring-surface',
        danger: 'bg-danger hover:bg-red-600 text-white focus:ring-danger',
        ghost: 'hover:bg-surfaceHover text-textMain',
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
