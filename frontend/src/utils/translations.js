export const categoryTranslations = {
  Vegetables: 'Legume',
  'Meat & Poultry': 'Carne și Pui',
  'Dairy & Eggs': 'Lactate și Ouă',
  'Dry Goods': 'Produse Uscate',
  'Spices & Herbs': 'Condimente și Ierburi',
  Liquids: 'Lichide',
  General: 'General',
};

export const unitTranslations = {
  kg: 'kg',
  g: 'g',
  L: 'L',
  ml: 'ml',
  units: 'buc',
  bunch: 'leg',
};

export const translateCategory = (category) => {
  return categoryTranslations[category] || category;
};

export const translateUnit = (unit) => {
  return unitTranslations[unit] || unit;
};
