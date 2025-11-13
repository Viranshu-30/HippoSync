import React, { useRef, useState } from 'react';

export default function MessageInput({ onSend }) {
  const [value, setValue] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const fileRef = useRef(null);

  const send = () => {
    const text = value.trim();
    if (!text && !attachedFile) return;
    onSend({ text, file: attachedFile });
    setValue('');
    setAttachedFile(null);
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
    e.target.value = '';
  };

  return (
    <div className="p-4 flex items-center gap-2">
      <button className="px-3 py-2 bg-neutral-800 rounded" onClick={() => fileRef.current?.click()}>📎</button>
      <input ref={fileRef} type="file" className="hidden" onChange={onFile} />
      
      <input
        className="flex-1 p-2 bg-neutral-800 rounded"
        placeholder="Send a message..."
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send(); }}
      />
      
      {attachedFile && (
        <div className="text-sm opacity-70">{attachedFile.name}</div>
      )}

      <button className="px-4 py-2 bg-blue-600 rounded" onClick={send}>Send</button>
    </div>
  );
}
