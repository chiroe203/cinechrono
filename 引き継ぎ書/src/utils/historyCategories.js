// historyCategory/historyCategoriesの正規化ヘルパー
export const getHistoryCategories = (item) => {
  if (item?.historyCategories && Array.isArray(item.historyCategories)) {
    return item.historyCategories;
  }
  if (item?.historyCategory) {
    return [item.historyCategory];
  }
  return ['world'];
};

// アイテムが指定されたカテゴリを持つか判定
export const hasHistoryCategory = (item, category) => {
  const cats = getHistoryCategories(item);
  return cats.includes(category);
};
