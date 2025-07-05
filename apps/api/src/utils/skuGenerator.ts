export const generateSKU = (productName: string): string => {
  
  const prefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ITM');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${randomStr}`;
};