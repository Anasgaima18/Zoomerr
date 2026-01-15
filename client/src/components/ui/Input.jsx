import { twMerge } from 'tailwind-merge';

const Input = ({ label, className, ...props }) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <label className="text-sm font-medium text-textMuted">{label}</label>}
            <input
                className={twMerge(
                    'bg-surface border border-border rounded-lg px-4 py-2 text-textMain placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200',
                    className
                )}
                {...props}
            />
        </div>
    );
};

export default Input;
