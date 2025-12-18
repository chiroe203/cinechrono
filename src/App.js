import React, { useState, useEffect } from 'react';
import { Film, BookOpen, X, Gamepad2, BookMarked, Settings, Clock, Menu, ExternalLink } from 'lucide-react';

const App = () => {
  const [sel, setSel] = useState(null);
  const [activeEra, setActiveEra] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [tab, setTab] = useState('content');
  const [page, setPage] = useState('timeline');
  const [menu, setMenu] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const ADMIN_PASSWORD = 'cinechrono2024';
  
  const [data, setData] = useState([
    { mainEra: 'ancient', subEra: 'ローマ帝国', subEraYears: '紀元前27-476年', year: '紀元前44年', events: [{ type: 'history', title: 'カエサル暗殺', desc: 'ユリウス・カエサルが元老院で暗殺される', detail: 'ユリウス・カエサルは紀元前44年3月15日、ローマ元老院にて暗殺された。', topic: { title: 'ローマ帝国の栄光と滅亡を描く作品たち', url: 'https://note.com/cinechrono/n/xxxxx' } }], content: [{ type: 'movie', title: 'グラディエーター', year: 180, synopsis: 'ローマ帝国の将軍マキシマスが、皇帝に裏切られ奴隷剣闘士となり、復讐を誓う', links: [{ service: 'Amazon Prime', url: 'https://amazon.co.jp' }], topic: { title: 'ローマ帝国の栄光と滅亡を描く作品たち', url: 'https://note.com/cinechrono/n/xxxxx' } }] }
  ]);

  const eras = [{ id: 'ancient', name: '古代', year: '紀元前-476' }, { id: 'medieval', name: '中世', year: '500-1500' }, { id: 'early-modern', name: '近世', year: '1500-1800' }, { id: 'modern', name: '近代', year: '1800-1945' }, { id: 'contemporary', name: '現代', year: '1945-' }];
  const [cf, setCf] = useState({ category: 'movie', title: '', mainEra: 'modern', subEra: '', year: '', synopsis: '', links: [{ service: '', url: '' }], topic: { title: '', url: '' } });
  const [ef, setEf] = useState({ title: '', mainEra: 'modern', subEra: '', year: '', desc: '', detail: '', topic: { title: '', url: '' } });

  const style = (t) => ({ movie: { b: 'border-blue-500', txt: 'text-blue-700', ic: Film, icc: 'text-blue-600', bg: 'bg-blue-50' }, manga: { b: 'border-green-500', txt: 'text-green-700', ic: BookMarked, icc: 'text-green-600', bg: 'bg-green-50' }, game: { b: 'border-yellow-500', txt: 'text-yellow-700', ic: Gamepad2, icc: 'text-yellow-600', bg: 'bg-yellow-50' }}[t] || { b: 'border-blue-500', txt: 'text-blue-700', ic: Film, icc: 'text-blue-600', bg: 'bg-blue-50' });
  const label = (t) => ({ movie: '🎬 映画', manga: '📚 漫画', game: '🎮 ゲーム' }[t] || '');
  const subs = (m) => [...new Set(data.filter(i => i.mainEra === m).map(i => i.subEra).filter(Boolean))];

  const scroll = (id) => { const el = document.getElementById(`era-${id}`); if (el) { el.scrollIntoView({ behavior: 'smooth' }); setActiveEra(id); }};

  useEffect(() => {
    const onScroll = () => { const p = window.scrollY + 200; for (const e of eras) { const el = document.getElementById(`era-${e.id}`); if (el && p >= el.offsetTop && p < el.offsetTop + el.offsetHeight) { setActiveEra(e.id); break; }}};
    if (page === 'timeline') { window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll); }
  }, [page]);

  const addC = (e) => {
    e.preventDefault();
    const nc = { type: cf.category, title: cf.title, year: parseInt(cf.year.replace(/[^0-9]/g, '')) || 0, synopsis: cf.synopsis, links: cf.links.filter(l => l.service && l.url), topic: cf.topic.title && cf.topic.url ? cf.topic : null };
    setData(p => { const i = p.findIndex(x => x.mainEra === cf.mainEra && x.subEra === cf.subEra && x.year === cf.year); if (i !== -1) { const u = [...p]; u[i].content.push(nc); return u; } return [...p, { mainEra: cf.mainEra, subEra: cf.subEra, subEraYears: '', year: cf.year, events: [], content: [nc] }]; });
    setCf({ category: 'movie', title: '', mainEra: 'modern', subEra: '', year: '', synopsis: '', links: [{ service: '', url: '' }], topic: { title: '', url: '' } });
    alert('✅');
  };

  const addE = (e) => {
    e.preventDefault();
    const ne = { type: 'history', title: ef.title, desc: ef.desc, detail: ef.detail, topic: ef.topic.title && ef.topic.url ? ef.topic : null };
    setData(p => { const i = p.findIndex(x => x.mainEra === ef.mainEra && x.subEra === ef.subEra && x.year === ef.year); if (i !== -1) { const u = [...p]; u[i].events.push(ne); return u; } return [...p, { mainEra: ef.mainEra, subEra: ef.subEra, subEraYears: '', year: ef.year, events: [ne], content: [] }]; });
    setEf({ title: '', mainEra: 'modern', subEra: '', year: '', desc: '', detail: '', topic: { title: '', url: '' } });
    alert('✅');
  };

  const deleteContent = (mainEra, subEra, year, type, idx) => {
    if (window.confirm('削除しますか？')) {
      setData(p => p.map(item => {
        if (item.mainEra === mainEra && item.subEra === subEra && item.year === year) {
          if (type === 'content') return { ...item, content: item.content.filter((_, i) => i !== idx) };
          if (type === 'event') return { ...item, events: item.events.filter((_, i) => i !== idx) };
        }
        return item;
      }).filter(item => item.content.length > 0 || item.events.length > 0));
    }
  };

  const handleAdminModeToggle = () => {
    if (adminMode) {
      setAdminMode(false);
    } else {
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAdminMode(true);
      setShowPasswordPrompt(false);
      setPasswordInput('');
    } else {
      alert('パスワードが間違っています');
      setPasswordInput('');
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur z-50 shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer" onClick={() => setPage('timeline')}>CINEchrono TRAVEL</h1>
          <nav className="hidden md:flex gap-6">
            {[['timeline', '年表と物語'], ['about', 'CINEchrono TRAVELとは'], ['articles', '記事一覧']].map(([p, n]) => <button key={p} onClick={() => setPage(p)} className={`px-4 py-2 rounded-lg font-semibold ${page === p ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>{n}</button>)}
          </nav>
          <button onClick={() => setMenu(!menu)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg"><Menu className="w-6 h-6" /></button>
        </div>
        {menu && <div className="md:hidden bg-white border-t">{[['timeline', '年表と物語'], ['about', 'CINEchrono TRAVELとは'], ['articles', '記事一覧']].map(([p, n]) => <button key={p} onClick={() => { setPage(p); setMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50">{n}</button>)}</div>}
      </header>

      {adminMode && (
        <button onClick={() => setAdmin(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-110 transition-transform"><Settings className="w-6 h-6 text-white" /></button>
      )}

      <div className="pt-20">
        {page === 'timeline' && (
          <div className="px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">映画で旅する世界史の地図</h1>
            <p className="text-center text-gray-600 mb-12 text-sm">歴史的瞬間とその時代の作品をチェック</p>
            <div className="sticky top-20 bg-white/95 backdrop-blur z-40 py-3 mb-8 border-y">
              <div className="flex overflow-x-auto gap-2 px-2">
                {eras.map(e => <button key={e.id} onClick={() => scroll(e.id)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold ${activeEra === e.id ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{e.name}<div className="text-xs opacity-75">{e.year}</div></button>)}
              </div>
            </div>
            <div className="max-w-4xl mx-auto relative">
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500"></div>
              {eras.map(era => (
                <div key={era.id} id={`era-${era.id}`} className="mb-16">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-lg shadow-lg z-10 text-white">{era.name}</div>
                    <div className="ml-4 text-gray-500 text-sm">{era.year}</div>
                  </div>
                  {[...new Set(data.filter(i => i.mainEra === era.id).map(i => i.subEra))].map(sub => (
                    <div key={sub} className="mb-10">
                      <div className="flex items-center mb-4 ml-20 relative">
                        <div className="absolute left-[-48px] top-5 w-12 border-t-2 border-dashed border-gray-400"></div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-md border-2 border-gray-300 z-10"><Clock className="w-5 h-5 text-gray-600" /></div>
                        <div className="ml-3"><div className="font-bold text-gray-800">{sub}</div><div className="text-xs text-gray-500">{data.find(i => i.subEra === sub)?.subEraYears}</div></div>
                      </div>
                      {data.filter(i => i.mainEra === era.id && i.subEra === sub).map((item, idx) => (
                        <div key={idx} className="ml-32 mb-6">
                          <div className="text-lg font-bold text-purple-600 mb-3">{item.year}</div>
                          {item.events.map((ev, i) => <div key={i} onClick={() => setSel({ ...ev, year: item.year })} className="mb-3 p-4 rounded-lg border-2 border-red-400 bg-red-50 cursor-pointer hover:bg-red-100"><div className="flex gap-2"><BookOpen className="w-5 h-5 text-red-600 mt-1" /><div><div className="font-bold text-red-700">{ev.title}</div><div className="text-sm text-gray-700 mt-1">{ev.desc}</div></div></div></div>)}
                          {item.content.map((c, i) => { const s = style(c.type); const I = s.ic; return <div key={i} onClick={() => setSel(c)} className={`mb-3 p-4 rounded-lg border-2 ${s.b} ${s.bg} cursor-pointer hover:shadow-md`}><div className="flex gap-2"><I className={`w-5 h-5 ${s.icc} mt-1`} /><div><div className={`font-bold ${s.txt}`}>{c.title}</div><div className="text-xs text-gray-600 mt-1">{label(c.type)} • {c.year}年頃</div></div></div></div>; })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'about' && (
          <div className="max-w-3xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">物語で旅する、世界と時代。</h1>
            <div className="bg-gray-50 rounded-lg p-8 mb-8 space-y-4 border text-gray-700">
              <p>スクリーンの向こうに広がるのは、さまざまな時代、さまざまな場所。</p>
              <p>歴史の出来事や年号だけでは見えない、その時代の空気、服装、建築、街の音。</p>
              <p>映画を通して見ぬ時代を歩き、遠い世界へ旅をすることで、歴史は記号ではなく、手触りのある体験に変わります。</p>
              <p className="font-bold text-purple-700">CINEchrono TRAVEL は、映画という窓から世界と時代をめぐるための地図です。</p>
              <p>あなたの旅が、ここから始まりますように。</p>
              <p className="text-center text-gray-500 italic pt-4">— 映画は、時代を歩くための地図になる。</p>
            </div>
          </div>
        )}

        {page === 'articles' && (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">記事一覧</h1>
            <div className="bg-gray-50 rounded-lg p-6 border">
              <iframe src="https://note.com/cinechrono/embed" className="w-full h-screen border-0 rounded-lg" title="Note記事"></iframe>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <a href="https://twitter.com/cinechrono" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://note.com/cinechrono" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors font-bold">note</a>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleAdminModeToggle} className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title={adminMode ? "一般モード" : "管理モード"}><Settings className="w-4 h-4" /></button>
              <p className="text-sm text-gray-400">© 2024 CINEchrono TRAVEL</p>
            </div>
          </div>
        </div>
      </footer>

      {sel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">{sel.type === 'history' ? '📚 歴史イベント' : label(sel.type)}</h2>
              <button onClick={() => setSel(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{sel.title}</h3>
              {sel.type !== 'history' ? (
                <>
                  <div className="mb-4"><div className="text-sm text-gray-500 mb-1">時代設定</div><div className="text-lg font-semibold">{sel.year}年</div></div>
                  <div className="mb-4"><div className="text-sm text-gray-500 mb-2">あらすじ</div><p className="text-gray-700">{sel.synopsis}</p></div>
                  {sel.links?.length > 0 && <div className="space-y-2 mt-6">{sel.links.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-center font-bold">{l.service}で見る</a>)}</div>}
                  {sel.topic && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="text-sm text-gray-500 mb-2">📖 関連記事</div>
                      <a href={sel.topic.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100">
                        <span className="font-semibold text-purple-700">{sel.topic.title}</span>
                        <ExternalLink className="w-5 h-5 text-purple-600" />
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4"><div className="text-sm text-gray-500 mb-1">年代</div><div className="text-lg font-semibold">{sel.year}</div></div>
                  <div className="mb-4"><div className="text-sm text-gray-500 mb-2">概要</div><p className="text-gray-700">{sel.desc}</p></div>
                  {sel.detail && <div className="mb-4 pt-4 border-t"><div className="text-sm text-gray-500 mb-2">詳細</div><p className="text-gray-700">{sel.detail}</p></div>}
                  {sel.topic && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="text-sm text-gray-500 mb-2">📖 関連記事</div>
                      <a href={sel.topic.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100">
                        <span className="font-semibold text-purple-700">{sel.topic.title}</span>
                        <ExternalLink className="w-5 h-5 text-purple-600" />
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {admin && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
          <div className="min-h-screen p-4 py-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">✏️ 管理画面</h2>
                <button onClick={() => setAdmin(false)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex gap-2 mb-6">
                {[['content', '🎬 作品'], ['event', '📚 イベント']].map(([t, l]) => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 rounded-lg font-bold ${tab === t ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{l}</button>)}
              </div>
              {tab === 'content' && (
                <form onSubmit={addC} className="bg-gray-50 rounded-lg p-6 border space-y-4">
                  <select value={cf.category} onChange={e => setCf(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-3 bg-white border rounded-lg" required><option value="movie">🎬 映画</option><option value="manga">📚 漫画</option><option value="game">🎮 ゲーム</option></select>
                  <select value={cf.mainEra} onChange={e => setCf(p => ({ ...p, mainEra: e.target.value }))} className="w-full px-4 py-3 bg-white border rounded-lg" required>{eras.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
                  <input list="s1" value={cf.subEra} onChange={e => setCf(p => ({ ...p, subEra: e.target.value }))} placeholder="時代区分" className="w-full px-4 py-3 bg-white border rounded-lg" required />
                  <datalist id="s1">{subs(cf.mainEra).map((s, i) => <option key={i} value={s} />)}</datalist>
                  <input value={cf.title} onChange={e => setCf(p => ({ ...p, title: e.target.value }))} placeholder="タイトル" className="w-full px-4 py-3 bg-white border rounded-lg" required />
                  <input value={cf.year} onChange={e => setCf(p => ({ ...p, year: e.target.value }))} placeholder="年代" className="w-full px-4 py-3 bg-white border rounded-lg" required />
                  <textarea value={cf.synopsis} onChange={e => setCf(p => ({ ...p, synopsis: e.target.value }))} placeholder="あらすじ" className="w-full px-4 py-3 bg-white border rounded-lg h-24" required />
                  {cf.links.map((l, i) => <div key={i} className="flex gap-2"><input value={l.service} onChange={e => { const nl = [...cf.links]; nl[i].service = e.target.value; setCf(p => ({ ...p, links: nl })); }} placeholder="サービス" className="flex-1 px-4 py-2 bg-white border rounded-lg" /><input value={l.url} onChange={e => { const nl = [...cf.links]; nl[i].url = e.target.value; setCf(p => ({ ...p, links: nl })); }} placeholder="URL" className="flex-1 px-4 py-2 bg-white border rounded-lg" /></div>)}
                  <div className="pt-4 border-t">
                    <label className="block font-semibold mb-2">📖 トピック記事（任意）</label>
                    <input value={cf.topic.title} onChange={e => setCf(p => ({ ...p, topic: { ...p.topic, title: e.target.value }}))} placeholder="記事タイトル" className="w-full px-4 py-2 bg-white border rounded-lg mb-2" />
                    <input value={cf.topic.url} onChange={e => setCf(p => ({ ...p, topic: { ...p.topic, url: e.target.value }}))} placeholder="記事URL" className="w-full px-4 py-2 bg-white border rounded-lg" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold">追加</button>

                  <div className="mt-8 pt-8 border-t">
                    <h3 className="font-bold mb-4">📋 登録済みコンテンツ</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {data.flatMap(item => item.content.map((c, idx) => (
                        <div key={`${item.year}-${idx}`} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div className="flex-1">
                            <div className="font-semibold">{c.title}</div>
                            <div className="text-sm text-gray-500">{label(c.type)} • {item.year}</div>
                          </div>
                          <button onClick={() => deleteContent(item.mainEra, item.subEra, item.year, 'content', idx)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )))}
                    </div>
                  </div>
                </form>
              )}
              {tab === 'event' && (
                <form onSubmit={addE} className="bg-gray-50 rounded-lg p-6 border space-y-4">
                  <select value={ef.mainEra} onChange={e => setEf(p => ({ ...p, mainEra: e.target.value }))} className="w-full px-4 py-3 bg-white border rounded-lg" required>{eras.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
                  <input list="s2" value={ef.subEra} onChange={e => setEf(p => ({ ...p, subEra: e.target.value }))} placeholder="時代区分" className="w-full px-4 py-3 bg-white border rounded-lg" required />
                  <datalist id="s2">{subs(ef.mainEra).map((s, i) => <option key={i} value={s} />)}</datalist>
                  <input value={ef.title} onChange={e => setEf(p => ({ ...p, title: e.target.value }))} placeholder="イベント名" className="w-full px-4 py-3 bg-white border rounded-lg" required />
                  <input value={ef.year} onChange={e => setEf(p => ({ ...p, year: e.target.value }))} placeholder="年代" className="w-full px-4 py-3 bg-white border rounded-lg" required />
                  <textarea value={ef.desc} onChange={e => setEf(p => ({ ...p, desc: e.target.value }))} placeholder="概要" className="w-full px-4 py-3 bg-white border rounded-lg h-20" required />
                  <textarea value={ef.detail} onChange={e => setEf(p => ({ ...p, detail: e.target.value }))} placeholder="詳細" className="w-full px-4 py-3 bg-white border rounded-lg h-32" required />
                  <div className="pt-4 border-t">
                    <label className="block font-semibold mb-2">📖 トピック記事（任意）</label>
                    <input value={ef.topic.title} onChange={e => setEf(p => ({ ...p, topic: { ...p.topic, title: e.target.value }}))} placeholder="記事タイトル" className="w-full px-4 py-2 bg-white border rounded-lg mb-2" />
                    <input value={ef.topic.url} onChange={e => setEf(p => ({ ...p, topic: { ...p.topic, url: e.target.value }}))} placeholder="記事URL" className="w-full px-4 py-2 bg-white border rounded-lg" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold">追加</button>

                  <div className="mt-8 pt-8 border-t">
                    <h3 className="font-bold mb-4">📋 登録済みイベント</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {data.flatMap(item => item.events.map((ev, idx) => (
                        <div key={`${item.year}-${idx}`} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div className="flex-1">
                            <div className="font-semibold">{ev.title}</div>
                            <div className="text-sm text-gray-500">{item.year}</div>
                          </div>
                          <button onClick={() => deleteContent(item.mainEra, item.subEra, item.year, 'event', idx)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )))}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">🔒 管理者認証</h2>
              <button onClick={() => { setShowPasswordPrompt(false); setPasswordInput(''); }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="パスワードを入力"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
                ログイン
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;