
import React, { useState, useCallback, useMemo } from 'react';
import { Terminal, Copy, Check, Database, RotateCcw, HelpCircle, Loader2, Sparkles, Edit3, Globe, Plus, Trash2, Settings2, Info, AlertCircle } from 'lucide-react';

interface LanguageConfig {
  code: string;
  label: string;
  icon: string;
}

interface TranslationState {
  key1: string;
  key2: string;
  values: Record<string, string>;
}

const DEFAULT_LANGUAGES: LanguageConfig[] = [
  { code: 'en', label: 'English', icon: '🇺🇸' },
  { code: 'cn', label: 'Chinese', icon: '🇨🇳' },
  { code: 'kh', label: 'Khmer', icon: '🇰🇭' },
  { code: 'id', label: 'Indonesian', icon: '🇮🇩' },
  { code: 'vn', label: 'Vietnamese', icon: '🇻🇳' },
];

// Mock Database for Simulation
const MOCK_DATA: Record<string, any> = {
  "deposit": {
    key1: "TRANSACTIONS",
    key2: "DEPOSIT_SUCCESS",
    values: {
      en: "Deposit Successful",
      cn: "存款成功",
      kh: "ការដាក់ប្រាក់បានជោគជ័យ",
      id: "Setoran Berhasil",
      vn: "Nạp Tiền Thành Công"
    }
  },
  "logout": {
    key1: "AUTH",
    key2: "LOGOUT_CONFIRM",
    values: {
      en: "Are you sure you want to log out?",
      cn: "您确定要登出吗？",
      kh: "តើអ្នកប្រាកដជាចង់ចាកចេញមែនទេ?",
      id: "Apakah Anda yakin ingin keluar?",
      vn: "Bạn có chắc chắn muốn đăng xuất?"
    }
  },
  "jackpot": {
    key1: "GAME_ACTION",
    key2: "JACKPOT_WIN",
    values: {
      en: "BIG WIN! You hit the Jackpot!",
      cn: "大赢！您中了头奖！",
      kh: "ឈ្នះធំ! អ្នកបានឈ្នះរង្វាន់ធំ!",
      id: "MENANG BESAR! Anda mendapatkan Jackpot!",
      vn: "THẮNG LỚN! Bạn đã trúng Jackpot!"
    }
  },
  "spin": {
    key1: "GAME_PLAY",
    key2: "START_SPIN",
    values: {
      en: "Good luck! Spin to win.",
      cn: "祝你好运！旋转赢奖。",
      kh: "សំណាងល្អ! បង្វិលដើម្បីឈ្នះ។",
      id: "Semoga beruntung! Putar untuk menang.",
      vn: "Chúc may mắn! Quay để thắng."
    }
  }
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [languages, setLanguages] = useState<LanguageConfig[]>(DEFAULT_LANGUAGES);
  const [translationData, setTranslationData] = useState<TranslationState | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newLangCode, setNewLangCode] = useState('');
  const [newLangLabel, setNewLangLabel] = useState('');

  const outputSql = useMemo(() => {
    if (!translationData) return null;
    
    const cols = ['key1', 'key2', ...languages.map(l => l.code)];
    const values = [
      `'${translationData.key1}'`,
      `'${translationData.key2}'`,
      ...languages.map(l => {
        const val = translationData.values[l.code] || `[Mock ${l.label}]`;
        return l.code === 'en' ? `'${val}'` : `N'${val}'`;
      })
    ];

    return `INSERT INTO [dbo].[BackOffice]([${cols.join('],[')}]) VALUES\n(${values.join(',')});`;
  }, [translationData, languages]);

  // Simulation Logic
  const generateTranslations = useCallback(async () => {
    const trimmedInput = inputText.trim().toLowerCase();
    if (!trimmedInput) return;

    setIsLoading(true);
    setTranslationData(null);

    // Simulate Network/AI Latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 1. Check for Exact Mock Keywords
    let result = Object.entries(MOCK_DATA).find(([key]) => trimmedInput.includes(key))?.[1];

    // 2. Fallback to Simulated AI Generation
    if (!result) {
      const sanitized = trimmedInput.replace(/[^a-zA-Z\s]/g, '');
      const words = sanitized.split(/\s+/).filter(w => w.length > 2);
      const mainWord = words[0] || "GENERIC";
      
      result = {
        key1: "UI_MESSAGE",
        key2: `${mainWord.toUpperCase()}_NOTIFICATION`,
        values: {
          en: inputText,
          cn: `[模拟翻译] ${inputText}`,
          kh: `[ការក្លែងបន្លំ] ${inputText}`,
          id: `[Simulasi] ${inputText}`,
          vn: `[Mô phỏng] ${inputText}`
        }
      };
    }

    setTranslationData({
      key1: result.key1,
      key2: result.key2,
      values: { ...result.values }
    });
    setIsLoading(false);
  }, [inputText, languages]);

  const handleUpdateTranslation = (field: string, value: string, isMetadata: boolean = false) => {
    if (!translationData) return;
    if (isMetadata) {
      setTranslationData({ ...translationData, [field]: value });
    } else {
      setTranslationData({
        ...translationData,
        values: { ...translationData.values, [field]: value }
      });
    }
  };

  const addLanguage = () => {
    if (!newLangCode || !newLangLabel) return;
    const code = newLangCode.toLowerCase().trim();
    if (languages.find(l => l.code === code)) return;
    setLanguages([...languages, { code, label: newLangLabel, icon: '🌐' }]);
    setNewLangCode('');
    setNewLangLabel('');
  };

  const removeLanguage = (code: string) => {
    setLanguages(languages.filter(l => l.code !== code));
  };

  const handleCopy = async () => {
    if (outputSql) {
      await navigator.clipboard.writeText(outputSql);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInputText('');
    setTranslationData(null);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 lg:p-12">
      {/* Header */}
      <header className="max-w-5xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                iGaming SQL Translator
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-200 uppercase tracking-tighter">
                  Demo Simulation Mode
                </span>
                <p className="text-slate-400 text-sm italic">Local generator active</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <AlertCircle size={14} />
            No API Key Required for Demo
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto w-full grid grid-cols-1 gap-8">
        
        {/* Languages Configuration */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider mb-4">
            <Settings2 size={16} className="text-indigo-500" />
            Active Target Languages
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {languages.map((lang) => (
              <div key={lang.code} className="group flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-slate-700">
                <span>{lang.icon}</span>
                <span>{lang.label} ({lang.code})</span>
                <button onClick={() => removeLanguage(lang.code)} className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <input 
              placeholder="Code (e.g. th)" 
              value={newLangCode}
              onChange={(e) => setNewLangCode(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input 
              placeholder="Label (e.g. Thai)" 
              value={newLangLabel}
              onChange={(e) => setNewLangLabel(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={addLanguage} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 font-medium flex items-center gap-2">
              <Plus size={16} /> Add
            </button>
          </div>
        </section>

        {/* Input Form */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative">
          <div className="absolute top-6 right-6 flex items-center gap-2 text-indigo-400 group cursor-help">
            <span className="text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Try keywords: deposit, jackpot, spin</span>
            <Info size={16} />
          </div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Translate Content</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Try typing 'Successful deposit' or 'Jackpot win'..."
            className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-800"
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={generateTranslations}
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-medium rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {isLoading ? 'Simulating AI...' : 'Generate Demo Translations'}
            </button>
            <button onClick={handleReset} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
              <RotateCcw size={18} /> Reset
            </button>
          </div>
        </section>

        {/* Edit Translations */}
        {translationData && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Edit3 size={18} className="text-indigo-600" />
              Simulation Results (Editable)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">key1 (Category)</label>
                  <input 
                    value={translationData.key1}
                    onChange={(e) => handleUpdateTranslation('key1', e.target.value, true)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">key2 (Identifier)</label>
                  <input 
                    value={translationData.key2}
                    onChange={(e) => handleUpdateTranslation('key2', e.target.value, true)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                  />
                </div>
              </div>

              {languages.map((lang) => (
                <div key={lang.code}>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-1">
                    <span className="text-base">{lang.icon}</span> {lang.label} ({lang.code})
                  </label>
                  <textarea 
                    value={translationData.values[lang.code] || ''}
                    onChange={(e) => handleUpdateTranslation(lang.code, e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Final Output */}
        {(outputSql || isLoading) && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-900 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={12} /> Live Preview
                </span>
              </div>
              {outputSql && !isLoading && (
                <button onClick={handleCopy} className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold transition-all ${isCopied ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  {isCopied ? 'Copied!' : 'Copy SQL'}
                </button>
              )}
            </div>
            <div className="p-6 bg-slate-950 min-h-[140px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-24 text-slate-600">
                  <Loader2 size={32} className="animate-spin text-indigo-500 mb-3" />
                  <p className="text-xs font-mono animate-pulse uppercase tracking-wider italic">Generating mock localization strings...</p>
                </div>
              ) : (
                <pre className="mono text-sm leading-relaxed text-indigo-300 whitespace-pre-wrap">
                  {outputSql}
                </pre>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-auto pt-12 pb-6 text-center text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">
        <div className="flex items-center justify-center gap-4 mb-3">
          <span className="flex items-center gap-1"><Globe size={12} /> {languages.length} Localizations Enabled</span>
          <span className="bg-slate-200 w-1 h-1 rounded-full" />
          <span className="text-indigo-500">Standalone Demo Version</span>
        </div>
        <p>iGaming Localization Systems &bull; Internal Preview Only</p>
      </footer>
    </div>
  );
};

export default App;
