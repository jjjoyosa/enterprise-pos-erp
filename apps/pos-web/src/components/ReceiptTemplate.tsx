import React from 'react';

interface ReceiptTemplateProps {
  sale: any;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ sale }) => {
  if (!sale) return null;

  const date = new Date(sale.createdAt).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit', 
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div 
      id="printable-receipt-container" 
      className="hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:bg-white print:text-black font-mono text-sm p-4 z-[9999]"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold font-sans">ENTERPRISE POS</h2>
        <p className="text-xs mt-1">Acme Corporation Headquarters</p>
        <p className="text-xs">Quezon City, Metro Manila</p>
        <div className="border-b-2 border-dashed border-gray-400 my-3"></div>
      </div>

      {/* Meta Data */}
      <div className="mb-4 text-xs">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{date}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Receipt #:</span>
          <span>{sale.receiptNumber}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Cashier ID:</span>
          <span>{sale.cashierId.slice(-6).toUpperCase()}</span>
        </div>
      </div>

      <div className="border-b-2 border-dashed border-gray-400 my-3"></div>

      {/* Items */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>ITEM</span>
          <span>TOTAL</span>
        </div>
        {sale.items.map((item: any, idx: number) => (
          <div key={idx} className="text-xs mb-2">
            <div className="font-bold truncate">{item.name || `Item ${item.productId.slice(-6)}`}</div>
            <div className="flex justify-between text-gray-600">
              <span>{item.quantity} x ₱{(item.subtotal / item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span>₱{item.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-b-2 border-dashed border-gray-400 my-3"></div>

      {/* Math Summary */}
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>Subtotal (VAT Inc):</span>
          <span>₱{sale.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount:</span>
            <span>-₱{sale.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-gray-300">
          <span>TOTAL:</span>
          <span>₱{sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between mt-2 text-gray-500">
          <span>Payment Method:</span>
          <span>{sale.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>VAT (12%):</span>
          <span>₱{sale.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="border-b-2 border-dashed border-gray-400 my-4"></div>

      {/* Footer */}
      <div className="text-center text-xs">
        <p className="font-bold">Thank you for your business!</p>
        <p className="mt-1 text-[10px] text-gray-500">Please keep this receipt for your records.</p>
        {/* Optional Barcode Font Placeholder */}
        <p className="mt-3 font-mono tracking-[0.2em] text-lg">*{sale.receiptNumber.slice(-8)}*</p>
      </div>
    </div>
  );
};