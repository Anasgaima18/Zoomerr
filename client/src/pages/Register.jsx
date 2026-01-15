import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextDefinition';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BackButton from '../components/ui/BackButton';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { name, email, password, confirmPassword } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await register({ name, email, password });
            navigate('/');
        } catch (err) {
            setError(err || 'Registration failed');
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
                <h2 className="text-3xl font-bold text-center text-white mb-2">Create Account</h2>
                <p className="text-center text-textMuted mb-8">Get started with AI-powered meetings</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Full Name"
                        type="text"
                        name="name"
                        value={name}
                        onChange={onChange}
                        required
                        placeholder="John Doe"
                    />
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
                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={onChange}
                        required
                        placeholder="••••••••"
                    />

                    <Button type="submit" className="mt-2" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-textMuted text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-primaryHover font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
