import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextDefinition';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BackButton from '../components/ui/BackButton';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { email, password } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(formData);
            navigate('/');
        } catch (err) {
            setError(err || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
            <div className="absolute top-4 left-4 md:top-8 md:left-8">
                <BackButton to="/" />
            </div>
            <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border shadow-2xl animate-fade-in">
                <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
                <p className="text-center text-textMuted mb-8">Sign in to your meeting workspace</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        placeholder="you@example.com"
                    />
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                        placeholder="••••••••"
                    />

                    <Button type="submit" className="mt-2" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-textMuted text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:text-primaryHover font-medium">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
