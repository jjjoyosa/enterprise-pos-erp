import React from 'react';

interface ReceiptTemplateProps {
  sale: any;
  change?: number;
  amountTendered?: number;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ sale, change, amountTendered }) => {
  if (!sale) return null;

  const date = new Date(sale.createdAt).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit', 
    hour: '2-digit', minute: '2-digit'
  });

  
  const isVatable = true; 
  const vatableSales = isVatable ? sale.total / 1.12 : 0;
  const vatAmount = isVatable ? sale.total - vatableSales : 0;
  const vatExemptSales = isVatable ? 0 : sale.total;
  const zeroRatedSales = 0;

  return (
    <div 
      id="printable-receipt-container" 
      className="font-mono text-sm p-4 text-black bg-white w-full max-w-sm mx-auto shadow-sm"
    >
      {/* BIR CORPORATE HEADER */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold font-sans">ENTERPRISE POS</h2>
        <p className="text-xs mt-1">Acme Corporation Headquarters</p>
        <p className="text-xs">Quezon City, Metro Manila</p>
        <p className="text-xs font-bold mt-1">VAT REG TIN: 123-456-789-0000</p>
        <p className="text-[10px]">MIN: 123456789 | SN: 987654321</p>
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
          <span>
            {sale.cashierId 
              ? sale.cashierId.toString().slice(-6).toUpperCase() 
              : 'SYS-01'
            }
          </span>
        </div>
        {sale.customerId && (
          <div className="flex justify-between mt-1 pt-1 border-t border-gray-200 border-dashed">
            <span>Customer:</span>
            <span className="font-bold">{sale.customerId.firstName} {sale.customerId.lastName}</span>
          </div>
        )}
      </div>

      <div className="border-b-2 border-dashed border-gray-400 my-3"></div>

      {/* Items */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>ITEM</span>
          <span>TOTAL</span>
        </div>
        {sale.items?.map((item: any, idx: number) => (
          <div key={idx} className="text-xs mb-2">
            <div className="font-bold truncate">{item.name || `Item ${item.productId?.slice(-6)}`}</div>
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
          <span>₱{sale.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount:</span>
            <span>-₱{sale.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-gray-300">
          <span>TOTAL:</span>
          <span>₱{sale.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        
        {/* Render Tendered and Change amounts if they were provided (CASH) */}
        {amountTendered !== undefined && change !== undefined && (
          <>
            <div className="flex justify-between font-medium mt-1">
              <span>Cash Tendered:</span>
              <span>₱{amountTendered.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Change Due:</span>
              <span>₱{change.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </>
        )}

        <div className="flex justify-between mt-2 pt-2 border-t border-gray-300 text-gray-500">
          <span>Payment Method:</span>
          <span>{sale.paymentMethod}</span>
        </div>
      </div>

      <div className="border-b-2 border-dashed border-gray-400 my-3"></div>

      {/* BIR VAT BREAKDOWN */}
      <div className="text-[11px] text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>VATable Sales:</span>
          <span>₱{vatableSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT Amount (12%):</span>
          <span>₱{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT-Exempt Sales:</span>
          <span>₱{vatExemptSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span>Zero-Rated Sales:</span>
          <span>₱{zeroRatedSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="border-b-2 border-dashed border-gray-400 my-4"></div>

      {/* LOYALTY REWARDS SECTION */}
      {sale.customerId && (
        <>
          <div className="text-center text-xs mb-4">
            <div className="font-bold text-gray-800 uppercase tracking-widest">
              Loyalty Rewards
            </div>
            <div className="text-gray-600 mt-1 font-medium">
              Points Earned This Visit: <span className="font-bold text-black">{Math.floor(sale.total / 100)}</span>
            </div>
          </div>
          <div className="border-b-2 border-dashed border-gray-400 my-4"></div>
        </>
      )}

      {/* BIR FOOTER */}
      <div className="text-center text-xs">
        <p className="font-bold text-sm mb-1 uppercase">THIS IS AN OFFICIAL RECEIPT</p>
        <p className="font-bold">Thank you for your business!</p>
        <p className="mt-2 text-[10px] text-gray-500">Software Provider: Tech</p>
        <p className="text-[10px] text-gray-500">PTU No: 123-456-7890-11111</p>
        <p className="mt-3 font-mono tracking-[0.2em] text-lg">*{sale.receiptNumber?.slice(-8)}*</p>
      </div>

      {/* Global CSS injected specifically for printing this component */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt-container, #printable-receipt-container * { visibility: visible; }
          #printable-receipt-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 10px; box-shadow: none; border: none; }
        }
      `}</style>
    </div>
  );
};