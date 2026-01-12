import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Footer = ({ adminMode, onAdminModeToggle }) => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          {/* コピーライト */}
          <span className="text-slate-500">
            © {new Date().getFullYear()} CINEchrono TRAVEL
          </span>
          
          <span className="text-slate-600 hidden sm:inline">|</span>
          
          {/* X */}
          <a
            href="https://x.com/cinechrono"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            title="X (Twitter)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          
          <span className="text-slate-600">|</span>
          
          {/* プライバシーポリシー */}
          <button
            onClick={() => navigate('/privacy')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            プライバシーポリシー
          </button>
          
          <span className="text-slate-600">|</span>
          
          {/* 作品リクエスト */}
          <button
            onClick={() => navigate('/request')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            作品リクエスト
          </button>
          
          <span className="text-slate-600">|</span>
          
          {/* 管理者ログイン/ログアウト */}
          {adminMode ? (
            <button
              onClick={onAdminModeToggle}
              className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              ログアウト
            </button>
          ) : (
            <button
              onClick={onAdminModeToggle}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              管理者
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
