import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { ArrowLeft, Printer, Download, Receipt } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/invoices';

const initialInvoiceState = {
    invoiceNo: '',
    invoiceDate: '',
    terms: 'Due on Receipt',
    placeOfSupply: 'Gujarat (24)',
    sender: {
        name: 'EVOTAR TECHNOLOGIES PRIVATE LIMITED',
        address: 'Ahemdabad Gujarat 380009\nIndia',
        phone: '91-6358995570',
        email: 'evotartech@gmail.com',
        website: '',
        gstin: '24AAECE4542N1ZI',
        logo: ''
    },
    billingDetails: {
        name: '',
        address: '',
        district: '',
        state: '',
        country: '',
        gstin: ''
    },
    shippingDetails: {
        name: '',
        address: '',
        district: '',
        state: '',
        country: ''
    },
    items: [
        { description: 'SOLAX INVERTER 5. KW', hsn: '85044090', qty: 1, unit: 'NOS', rate: 42500, gstRate: 5 },
        { description: 'ACDB (As per requirement)', hsn: '85371000', qty: 1, unit: 'NOS', rate: 2800, gstRate: 5 },
        { description: 'SOLAR ROOFTOP LABOUR', hsn: '998513', qty: 1, unit: 'OTH', rate: 2200, gstRate: 18 }
    ],
    taxType: 'GST',
    bankDetails: {
        bankName: 'IDFC FIRST BANK',
        acNumber: '10125829352',
        ifscCode: 'IDFB0040332',
        branch: 'Nikol Ahmedabad'
    },
    notes: 'Thanks for your business.',
    signature: '/authorized-stamp.png',
    watermark: ''
};

