import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import SettingsModal from './SettingsModal';
import Sidebar from './Sidebar';

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('chat-settings');
    return saved
      ? JSON.parse(saved)
      : { model: 'gpt-4o-mini', temperature: 1.0, system_prompt: '' };
  });
  const [thread, setThread] = useState(null);

  const sessionId = useMemo(() => `sess-${user.id}`, [user.id]);

  useEffect(() => {
    localStorage.setItem('chat-settings', JSON.stringify(config));
  }, [config]);

  // Restore last thread from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('last-thread');
    if (saved) {
      try {
        setThread(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not parse saved thread');
      }
    }
  }, []);

  // Load all messages of a thread
  const loadMessages = async (t) => {
    if (!t) return;
    const res = await api.get(`/threads/${t.id}/messages`);
    const ms = res.data.map((m) => {
      if (m.type === 'file')
        return { role: 'user', type: 'file', filename: m.filename };
      return {
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      };
    });
    setMessages(ms);
  };

  // Select an existing chat
  const selectThread = async (t) => {
    setThread(t);
    localStorage.setItem('last-thread', JSON.stringify(t));
    await loadMessages(t);
  };

  // Create a new personal or project chat
  const newPersonal = async (projectId = null) => {
    const payload = { title: 'New chat' };
    if (projectId) payload.project_id = projectId;
    const res = await api.post('/threads', payload);

    setThread(res.data);
    localStorage.setItem('last-thread', JSON.stringify(res.data));
    setMessages([]);

    // ✅ Auto-refresh sidebar threads so new chat appears instantly
    try {
      window.dispatchEvent(new Event('refresh-threads'));
    } catch (e) {
      console.warn('Sidebar refresh event failed:', e);
    }
};


  // ✅ Rename chat
  const renameChat = async () => {
    if (!thread) return alert('No chat selected');
    const newTitle = prompt('Rename chat:', thread.title);
    if (!newTitle || newTitle === thread.title) return;
    try {
      await api.put(`/threads/${thread.id}`, { title: newTitle });
      const updated = { ...thread, title: newTitle };
      setThread(updated);
      localStorage.setItem('last-thread', JSON.stringify(updated));
      alert('Chat renamed');
    } catch (e) {
      alert('Rename failed');
    }
  };

  // ✅ Delete chat
  const deleteChat = async () => {
    if (!thread) return alert('No chat selected');
    if (!window.confirm(`Delete chat "${thread.title}"?`)) return;
    try {
      await api.delete(`/threads/${thread.id}`);
      setThread(null);
      setMessages([]);
      localStorage.removeItem('last-thread');
      alert('Chat deleted');
    } catch (e) {
      alert('Delete failed');
    }
  };

  // ✅ Send message or file
  const send = async ({ text, file }) => {
    let t = thread;

    // Reuse last thread if none selected
    if (!t) {
      const saved = localStorage.getItem('last-thread');
      if (saved) {
        try {
          t = JSON.parse(saved);
          setThread(t);
        } catch {}
      }
    }

    // Still nothing — create a new thread
    if (!t) {
      const res = await api.post('/threads', { title: 'New chat' });
      t = res.data;
      setThread(t);
      localStorage.setItem('last-thread', JSON.stringify(t));
    }

    if (text)
      setMessages((m) => [...m, { role: 'user', content: text }]);
    if (file)
      setMessages((m) => [
        ...m,
        { role: 'user', type: 'file', filename: file.name },
      ]);

    const form = new FormData();
    form.append('thread_id', String(t.id));
    form.append('message', text || '');
    form.append('model', config.model);
    form.append('temperature', String(config.temperature));
    form.append('system_prompt', config.system_prompt || '');
    if (file) form.append('file', file);

    try {
      const res = await api.post('/chat', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: res.data.reply },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: '❌ Error processing your message.' },
      ]);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar
        user={user}
        selected={thread}
        onSelectThread={selectThread}
        onNewPersonal={newPersonal}
      />

      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="border-b border-neutral-800 p-3 flex items-center justify-between">
          <div className="font-semibold">{thread ? thread.title : 'MemoryChat'}</div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 bg-neutral-800 rounded"
              onClick={renameChat}
            >
              Rename
            </button>
            <button
              className="px-3 py-1 bg-red-600 rounded text-white"
              onClick={deleteChat}
            >
              Delete
            </button>
            <button
              className="px-3 py-1 bg-neutral-800 rounded"
              onClick={() => setSettingsOpen(true)}
            >
              Settings
            </button>
          </div>
        </header>

        {/* CHAT AREA */}
        <MessageList messages={messages} />
        <MessageInput onSend={send} />

        {/* SETTINGS MODAL */}
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={config}
          onSave={setConfig}
        />
      </div>
    </div>
  );
}
