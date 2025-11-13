import React, { useState } from 'react';
import { api } from '../api';

export default function Signup({ onSignedUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/auth/signup', { email, password });
      setOk(true);
      setTimeout(()=>onSignedUp(), 800);
    } catch (e) {
      setError(e.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <form onSubmit={submit} className="bg-neutral-800 rounded-lg p-6 space-y-4">
      <h1 className="text-xl font-semibold">Create account</h1>
      <input className="w-full p-2 rounded bg-neutral-900" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full p-2 rounded bg-neutral-900" placeholder="Password (min 6 chars)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <div className="text-red-400 text-sm">{error}</div>}
      {ok && <div className="text-green-400 text-sm">Account created. You can log in now.</div>}
      <button className="w-full py-2 bg-blue-600 rounded">Sign up</button>
    </form>
  );
}
