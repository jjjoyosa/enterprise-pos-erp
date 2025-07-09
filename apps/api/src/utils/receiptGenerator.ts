export const generateReceiptNumber = (): string => {
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, ''); 
  const randomStr = Math.floor(1000 + Math.random() * 9000); 
  return `SI-${dateString}-${randomStr}`;
};