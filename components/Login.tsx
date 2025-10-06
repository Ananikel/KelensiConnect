import React, { useState } from 'react';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const ADMIN_EMAIL = 'admin@kelensiconnect.com';
    // As per constants.ts, this is the admin user's name
    const ADMIN_NAME = 'Adakou Kafui Romaine KELENSI'; 
    const ADMIN_PASSWORD = 'password';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication allowing email or full name (case-insensitive)
        if (
            (identifier.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() || identifier.trim().toLowerCase() === ADMIN_NAME.toLowerCase()) && 
            password === ADMIN_PASSWORD
        ) {
            setError('');
            onLogin();
        } else {
            setError('Identifiant ou mot de passe incorrect.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">KelensiConnect</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Connectez-vous à votre compte</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="identifier" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email ou Nom complet
                        </label>
                        <input
                            id="identifier"
                            name="identifier"
                            type="text"
                            autoComplete="username"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            placeholder="you@example.com ou votre nom complet"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            placeholder="********"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/50 rounded-md text-sm text-indigo-700 dark:text-indigo-300">
                        <p className="font-semibold">Données pour le test :</p>
                        <p><strong>Identifiant :</strong> admin@kelensiconnect.com <br/> <span className="ml-1">ou 'Adakou Kafui Romaine KELENSI'</span></p>
                        <p><strong>Mot de passe :</strong> password</p>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Se connecter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
