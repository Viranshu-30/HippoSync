import React, { useEffect, useState } from 'react';
import { api, setAuth, getToken } from './api';
import Chat from './components/Chat';
import Login from './components/Login';
import Signup from './components/Signup';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');

  useEffect(() => {
    const token = getToken();
    if (token) {
      setAuth(token);
      api.get('/auth/me').then(res => {
        setUser(res.data);
        setView('chat');
      }).catch(() => {
        setAuth(null);
      });
    }
  }, []);

  const onLoggedIn = (token) => {
    setAuth(token);
    api.get('/auth/me').then(res => {
      setUser(res.data);
      setView('chat');
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center space-x-4">
            <button className={view==='login'?'underline':''} onClick={()=>setView('login')}>Login</button>
            <button className={view==='signup'?'underline':''} onClick={()=>setView('signup')}>Sign up</button>
          </div>
          {view === 'login' ? <Login onLoggedIn={onLoggedIn} /> : <Signup onSignedUp={()=>setView('login')} />}
        </div>
      </div>
    );
  }

  return <Chat user={user} />;
}
