import React from 'react';
import { Settings, LogOut } from 'lucide-react';

/**
 * フッターコンポーネント
 * SNSリンク、管理者ログイン、コピーライトを含む
 */
const Footer = ({
  adminMode,
  onAdminModeToggle
}) => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* SNSリンク */}
          <div className="flex items-center gap-6">
            <a 
              href="https://twitter.com/cinechrono" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-purple-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="https://note.com/cinechrono" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-purple-400 transition-colors font-bold"
            >
              note
            </a>
          </div>
          
          {/* 管理者ログイン & コピーライト */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onAdminModeToggle} 
              className={`p-2 rounded-lg transition-colors ${adminMode ? 'bg-pink-600 hover:bg-pink-700' : 'hover:bg-gray-800'}`} 
              title={adminMode ? "ログアウト" : "管理者ログイン"}
            >
              {adminMode ? <LogOut className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            </button>
            <p className="text-sm text-gray-400">© 2024 CINEchrono TRAVEL</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
