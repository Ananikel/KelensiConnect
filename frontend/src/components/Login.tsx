import React, { useState } from 'react';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loginMethod, setLoginMethod] = useState<'email' | 'name'>('email');

    const ADMIN_EMAIL = 'admin@kelensiconnect.com';
    // As per constants.ts, this is the admin user's name
    const ADMIN_NAME = 'Adakou Kafui Romaine KELENSI'; 
    const ADMIN_PASSWORD = 'password';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const identifierTrimmed = identifier.trim().toLowerCase();
        
        if (
            (identifierTrimmed === ADMIN_EMAIL.toLowerCase() || identifierTrimmed === ADMIN_NAME.toLowerCase()) && 
            password === ADMIN_PASSWORD
        ) {
            setError('');
            onLogin();
        } else {
            setError('Identifiant ou mot de passe incorrect.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">KelensiConnect</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Connectez-vous à votre compte</p>
                </div>

                <div>
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button
                                onClick={() => setLoginMethod('email')}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                                    loginMethod === 'email'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                                }`}
                            >
                                Se connecter par Email
                            </button>
                            <button
                                onClick={() => setLoginMethod('name')}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                                    loginMethod === 'name'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                                }`}
                            >
                                Se connecter par Nom
                            </button>
                        </nav>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="identifier" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {loginMethod === 'email' ? 'Adresse Email' : 'Nom Complet'}
                        </label>
                        <input
                            id="identifier"
                            name="identifier"
                            type={loginMethod === 'email' ? 'email' : 'text'}
                            autoComplete={loginMethod === 'email' ? 'email' : 'name'}
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            placeholder={loginMethod === 'email' ? 'you@example.com' : 'Votre nom complet'}
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
                        <p><strong>Email :</strong> admin@kelensiconnect.com</p>
                        <p><strong>Nom :</strong> Adakou Kafui Romaine KELENSI</p>
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
