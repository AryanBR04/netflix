import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !phone || !password) {
            setError('All fields are required');
            return;
        }

        if (!/^\d+$/.test(phone)) {
            setError('Phone number must be numeric');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            await registerUser({ name, email, phone, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')" }}>
            <div className="bg-black/75 p-16 rounded-lg w-full max-w-md">
                <h1 className="text-red-600 text-4xl font-bold mb-4 tracking-tighter">RED</h1>
                <h2 className="text-3xl font-bold mb-8 text-white">Register</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Name"
                        className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email address"
                        className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password (min 6 chars)"
                        className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-red-600 text-white p-3 rounded font-bold mt-4 hover:bg-red-700 transition">
                        Sign Up
                    </button>
                </form>
                <p className="text-gray-400 mt-4 text-sm">
                    Already have an account? <Link to="/login" className="text-white hover:underline">Sign in.</Link>.
                </p>
            </div>
        </div >
    );
};

export default Register;
