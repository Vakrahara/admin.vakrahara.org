'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Terminal, Trash2 } from 'lucide-react';

interface SimulationPreviewFrameProps {
  entryFile?: File;
}

export function SimulationPreviewFrame({ entryFile }: SimulationPreviewFrameProps) {
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    if (!entryFile) {
      setPreviewHtml('');
      return;
    }
    let active = true;
    entryFile.text().then((text) => {
      if (!active) return;
      const bridgeScript = `
<script>
window.AndroidBridge = {
  postState: function(json) { window.parent.postMessage({ type: 'simState', data: json }, '*'); },
  triggerHapticClick: function() {},
  triggerHapticError: function() {}
};
</script>
`;
      let injected = text;
      if (injected.includes('<head>')) {
        injected = injected.replace('<head>', `<head>${bridgeScript}`);
      } else if (injected.includes('<html>')) {
        injected = injected.replace('<html>', `<html><head>${bridgeScript}</head>`);
      } else {
        injected = bridgeScript + injected;
      }
      setPreviewHtml(injected);
    }).catch((err) => console.error('Failed reading preview file:', err));

    return () => { active = false; };
  }, [entryFile]);

  useEffect(() => {
    const handleMsg = (event: MessageEvent) => {
      if (event.data && event.data.type === 'simState') {
        const payload = typeof event.data.data === 'string' ? event.data.data : JSON.stringify(event.data.data);
        const time = new Date().toLocaleTimeString();
        setEvents((prev) => [`[${time}] ${payload}`, ...prev.slice(0, 19)]);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  if (!entryFile) {
    return (
      <div className="h-44 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-[#03050B]/60 text-slate-500 text-xs">
        <Eye className="w-5 h-5 mb-1.5 opacity-40 text-emerald-400" />
        <span>Select an HTML file to preview simulation & live AndroidBridge bridge events</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-black shadow-inner">
        <iframe
          srcDoc={previewHtml}
          sandbox="allow-scripts allow-same-origin"
          title="ACE Simulation Preview"
          className="w-full h-56 bg-white border-0"
        />
      </div>

      <div className="rounded-lg border border-slate-800/80 bg-[#04060A] p-2 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800/60 pb-1">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>AndroidBridge State Log ({events.length})</span>
          </div>
          {events.length > 0 && (
            <button
              type="button"
              onClick={() => setEvents([])}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
        <div className="h-16 overflow-y-auto space-y-1 font-mono text-[10px] text-slate-300 pr-1">
          {events.length === 0 ? (
            <span className="text-slate-600 italic">Listening for window.AndroidBridge.postState(...) calls...</span>
          ) : (
            events.map((e, idx) => (
              <div key={idx} className="truncate text-emerald-300/90 bg-emerald-500/5 px-1.5 py-0.5 rounded">
                {e}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
