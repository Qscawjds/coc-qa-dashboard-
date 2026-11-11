import React, { useState } from 'react';
import { X, Key, Server, Sparkles, Check } from 'lucide-react';
import { ApiService } from '../../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onRefreshData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDemoMode,
  onToggleDemoMode,
  onRefreshData,
}) => {
  const [token, setToken] = useState<string>(ApiService.getToken());
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    ApiService.setToken(token.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">การตั้งค่าการเชื่อมต่อ (Settings)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Demo Mode Toggle */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>โหมดข้อมูลจำลอง (Demo Mode)</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                ใช้ข้อมูลจำลองของวิทยาลัย CoC โดยไม่ต้องเชื่อมต่อ API หรือ Google Sheets
              </p>
            </div>
            <button
              onClick={onToggleDemoMode}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                isDemoMode ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isDemoMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Bearer Token */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-slate-500" />
              <span>API Bearer Token (สำหรับเรียก FastAPI Backend)</span>
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. qa-demo-token"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              กำหนดไว้ใน backend .env หรือ API_TOKENS_JSON เช่น qa, admin, teacher
            </p>
          </div>

          {/* Backend Info */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-slate-600">
            <span className="font-semibold text-indigo-900 block mb-1">FastAPI Backend Endpoint:</span>
            <code className="text-indigo-700 font-mono text-[11px] block bg-white px-2 py-1 rounded border border-indigo-200">
              http://127.0.0.1:8000/api
            </code>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {saved ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> บันทึกการตั้งค่าแล้ว
              </span>
            ) : (
              'การเปลี่ยนแปลงจะถูกบันทึกใน LocalStorage'
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>บันทึก</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