export default function App() {
    const [view, setView] = useState('dashboard'); // 'dashboard' | 'editor'
    const [invoices, setInvoices] = useState([]);
    const [invoiceData, setInvoiceData] = useState(initialInvoiceState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [pdfGenerating, setPdfGenerating] = useState(false);
    
    const previewRef = useRef();

    // Fetch invoices from backend
    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_BASE);
            if (!res.ok) throw new Error('Failed to retrieve history');
            const data = await res.json();
            setInvoices(data);
        } catch (err) {
            console.error('API Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Load defaults and presets on create
    const handleCreateNew = () => {
        setIsEditMode(false);
        setEditId(null);
        
        const freshData = JSON.parse(JSON.stringify(initialInvoiceState));
        
        // Load custom invoice number
        freshData.invoiceNo = 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        freshData.invoiceDate = new Date().toISOString().split('T')[0];

        // Retrieve local storage preset if available
        const rawPreset = localStorage.getItem('invoice_craft_mern_preset');
        if (rawPreset) {
            try {
                const preset = JSON.parse(rawPreset);
                if (preset.sender) freshData.sender = preset.sender;
                if (preset.bankDetails) freshData.bankDetails = preset.bankDetails;
                if (preset.taxType) freshData.taxType = preset.taxType;
                if (preset.placeOfSupply) freshData.placeOfSupply = preset.placeOfSupply;
            } catch (e) {
                console.error('Preset read error', e);
            }
        }
        
        setInvoiceData(freshData);
        setView('editor');
    };

    const handleEdit = (inv) => {
        setIsEditMode(true);
        setEditId(inv._id);
        
        // Dates need mapping to ISO strings
        const formattedInv = {
            ...inv,
            invoiceDate: inv.invoiceDate ? inv.invoiceDate.split('T')[0] : '',
            signature: inv.signature || '/authorized-stamp.png'
        };
        setInvoiceData(formattedInv);
        setView('editor');
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this invoice permanently from MongoDB?')) return;
        
        try {
            const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Deletion failed');
            }
            alert('Invoice deleted successfully.');
            fetchInvoices();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    // Calculate totals for saving
    const computeTotals = () => {
        const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
        let totalTax = 0;
        
        invoiceData.items.forEach(item => {
            const rate = parseFloat(item.gstRate) || 0;
            totalTax += (item.qty * item.rate) * (rate / 100);
        });

        const total = subtotal + totalTax;

        if (invoiceData.taxType === 'GST') {
            return {
                subtotal,
                cgst: totalTax / 2,
                sgst: totalTax / 2,
                igst: 0,
                discount: 0,
                shipping: 0,
                total
            };
        } else {
            return {
                subtotal,
                cgst: 0,
                sgst: 0,
                igst: totalTax,
                discount: 0,
                shipping: 0,
                total
            };
        }
    };

    // Submit invoice save/update API request
    const handleSaveInvoice = async () => {
        if (!invoiceData.invoiceNo) return alert('Invoice Number is required.');
        if (!invoiceData.billingDetails.name) return alert('Client Name is required.');
        if (invoiceData.items.length === 0) return alert('Add at least one line item.');

        const submissionData = {
            ...invoiceData,
            placeOfSupply: 'Gujarat (24)',
            sender: {
                name: 'EVOTAR TECHNOLOGIES PRIVATE LIMITED',
                address: 'Ahemdabad Gujarat 380009\nIndia',
                phone: '91-6358995570',
                email: 'evotartech@gmail.com',
                website: '',
                gstin: '24AAECE4542N1ZI',
                logo: ''
            },
            totals: computeTotals()
        };

        const url = isEditMode ? `${API_BASE}/${editId}` : API_BASE;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to save invoice.');
            }

            alert(isEditMode ? 'Invoice updated successfully in MongoDB!' : 'Invoice saved successfully to MongoDB!');
            fetchInvoices();
            setView('dashboard');
        } catch (err) {
            alert(`API Error: ${err.message}`);
        }
    };

    // Generate PDF via html2pdf.js loaded from index.html CDN script
    const handleDownloadPDF = () => {
        if (!window.html2pdf) {
            return alert('PDF printing engine is loading. Please try again in a few seconds.');
        }

        const element = previewRef.current;
        if (!element) return alert('No invoice preview found.');

        const filename = `${invoiceData.invoiceNo || 'tax-invoice'}.pdf`;
        
        const opt = {
            margin:       0,
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true, 
                letterRendering: true,
                backgroundColor: '#ffffff'
            },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        setPdfGenerating(true);

        window.html2pdf()
            .from(element)
            .set(opt)
            .save()
            .then(() => {
                setPdfGenerating(false);
            })
            .catch(err => {
                console.error(err);
                alert('PDF render failure. Please print using standard browser print utility.');
                setPdfGenerating(false);
            });
    };

    return (
        <div className="flex flex-col h-screen lg:overflow-hidden overflow-visible bg-bg-primary text-text-primary">
            {/* Nav Header bar */}
            <header className="h-auto sm:h-[70px] bg-white/80 backdrop-blur-md border-b border-border-color px-4 sm:px-8 flex sm:flex-row flex-col items-center justify-between gap-3 sm:gap-0 z-10 shrink-0">
                <div className="flex sm:flex-row flex-col items-center gap-1 sm:gap-3 cursor-pointer text-center sm:text-left" onClick={() => setView('dashboard')}>
                    <img src="./evotar-logo.png" className="h-11 w-auto mr-0 sm:mr-2 max-sm:mb-1" alt="DAK Solar Logo" />
                    <div className="flex flex-col items-center sm:items-start">
                        <h1 className="text-[1.2rem] font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">DAK Solar Invoice</h1>
                        <span className="text-[0.7rem] text-text-muted mt-[-2px]">Tax Invoice Database</span>
                    </div>
                </div>
                
                {view === 'editor' && (
                    <div className="max-sm:w-full">
                        <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border border-border-color bg-bg-tertiary text-text-primary hover:bg-border-color-hover transition-colors max-sm:w-full cursor-pointer" onClick={() => setView('dashboard')}>
                            <ArrowLeft size={16} /> Back to History
                        </button>
                    </div>
                )}
            </header>

            <main className="flex-1 flex flex-col lg:overflow-hidden overflow-visible relative">
                {view === 'dashboard' ? (
                    <Dashboard 
                        invoices={invoices} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                        onCreateNew={handleCreateNew}
                        loading={loading}
                    />
                ) : (
                    <div className="grid lg:grid-cols-[1.1fr_0.9fr] grid-cols-1 h-full lg:overflow-hidden overflow-visible">
                        {/* Left Column Editor Panel */}
                        <InvoiceForm 
                            invoiceData={invoiceData}
                            setInvoiceData={setInvoiceData}
                            onSave={handleSaveInvoice}
                            onReset={handleCreateNew}
                            isEditMode={isEditMode}
                        />
                        
                        {/* Right Column Preview Panel */}
                        <section className="bg-preview-bg flex flex-col lg:overflow-hidden overflow-visible h-full" aria-label="Invoice PDF Preview">
                            <div className="h-auto lg:h-[60px] bg-white border-b border-border-color px-4 lg:px-6 flex lg:flex-row flex-col items-center justify-between gap-3 lg:gap-0 z-5 shrink-0 p-4 lg:p-0">
                                <span className="text-xs lg:text-sm font-bold text-text-secondary flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-success animate-[pulse_1.6s_infinite]"></span> Real-time Preview
                                </span>
                                <div className="flex gap-2 max-lg:w-full max-lg:justify-center">
                                    <button type="button" className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 text-sm font-semibold rounded-lg border border-border-color bg-bg-tertiary text-text-primary hover:bg-border-color-hover transition-colors max-lg:flex-1 cursor-pointer" onClick={() => window.print()}>
                                        <Printer size={16} /> Print
                                    </button>
                                    <button 
                                        type="button" 
                                        className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 text-sm font-semibold rounded-lg bg-accent-primary text-white hover:bg-accent-hover hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none max-lg:flex-1 cursor-pointer" 
                                        onClick={handleDownloadPDF}
                                        disabled={pdfGenerating}
                                    >
                                        <Download size={16} /> 
                                        {pdfGenerating ? 'Generating...' : 'Download PDF'}
                                    </button>
                                </div>
                            </div>
                            
                            <InvoicePreview 
                                invoiceData={invoiceData} 
                                previewRef={previewRef}
                            />
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}
