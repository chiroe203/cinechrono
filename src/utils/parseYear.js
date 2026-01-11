// 年代文字列を数値に変換（ソート用）
export const parseYear = (yearStr) => {
  if (!yearStr) return 0;
  const str = String(yearStr).trim();
  
  // 空文字列の場合
  if (str === '') return 0;
  
  // 紀元前またはBC形式に対応
  if (str.includes('紀元前') || str.toUpperCase().includes('BC')) {
    const match = str.match(/(\d+)/);
    if (match) {
      return -parseInt(match[1]);
    }
    return 0;
  }
  
  // 「XX世紀」形式（15世紀、15世紀前期、15世紀頃など）
  if (str.includes('世紀')) {
    const match = str.match(/(\d+)\s*世紀/);
    if (match) {
      const century = parseInt(match[1]);
      let baseYear = (century - 1) * 100 + 1; // 15世紀 → 1401
      // 前期・前半 → +15, 中期・中頃 → +50, 後期・後半 → +85
      if (str.includes('前期') || str.includes('前半')) baseYear += 15;
      else if (str.includes('中期') || str.includes('中頃')) baseYear += 50;
      else if (str.includes('後期') || str.includes('後半')) baseYear += 85;
      return baseYear;
    }
  }
  
  // 「XXXX年代」形式（1960年代、1430年代など）
  if (str.includes('年代')) {
    const match = str.match(/(\d+)\s*年代/);
    if (match) {
      let baseYear = parseInt(match[1]);
      // 前期・前半 → +2, 中期・中頃 → +5, 後期・後半 → +8
      if (str.includes('前期') || str.includes('前半')) baseYear += 2;
      else if (str.includes('中期') || str.includes('中頃')) baseYear += 5;
      else if (str.includes('後期') || str.includes('後半')) baseYear += 8;
      return baseYear;
    }
  }
  
  // ハイフン・チルダ区切りの場合は最初の年を使用（1966-1974 → 1966）
  const parts = str.split(/[-〜~～]/);
  const firstPart = parts[0];
  
  // 最初の4桁以下の連続数字を抽出（1917年 → 1917）
  const numMatch = firstPart.match(/(\d{1,4})/);
  if (numMatch) {
    return parseInt(numMatch[1]);
  }
  
  return 0;
};

// 年から世紀を計算
export const getCentury = (year) => {
  // 無効な値の場合はnullを返す
  if (year === 0 || year === null || year === undefined || isNaN(year)) return null;
  // 異常に大きい値（5000以上）は無視
  if (Math.abs(year) > 5000) return null;
  
  if (year > 0) {
    const century = Math.ceil(year / 100);
    return { century, label: `${century}世紀`, isBC: false };
  } else {
    const century = Math.ceil(Math.abs(year) / 100);
    return { century, label: `BC${century}世紀`, isBC: true };
  }
};

// 年号から大区分を自動判定
export const detectMainEra = (yearStr) => {
  const year = parseYear(yearStr);
  if (year <= 500) return 'ancient';
  if (year <= 1500) return 'medieval';
  if (year <= 1800) return 'early-modern';
  if (year < 1945) return 'modern';  // 1945年未満が近代、1945年以降は現代
  return 'contemporary';
};
