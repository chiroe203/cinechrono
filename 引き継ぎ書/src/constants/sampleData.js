// サンプルデータ（デモ表示用）
export const sampleData = [
  { 
    id: 'sample1',
    mainEra: 'ancient', 
    subEra: 'ローマ帝国', 
    subEraYears: '紀元前27-476年', 
    year: '180年', 
    events: [
      { 
        type: 'history', 
        eventType: 'other', 
        title: 'カエサル暗殺', 
        desc: 'ユリウス・カエサルが元老院で暗殺される', 
        detail: 'ユリウス・カエサルは紀元前44年3月15日、ローマ元老院にて暗殺された。', 
        topic: { 
          title: 'ローマ帝国の栄光と滅亡を描く作品たち', 
          url: 'https://note.com/cinechrono/n/xxxxx' 
        } 
      }
    ], 
    content: [
      { 
        type: 'movie', 
        title: 'グラディエーター', 
        periodRange: '180年頃', 
        synopsis: 'ローマ帝国の将軍マキシマスが、皇帝に裏切られ奴隷剣闘士となり、復讐を誓う', 
        links: [
          { service: 'Amazon Prime', url: 'https://amazon.co.jp' }
        ], 
        topic: { 
          title: 'ローマ帝国の栄光と滅亡を描く作品たち', 
          url: 'https://note.com/cinechrono/n/xxxxx' 
        } 
      }
    ] 
  }
];
