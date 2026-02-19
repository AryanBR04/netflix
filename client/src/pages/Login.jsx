import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Email and password are required');
            return;
        }

        try {
            const response = await loginUser({ email, password });

            // Save token to localStorage
            localStorage.setItem('token', response.token);

            // Redirect to home
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div
            className="flex justify-center items-center h-screen bg-cover bg-center"
            style={{
                backgroundImage:
                    "url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')",
            }}
        >
            <div className="bg-black/75 p-16 rounded-lg w-full max-w-md">
                <h1 className="text-red-600 text-4xl font-bold mb-4 tracking-tighter">RED</h1>
                <h2 className="text-white text-2xl font-bold mb-8">Sign In</h2>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email address"
                        className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="bg-red-600 text-white p-3 rounded font-bold mt-4 hover:bg-red-700 transition"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-gray-400 mt-4 text-sm">
                    New to Netflix?{' '}
                    <Link to="/register" className="text-white hover:underline">
                        Sign up now.
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
