import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="bg-black/90 px-6 py-4 flex justify-between items-center fixed w-full z-10 top-0">
            <h1 className="text-red-600 text-3xl font-bold cursor-pointer" onClick={() => navigate('/home')}>
                NETFLIX Clone
            </h1>
            <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
                Logout
            </button>
        </nav>
    );
};

export default Navbar;
