import React, { useState } from 'react';
import { api } from '../api';

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const form = new FormData();
      form.append('username', email);
      form.append('password', password);
      const res = await api.post('/auth/login', form);
      onLoggedIn(res.data.access_token);
    } catch (e) {
      setError(e.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <form onSubmit={submit} className="bg-neutral-800 rounded-lg p-6 space-y-4">
      <h1 className="text-xl font-semibold">Login</h1>
      <input className="w-full p-2 rounded bg-neutral-900" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full p-2 rounded bg-neutral-900" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button className="w-full py-2 bg-blue-600 rounded">Sign in</button>
    </form>
  );
}
