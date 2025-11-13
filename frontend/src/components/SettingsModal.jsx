import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function SettingsModal({ open, onClose, settings, onSave }) {
  const [models, setModels] = useState([]);
  const [model, setModel] = useState(settings.model || 'gpt-4o-mini');
  const [temperature, setTemperature] = useState(settings.temperature ?? 1.0);
  const [systemPrompt, setSystemPrompt] = useState(settings.system_prompt || '');

  useEffect(() => {
    if (open) {
      api.get('/models').then(res => setModels(res.data)).catch(()=>setModels(['gpt-4o-mini']));
    }
  }, [open]);

  const save = () => {
    onSave({ model, temperature, system_prompt: systemPrompt });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-neutral-900 w-full max-w-xl rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Settings and Configuration</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="space-y-2">
          <label className="text-sm opacity-80">Model</label>
          <select className="w-full bg-neutral-800 p-2 rounded" value={model} onChange={e=>setModel(e.target.value)}>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm opacity-80">Instructions</label>
          <textarea className="w-full bg-neutral-800 p-2 rounded min-h-[120px]" placeholder="Enter your custom instructions..." value={systemPrompt} onChange={e=>setSystemPrompt(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm opacity-80">Temperature</label>
          <input type="range" min="0.2" max="1.5" step="0.05" value={temperature} onChange={e=>setTemperature(parseFloat(e.target.value))} className="w-full" />
          <div className="text-right text-sm opacity-70">{temperature.toFixed(2)}</div>
        </div>

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-neutral-700 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-blue-600 rounded" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
