import React, { useState, useEffect, useRef } from 'react';
import { numberToWords } from '../utils/numberToWords';

export default function InvoicePreview({ invoiceData, previewRef }) {
    const [scale, setScale] = useState(1);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (!wrapperRef.current) return;
            const containerWidth = wrapperRef.current.clientWidth;
            const containerHeight = wrapperRef.current.clientHeight;
            
            const style = window.getComputedStyle(wrapperRef.current);
            const paddingLeft = parseFloat(style.paddingLeft) || 0;
            const paddingRight = parseFloat(style.paddingRight) || 0;
            const paddingTop = parseFloat(style.paddingTop) || 0;
            const paddingBottom = parseFloat(style.paddingBottom) || 0;
            
            const availableWidth = containerWidth - paddingLeft - paddingRight;
            const availableHeight = containerHeight - paddingTop - paddingBottom;
            
            const paperWidth = 794; // standard A4 width in CSS px
            const paperHeight = 1120; // standard A4 height in CSS px
            
            const widthScale = (availableWidth - 16) / paperWidth;
            
            let newScale;
            // Only constrain by viewport height on desktop (> 1024px) where form and preview are side-by-side
            if (window.innerWidth > 1024 && availableHeight > 200) {
                const heightScale = (availableHeight - 16) / paperHeight;
                newScale = Math.min(widthScale, heightScale, 1);
            } else {
                newScale = Math.min(widthScale, 1);
            }
            
            newScale = Math.max(0.1, newScale);
            setScale(newScale);
        };

        const observer = new ResizeObserver(() => {
            handleResize();
        });

        if (wrapperRef.current) {
            observer.observe(wrapperRef.current);
        }

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const {
        invoiceNo = '',
        invoiceDate = '',
        terms = 'Due on Receipt',
        placeOfSupply = '',
        sender = {},
        billingDetails = {},
        shippingDetails = {},
        items = [],
        taxType = 'GST',
        bankDetails = {},
        notes = '',
        signature = '',
        watermark = ''
    } = invoiceData;

    const displaySignature = signature || '/authorized-stamp.png';


    // Helper: format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format matching screenshot
    };

    // Computations
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    
    // Tax Breakdown Aggregator
    // We group by tax rate to show separate CGST/SGST or IGST lines per rate, just like the screenshot!
    // E.g. CGST 2.5% / SGST 2.5% for 5% tax items, CGST 9% / SGST 9% for 18% tax items.
    const taxRatesMap = {};
    items.forEach(item => {
        const itemSubtotal = item.qty * item.rate;
        const rate = parseFloat(item.gstRate) || 0;
        if (rate > 0) {
            taxRatesMap[rate] = (taxRatesMap[rate] || 0) + itemSubtotal;
        }
    });

    const taxRows = [];
    let totalTaxAmount = 0;

    Object.keys(taxRatesMap).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach(rateStr => {
        const rate = parseFloat(rateStr);
        const baseAmount = taxRatesMap[rateStr];
        const taxAmount = baseAmount * (rate / 100);
        totalTaxAmount += taxAmount;

        if (taxType === 'GST') {
            const splitRate = (rate / 2).toFixed(1).replace('.0', '');
            const splitTax = taxAmount / 2;
            
            taxRows.push({
                label: `CGST ${splitRate}%`,
                rateText: `(${splitRate}%)`,
                amount: splitTax
            });
            taxRows.push({
                label: `SGST ${splitRate}%`,
                rateText: `(${splitRate}%)`,
                amount: splitTax
            });
        } else {
            taxRows.push({
                label: `IGST ${rate}%`,
                rateText: `(${rate}%)`,
                amount: taxAmount
            });
        }
    });

    const totalAmount = subtotal + totalTaxAmount;

    // Default logo placeholder (a circular evotar gear SVG)
    const DefaultEvotarLogo = () => (
        <svg viewBox="0 0 100 100" className="evotar-logo-svg" style={{ width: '45px', height: '45px', marginRight: '8px' }}>
            <circle cx="50" cy="50" r="40" stroke="#f25f22" strokeWidth="6" fill="none" strokeDasharray="18 4" />
            <circle cx="50" cy="50" r="22" stroke="#4a5568" strokeWidth="4" fill="none" />
            <polygon points="50,42 58,58 42,58" fill="#f25f22" />
        </svg>
    );

    return (
        <div className="flex-1 p-8 overflow-hidden w-full max-w-full flex justify-center items-start max-sm:p-4 max-sm:px-1" ref={wrapperRef}>
            <div 
                className="invoice-paper-layout-reserver" 
                style={{ 
                    width: `${794 * scale}px`, 
                    height: `${1120 * scale}px`,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.1s ease-out'
                }}
            >
                <div 
                    className="invoice-paper-scale-container" 
                    style={{ 
                        width: '794px', 
                        height: '1120px',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        position: 'absolute',
                        top: 0,
                        left: 0
                    }}
                >
                    <div 
                        className="invoice-paper evotar-theme" 
                        id="invoice-preview-capture" 
                        ref={previewRef}
                        style={{ 
                            margin: 0
                        }}
                    >
                    {/* 1. Watermark logo */}
                    <div className="invoice-watermark">
                        <img src="/evotar-logo.png" alt="Watermark" />
                    </div>

                    <div className="invoice-inner">
                        {/* 2. Top Centered Logo */}
                        <div className="evotar-header-centered">
                            <img src="/evotar-logo.png" className="evotar-logo-img" alt="Company Logo" style={{ height: '130px', width: 'auto', marginRight: 0 }} />
                            <div> 
                                <h2 className="sender-name-red" style={{ fontSize: '20px' }}>DAK SOLAR ENERGY</h2>
                                <h4 className="sender-black" style={{ color: '#51a3c6' }} >POWER BY EVOTER</h4>
                            </div>
                        </div>
                        <h1 className="evotar-invoice-title">TAX INVOICE</h1>

                    {/* 3. Sender Details and Tax Invoice Header Grid */}
                    <div className="evotar-info-row">
                        <div className="sender-block">
                            <p className="sender-address-text">
                                975,Ground Floor,Soni Tekro
                                {"\n"}Sajod,Gujarat
                            </p>
                            <p className="sender-contact-text">
                                <span>+91-6358995570</span>
                                <span>ankevotarsolar9@gmail.com</span>
                            </p>
                            <p className="sender-gstin">
                                <strong>GSTIN:</strong> 24AVUPV3964H1ZS
                            </p>
                        </div>

                        <div className="meta-block">
                            
                            <table className="evotar-meta-table">
                               <tbody>
                                    <tr>
                                        <th>Tax Invoice No.</th>
                                        <td><strong>: {invoiceNo || 'INV-2026-001'}</strong></td>
                                    </tr>
                                    <tr>
                                        <th>Invoice Date</th>
                                        <td>: {formatDate(invoiceDate)}</td>
                                    </tr>
                                    <tr>
                                        <th>Terms</th>
                                        <td>: {terms}</td>
                                    </tr>
                                    <tr>
                                        <th>Place Of Supply</th>
                                        <td>: Gujarat (24)</td>
                                    </tr>
                               </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4. Parties Columns (Bill To / Ship To) */}
                    <div className="evotar-parties-row">
                        <div className="party-col">
                            <span className="party-title-header">Bill To</span>
                            <h4 className="party-name-red">{billingDetails.name || 'Client Name / Company'}</h4>
                            <p className="party-address-details">
                                {billingDetails.address && <span>{billingDetails.address}<br /></span>}
                                {billingDetails.district && <span>{billingDetails.district}<br /></span>}
                                {billingDetails.state && <span>{billingDetails.state}<br /></span>}
                                {billingDetails.country && <span>{billingDetails.country}</span>}
                            </p>
                            {billingDetails.gstin && (
                                <p className="party-gstin-line"><strong>GSTIN:</strong> {billingDetails.gstin}</p>
                            )}
                        </div>
                        <div className="party-col">
                            <span className="party-title-header">Ship To</span>
                            <h4 className="party-name-grey">{shippingDetails.name || billingDetails.name || 'Same as Bill To'}</h4>
                            <p className="party-address-details">
                                {shippingDetails.address && <span>{shippingDetails.address}<br /></span>}
                                {shippingDetails.district && <span>{shippingDetails.district}<br /></span>}
                                {shippingDetails.state && <span>{shippingDetails.state}<br /></span>}
                                {shippingDetails.country && <span>{shippingDetails.country}</span>}
                            </p>
                        </div>
                    </div>

                    {/* 5. Line Items Table */}
                    <div className="evotar-table-wrapper">
                        <table className="evotar-items-table">
                            <thead>
                                <tr>
                                    <th className="cell-sr">SR No.</th>
                                    <th className="cell-desc">Item & Description</th>
                                    <th className="cell-hsn">HSN/SAC</th>
                                    <th className="cell-qty">Qty</th>
                                    <th className="cell-rate">Rate</th>
                                    <th className="cell-amount">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? (
                                    items.map((item, idx) => {
                                        const amount = item.qty * item.rate;
                                        return (
                                            <tr key={idx}>
                                                <td className="cell-sr text-center">{idx + 1}</td>
                                                <td className="cell-desc">
                                                    <div className="item-name-bold">{item.description}</div>
                                                </td>
                                                <td className="cell-hsn text-center">{item.hsn || '-'}</td>
                                                <td className="cell-qty text-center">
                                                    {item.qty} {item.unit || 'NOS'}
                                                </td>
                                                <td className="cell-rate text-right">
                                                    {parseFloat(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="cell-amount text-right">
                                                    {amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center empty-placeholder-row">
                                            No items added yet. Click "+ Add Line Item" on the builder.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 6. Footer section (Notes, bank details, calculations, signatures) */}
                    <div className="evotar-footer-summary">
                        {/* Left Summary Details */}
                        <div className="summary-left">
                            <div className="total-in-words-box">
                                <strong>Total In Words</strong>
                                <p className="words-text-italic">{numberToWords(totalAmount)}</p>
                            </div>

                            {notes && (
                                <div className="notes-box">
                                    <strong>Notes</strong>
                                    <p className="notes-details">{notes}</p>
                                </div>
                            )}

                            {bankDetails && bankDetails.bankName && (
                                <div className="bank-details-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="bank-info-text">
                                        <p><strong>Bank Name :</strong> {bankDetails.bankName}</p>
                                        <p><strong>A/C Number :</strong> {bankDetails.acNumber}</p>
                                        <p><strong>IFSC CODE :</strong> {bankDetails.ifscCode}</p>
                                        <p><strong>Branch :</strong> {bankDetails.branch}</p>
                                    </div>
                                    <div className="bank-qr-code" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '15px' }}>
                                        <img src="/payment-qr.png" alt="Payment QR" style={{ width: '150px', height: '150px', objectFit: 'contain', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px', backgroundColor: '#ffffff' }} />
                                        <span style={{ fontSize: '8px', color: '#64748b', fontWeight: 'bold', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Scan to Pay</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Calculations block */}
                        <div className="summary-right">
                            <table className="evotar-totals-table">
                                <tbody>
                                    <tr>
                                        <th>Sub Total</th>
                                        <td>
                                            {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    
                                    {taxRows.map((row, idx) => (
                                        <tr key={idx}>
                                            <th>{row.label}</th>
                                            <td>
                                                {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="grand-total-row-evotar">
                                        <th>Total</th>
                                        <td>
                                            {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* FOR Evotar / Signatures */}
                            <div className="signature-area-evotar">
                                <span className="for-company-title">
                                    FOR EVOTAR TECHNOLOGIES PRIVATE LIMITED
                                </span>
                                
                                <div className="stamp-sig-container">
                                    {displaySignature && (
                                        <img src={displaySignature} alt="Authorized Stamp/Signature" className="seal-stamp-img" />
                                    )}
                                </div>
                                
                                <span className="auth-sig-label">Authorized Signature</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
);
}
