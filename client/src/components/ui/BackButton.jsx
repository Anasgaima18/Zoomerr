import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackButton = ({ to, label = 'Back', className = '' }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`
                group flex items-center gap-2 px-4 py-2 
                text-gray-400 hover:text-white 
                bg-gray-900/50 hover:bg-gray-800/80 
                border border-gray-800 hover:border-gray-700 
                rounded-lg transition-all duration-200 
                backdrop-blur-sm
                ${className}
            `}
        >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
};

export default BackButton;
