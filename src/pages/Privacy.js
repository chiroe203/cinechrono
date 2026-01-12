import React from 'react';
import { ArrowLeft } from 'lucide-react';

const Privacy = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* ヘッダー */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>トップに戻る</span>
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">プライバシーポリシー</h1>
        
        <div className="bg-slate-800/50 rounded-xl p-6 md:p-8 space-y-8">
          
          {/* はじめに */}
          <section>
            <p className="text-slate-300 leading-relaxed">
              CINEchrono TRAVEL（以下「当サイト」）は、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に努めています。
              本プライバシーポリシーでは、当サイトがどのような情報を収集し、どのように利用するかについて説明します。
            </p>
          </section>

          {/* 収集する情報 */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-purple-400">1. 収集する情報</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="font-semibold text-white mb-2">アクセス情報</h3>
                <p className="leading-relaxed">
                  当サイトでは、アクセス解析ツール「Google Analytics」を使用しています。
                  Google Analyticsはトラフィックデータの収集のためにCookieを使用しています。
                  このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Cookie（クッキー）</h3>
                <p className="leading-relaxed">
                  当サイトでは、ユーザー体験の向上や広告配信のためにCookieを使用することがあります。
                  Cookieの使用を希望されない場合は、ブラウザの設定でCookieを無効にすることができます。
                </p>
              </div>
            </div>
          </section>

          {/* 広告について */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-purple-400">2. 広告について</h2>
            <div className="space-y-4 text-slate-300">
              <p className="leading-relaxed">
                当サイトでは、第三者配信の広告サービス「Google AdSense」を利用しています。
              </p>
              <p className="leading-relaxed">
                広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
                Google AdSenseの詳細については、
                <a 
                  href="https://policies.google.com/technologies/ads?hl=ja" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Google広告に関するポリシー
                </a>
                をご参照ください。
              </p>
              <p className="leading-relaxed">
                ユーザーは、Googleの広告設定ページでパーソナライズ広告を無効にすることができます。
                また、
                <a 
                  href="https://optout.aboutads.info/?c=2&lang=ja" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  www.aboutads.info
                </a>
                にアクセスすることで、パーソナライズ広告に使用される第三者配信事業者のCookieを無効にすることができます。
              </p>
            </div>
          </section>

          {/* アフィリエイトについて */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-purple-400">3. アフィリエイトについて</h2>
            <div className="space-y-4 text-slate-300">
              <p className="leading-relaxed">
                当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定された
                アフィリエイトプログラム「Amazonアソシエイト・プログラム」の参加者です。
              </p>
              <p className="leading-relaxed">
                また、楽天アフィリエイト、その他各種アフィリエイトプログラムにも参加しています。
                当サイト内のリンクを経由して商品を購入された場合、当サイトが紹介料を受け取ることがあります。
              </p>
            </div>
          </section>

          {/* 外部サービス */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-purple-400">4. 外部サービスとの連携</h2>
            <div className="space-y-4 text-slate-300">
              <p className="leading-relaxed">
                当サイトでは、以下の外部サービスを利用しています。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>TMDB (The Movie Database) - 映画・ドラマ・アニメ情報の取得</li>
                <li>RAWG - ゲーム情報の取得</li>
                <li>YouTube - 動画の埋め込み表示</li>
                <li>Firebase - ユーザー認証・データ管理</li>
              </ul>
              <p className="leading-relaxed">
                各サービスのプライバシーポリシーについては、それぞれのサービス提供元のウェブサイトをご確認ください。
              </p>
            </div>
          </section>

          {/* 免責事項 */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-purple-400">5. 免責事項</h2>
            <div className="space-y-4 text-slate-300">
              <p className="leading-relaxed">
                当サイトに掲載されている情報の正確性には万全を期していますが、
                利用者が当サイトの情報を用いて行う一切の行為について、当サイトは責任を負いません。
              </p>
              <p className="leading-relaxed">
                当サイトからリンクやバナーなどによって他のサイトに移動された場合、
                移動先サイトで提供される情報、サービス等について一切の責任を負いません。
              </p>
            </div>
          </section>

          {/* 著作権 */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-purple-400">6. 著作権について</h2>
            <div className="space-y-4 text-slate-300">
              <p className="leading-relaxed">
                当サイトで掲載している文章や画像などの著作権は、当サイト運営者または各権利者に帰属します。
                無断転載・複製を禁じます。
              </p>
              <p className="leading-relaxed">
                当サイトで使用している映画・アニメ・ゲーム等の画像は、各作品の著作権者に帰属します。
                これらの画像は引用・紹介を目的として使用しており、著作権侵害の意図はありません。
              </p>
            </div>
          </section>

          {/* ポリシーの変更 */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-purple-400">7. プライバシーポリシーの変更</h2>
            <div className="space-y-4 text-slate-300">
              <p className="leading-relaxed">
                当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。
                変更後のプライバシーポリシーは、当サイトに掲載した時点から効力を生じるものとします。
              </p>
            </div>
          </section>

          {/* お問い合わせ */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-purple-400">8. お問い合わせ</h2>
            <div className="space-y-4 text-slate-300">
              <p className="leading-relaxed">
                本プライバシーポリシーに関するお問い合わせは、
                <a 
                  href="https://x.com/cinechrono" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  X（Twitter）@cinechrono
                </a>
                までご連絡ください。
              </p>
            </div>
          </section>

          {/* 制定日 */}
          <section className="pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm text-right">
              制定日：2026年1月12日
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Privacy;
