import React, { useEffect, useRef } from 'react';
import { Users, FileText, ListOrdered, CreditCard, Image, X, Trash2, Plus, Save } from 'lucide-react';

export default function InvoiceForm({ invoiceData, setInvoiceData, onSave, onReset, isEditMode }) {
    // Accordion active state trackers
    const [activeSection, setActiveSection] = React.useState('client');

    const toggleSection = (sectionName) => {
        setActiveSection(activeSection === sectionName ? '' : sectionName);
    };

    // Helper: update nested object state
    const updateBilling = (field, value) => {
        setInvoiceData(prev => ({
            ...prev,
            billingDetails: { ...prev.billingDetails, [field]: value }
        }));
    };

    const updateShipping = (field, value) => {
        setInvoiceData(prev => ({
            ...prev,
            shippingDetails: { ...prev.shippingDetails, [field]: value }
        }));
    };

    const updateBank = (field, value) => {
        setInvoiceData(prev => ({
            ...prev,
            bankDetails: { ...prev.bankDetails, [field]: value }
        }));
    };

    // Auto-sync shipping address checkbox state
    const [sameAsBilling, setSameAsBilling] = React.useState(false);

    useEffect(() => {
        if (sameAsBilling) {
            setInvoiceData(prev => ({
                ...prev,
                shippingDetails: {
                    name: prev.billingDetails.name || '',
                    address: prev.billingDetails.address || '',
                    district: prev.billingDetails.district || '',
                    state: prev.billingDetails.state || '',
                    country: prev.billingDetails.country || ''
                }
            }));
        }
    }, [
        sameAsBilling, 
        invoiceData.billingDetails.name, 
        invoiceData.billingDetails.address,
        invoiceData.billingDetails.district,
        invoiceData.billingDetails.state,
        invoiceData.billingDetails.country
    ]);

    // Handle Image uploads (Logo, Signature, Watermark)
    const handleImageUpload = (e, targetField, nestedObject = null) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (PNG, JPG, SVG).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            if (nestedObject) {
                setInvoiceData(prev => ({
                    ...prev,
                    [nestedObject]: { ...prev[nestedObject], [targetField]: dataUrl }
                }));
            } else {
                setInvoiceData(prev => ({ ...prev, [targetField]: dataUrl }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (targetField, nestedObject = null) => {
        if (nestedObject) {
            setInvoiceData(prev => ({
                ...prev,
                [nestedObject]: { ...prev[nestedObject], [targetField]: '' }
            }));
        } else {
            setInvoiceData(prev => ({ ...prev, [targetField]: '' }));
        }
    };

    // Item management
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...invoiceData.items];
        updatedItems[index][field] = value;
        setInvoiceData(prev => ({ ...prev, items: updatedItems }));
    };

    const handleAddItem = () => {
        setInvoiceData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', hsn: '', qty: 1, unit: 'NOS', rate: 0, gstRate: 18 }]
        }));
    };

    const handleRemoveItem = (index) => {
        const updatedItems = invoiceData.items.filter((_, idx) => idx !== index);
        setInvoiceData(prev => ({ ...prev, items: updatedItems }));
    };

    // Save Preset bank & supply defaults to LocalStorage
    const handleSavePreset = () => {
        const preset = {
            bankDetails: invoiceData.bankDetails,
            taxType: invoiceData.taxType,
            placeOfSupply: invoiceData.placeOfSupply
        };
        localStorage.setItem('invoice_craft_mern_preset', JSON.stringify(preset));
        alert('Bank profile defaults successfully saved to local storage!');
    };

    return (
        <section className="p-4 sm:p-6 overflow-y-auto bg-bg-primary border-r border-border-color relative pt-16 md:pt-[4.5rem] lg:h-full h-auto">
            <div className="absolute top-0 left-0 right-0 h-[60px] bg-bg-primary border-b border-dashed border-border-color flex items-center justify-end px-4 sm:px-6 gap-3 z-5 max-[480px]:relative max-[480px]:h-auto max-[480px]:p-3 max-[480px]:flex-row max-[480px]:justify-between max-[480px]:bg-bg-secondary max-[480px]:border max-[480px]:border-border-color max-[480px]:rounded-xl max-[480px]:mb-4">
                <button type="button" onClick={handleSavePreset} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-border-color bg-bg-tertiary text-text-primary hover:bg-border-color-hover transition-colors cursor-pointer" title="Save Business Profile Settings">
                    <Save size={14} /> Save Profile
                </button>
                <button type="button" onClick={onReset} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-danger-light text-danger border border-red-200/20 hover:bg-danger hover:text-white transition-colors cursor-pointer">
                    Reset Form
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {/* 2. Client Details (Billing & Shipping) */}
                <div className={`bg-bg-card border border-border-color rounded-xl overflow-hidden transition-all duration-300 hover:border-border-color-hover ${activeSection === 'client' ? 'shadow-[var(--shadow-main)] border-accent-primary/30 active' : ''}`}>
                    <button type="button" className="w-full bg-none border-none p-[1.2rem] flex items-center justify-between font-bold text-text-primary cursor-pointer text-left" onClick={() => toggleSection('client')}>
                        <span className="flex items-center gap-3 text-[0.95rem]">
                            <Users size={18} className="text-accent-primary" /> Bill To & Ship To Details
                        </span>
                        <span className={`text-[0.75rem] text-text-muted transition-transform duration-300 ${activeSection === 'client' ? 'rotate-180 text-accent-primary' : ''}`}>▼</span>
                    </button>
                    <div className={`transition-[max-height] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeSection === 'client' ? 'overflow-visible' : 'overflow-hidden'}`} style={{ maxHeight: activeSection === 'client' ? '1200px' : '0' }}>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-border-color">
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <strong className="text-xs uppercase tracking-wider text-text-secondary">BILL TO</strong>
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Client Name *</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Hanwant singh Rathore" 
                                    value={invoiceData.billingDetails.name || ''} 
                                    onChange={(e) => updateBilling('name', e.target.value)}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Client Address</label>
                                <input 
                                    type="text" 
                                    placeholder="Street, Locality" 
                                    value={invoiceData.billingDetails.address || ''} 
                                    onChange={(e) => updateBilling('address', e.target.value)}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">District</label>
                                <input 
                                    type="text" 
                                    placeholder="GANDHIDHAM" 
                                    value={invoiceData.billingDetails.district || ''} 
                                    onChange={(e) => updateBilling('district', e.target.value)}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">State</label>
                                <input 
                                    type="text" 
                                    placeholder="Gujarat" 
                                    value={invoiceData.billingDetails.state || ''} 
                                    onChange={(e) => updateBilling('state', e.target.value)}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Country</label>
                                <input 
                                    type="text" 
                                    placeholder="India" 
                                    value={invoiceData.billingDetails.country || ''} 
                                    onChange={(e) => updateBilling('country', e.target.value)}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Client GSTIN (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="GSTIN Code" 
                                    value={invoiceData.billingDetails.gstin || ''} 
                                    onChange={(e) => updateBilling('gstin', e.target.value)}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                            
                            <div className="sm:col-span-2 flex flex-row items-center gap-2 mt-2">
                                <input 
                                    type="checkbox" 
                                    id="same-billing" 
                                    checked={sameAsBilling} 
                                    onChange={(e) => setSameAsBilling(e.target.checked)}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor="same-billing" className="cursor-pointer font-semibold text-sm">Shipping details same as Billing</label>
                            </div>

                            {!sameAsBilling && (
                                <>
                                    <div className="sm:col-span-2 border-t border-dashed border-border-color pt-4 mt-2">
                                        <strong className="text-xs uppercase tracking-wider text-text-secondary">SHIP TO</strong>
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Consignee Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="Shipping recipient" 
                                            value={invoiceData.shippingDetails.name || ''} 
                                            onChange={(e) => updateShipping('name', e.target.value)}
                                            className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Shipping Address</label>
                                        <input 
                                            type="text" 
                                            placeholder="Street, Locality" 
                                            value={invoiceData.shippingDetails.address || ''} 
                                            onChange={(e) => updateShipping('address', e.target.value)}
                                            className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">District</label>
                                        <input 
                                            type="text" 
                                            placeholder="GANDHIDHAM" 
                                            value={invoiceData.shippingDetails.district || ''} 
                                            onChange={(e) => updateShipping('district', e.target.value)}
                                            className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">State</label>
                                        <input 
                                            type="text" 
                                            placeholder="Gujarat" 
                                            value={invoiceData.shippingDetails.state || ''} 
                                            onChange={(e) => updateShipping('state', e.target.value)}
                                            className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Country</label>
                                        <input 
                                            type="text" 
                                            placeholder="India" 
                                            value={invoiceData.shippingDetails.country || ''} 
                                            onChange={(e) => updateShipping('country', e.target.value)}
                                            className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Invoice Metadata */}
                <div className={`bg-bg-card border border-border-color rounded-xl overflow-hidden transition-all duration-300 hover:border-border-color-hover ${activeSection === 'metadata' ? 'shadow-[var(--shadow-main)] border-accent-primary/30 active' : ''}`}>
                    <button type="button" className="w-full bg-none border-none p-[1.2rem] flex items-center justify-between font-bold text-text-primary cursor-pointer text-left" onClick={() => toggleSection('metadata')}>
                        <span className="flex items-center gap-3 text-[0.95rem]">
                            <FileText size={18} className="text-accent-primary" /> Invoice Details
                        </span>
                        <span className={`text-[0.75rem] text-text-muted transition-transform duration-300 ${activeSection === 'metadata' ? 'rotate-180 text-accent-primary' : ''}`}>▼</span>
                    </button>
                    <div className={`transition-[max-height] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeSection === 'metadata' ? 'overflow-visible' : 'overflow-hidden'}`} style={{ maxHeight: activeSection === 'metadata' ? '1200px' : '0' }}>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-border-color">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Invoice Number *</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="ER-G-INV-262795" 
                                    value={invoiceData.invoiceNo || ''} 
                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNo: e.target.value }))}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Invoice Date *</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={invoiceData.invoiceDate ? invoiceData.invoiceDate.split('T')[0] : ''} 
                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Terms</label>
                                <input 
                                    type="text" 
                                    placeholder="Due on Receipt" 
                                    value={invoiceData.terms || ''} 
                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, terms: e.target.value }))}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Line Items */}
                <div className={`bg-bg-card border border-border-color rounded-xl overflow-hidden transition-all duration-300 hover:border-border-color-hover ${activeSection === 'items' ? 'shadow-[var(--shadow-main)] border-accent-primary/30 active' : ''}`}>
                    <button type="button" className="w-full bg-none border-none p-[1.2rem] flex items-center justify-between font-bold text-text-primary cursor-pointer text-left" onClick={() => toggleSection('items')}>
                        <span className="flex items-center gap-3 text-[0.95rem]">
                            <ListOrdered size={18} className="text-accent-primary" /> Line Items
                        </span>
                        <span className={`text-[0.75rem] text-text-muted transition-transform duration-300 ${activeSection === 'items' ? 'rotate-180 text-accent-primary' : ''}`}>▼</span>
                    </button>
                    <div className={`transition-[max-height] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeSection === 'items' ? 'overflow-visible' : 'overflow-hidden'}`} style={{ maxHeight: activeSection === 'items' ? '1200px' : '0' }}>
                        <div className="p-5 border-t border-dashed border-border-color overflow-x-auto">
                            <table className="w-full border-collapse min-w-[480px]">
                                <thead>
                                    <tr>
                                        <th className="text-left text-[0.7rem] font-extrabold text-text-secondary uppercase pb-2 border-b border-border-color tracking-wider">Description</th>
                                        <th className="text-left text-[0.7rem] font-extrabold text-text-secondary uppercase pb-2 border-b border-border-color tracking-wider w-[80px]">HSN</th>
                                        <th className="text-left text-[0.7rem] font-extrabold text-text-secondary uppercase pb-2 border-b border-border-color tracking-wider w-[60px]">Qty</th>
                                        <th className="text-left text-[0.7rem] font-extrabold text-text-secondary uppercase pb-2 border-b border-border-color tracking-wider w-[60px]">Unit</th>
                                        <th className="text-left text-[0.7rem] font-extrabold text-text-secondary uppercase pb-2 border-b border-border-color tracking-wider w-[85px]">Rate</th>
                                        <th className="text-left text-[0.7rem] font-extrabold text-text-secondary uppercase pb-2 border-b border-border-color tracking-wider w-[70px]">GST %</th>
                                        <th className="text-left text-[0.7rem] font-extrabold text-text-secondary uppercase pb-2 border-b border-border-color tracking-wider w-[24px]"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2 px-1 align-middle">
                                                <input 
                                                    type="text" 
                                                    placeholder="Item description" 
                                                    value={item.description} 
                                                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent px-2 py-1.5 text-sm rounded focus:bg-bg-tertiary focus:border-border-color focus:outline-none focus:ring-2 focus:ring-accent-light/30 transition-all"
                                                />
                                            </td>
                                            <td className="py-2 px-1 align-middle w-[80px]">
                                                <input 
                                                    type="text" 
                                                    placeholder="Code" 
                                                    value={item.hsn} 
                                                    onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent px-2 py-1.5 text-sm rounded focus:bg-bg-tertiary focus:border-border-color focus:outline-none focus:ring-2 focus:ring-accent-light/30 transition-all"
                                                />
                                            </td>
                                            <td className="py-2 px-1 align-middle w-[60px]">
                                                <input 
                                                    type="number" 
                                                    value={item.qty} 
                                                    min="1" 
                                                    onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value) || 0)}
                                                    className="w-full bg-transparent border border-transparent px-2 py-1.5 text-sm rounded focus:bg-bg-tertiary focus:border-border-color focus:outline-none focus:ring-2 focus:ring-accent-light/30 transition-all"
                                                />
                                            </td>
                                            <td className="py-2 px-1 align-middle w-[60px]">
                                                <input 
                                                    type="text" 
                                                    placeholder="NOS" 
                                                    value={item.unit} 
                                                    onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent px-2 py-1.5 text-sm rounded focus:bg-bg-tertiary focus:border-border-color focus:outline-none focus:ring-2 focus:ring-accent-light/30 transition-all"
                                                />
                                            </td>
                                            <td className="py-2 px-1 align-middle w-[85px]">
                                                <input 
                                                    type="number" 
                                                    placeholder="Rate" 
                                                    value={item.rate} 
                                                    min="0" 
                                                    step="0.01" 
                                                    onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                                                    className="w-full bg-transparent border border-transparent px-2 py-1.5 text-sm rounded focus:bg-bg-tertiary focus:border-border-color focus:outline-none focus:ring-2 focus:ring-accent-light/30 transition-all"
                                                />
                                            </td>
                                            <td className="py-2 px-1 align-middle w-[70px]">
                                                <select 
                                                    value={item.gstRate} 
                                                    onChange={(e) => handleItemChange(idx, 'gstRate', parseInt(e.target.value))}
                                                    className="w-full bg-transparent border border-transparent px-2 py-1.5 text-sm rounded focus:bg-bg-tertiary focus:border-border-color focus:outline-none focus:ring-2 focus:ring-accent-light/30 transition-all cursor-pointer"
                                                >
                                                    <option value={0}>0%</option>
                                                    <option value={5}>5%</option>
                                                    <option value={12}>12%</option>
                                                    <option value={18}>18%</option>
                                                    <option value={28}>28%</option>
                                                </select>
                                            </td>
                                            <td className="py-2 px-1 align-middle w-[24px]">
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveItem(idx)}
                                                    className="bg-none border-none text-text-muted hover:text-danger hover:bg-danger-light rounded-md w-7 h-7 flex items-center justify-center transition-all cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button type="button" className="w-full inline-flex items-center justify-center gap-2 px-4.5 py-2 text-xs font-semibold rounded-lg border border-border-color bg-bg-tertiary text-text-primary hover:bg-border-color-hover transition-colors cursor-pointer mt-4" onClick={handleAddItem}>
                                <Plus size={14} /> Add Line Item
                            </button>
                        </div>
                    </div>
                </div>

                {/* 5. Bank Account details */}
                <div className={`bg-bg-card border border-border-color rounded-xl overflow-hidden transition-all duration-300 hover:border-border-color-hover ${activeSection === 'bank' ? 'shadow-[var(--shadow-main)] border-accent-primary/30 active' : ''}`}>
                    <button type="button" className="w-full bg-none border-none p-[1.2rem] flex items-center justify-between font-bold text-text-primary cursor-pointer text-left" onClick={() => toggleSection('bank')}>
                        <span className="flex items-center gap-3 text-[0.95rem]">
                            <CreditCard size={18} className="text-accent-primary" /> Bank Details
                        </span>
                        <span className={`text-[0.75rem] text-text-muted transition-transform duration-300 ${activeSection === 'bank' ? 'rotate-180 text-accent-primary' : ''}`}>▼</span>
                    </button>
                    <div className={`transition-[max-height] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeSection === 'bank' ? 'overflow-visible' : 'overflow-hidden'}`} style={{ maxHeight: activeSection === 'bank' ? '1200px' : '0' }}>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-border-color">
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Bank Name</label>
                                <input 
                                    type="text" 
                                    placeholder="IDFC FIRST BANK" 
                                    value={invoiceData.bankDetails.bankName || ''} 
                                    onChange={(e) => updateBank('bankName', e.target.value)}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">A/C Number</label>
                                <input 
                                    type="text" 
                                    placeholder="10125829352" 
                                    value={invoiceData.bankDetails.acNumber || ''} 
                                    onChange={(e) => updateBank('acNumber', e.target.value)}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">IFSC Code</label>
                                <input 
                                    type="text" 
                                    placeholder="IDFB0040332" 
                                    value={invoiceData.bankDetails.ifscCode || ''} 
                                    onChange={(e) => updateBank('ifscCode', e.target.value)}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Branch</label>
                                <input 
                                    type="text" 
                                    placeholder="Nikol Ahmedabad" 
                                    value={invoiceData.bankDetails.branch || ''} 
                                    onChange={(e) => updateBank('branch', e.target.value)}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. Settings, Stamp & Watermark */}
                <div className={`bg-bg-card border border-border-color rounded-xl overflow-hidden transition-all duration-300 hover:border-border-color-hover ${activeSection === 'settings' ? 'shadow-[var(--shadow-main)] border-accent-primary/30 active' : ''}`}>
                    <button type="button" className="w-full bg-none border-none p-[1.2rem] flex items-center justify-between font-bold text-text-primary cursor-pointer text-left" onClick={() => toggleSection('settings')}>
                        <span className="flex items-center gap-3 text-[0.95rem]">
                            <Image size={18} className="text-accent-primary" /> Advanced (Stamp, Watermark & Tax)
                        </span>
                        <span className={`text-[0.75rem] text-text-muted transition-transform duration-300 ${activeSection === 'settings' ? 'rotate-180 text-accent-primary' : ''}`}>▼</span>
                    </button>
                    <div className={`transition-[max-height] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeSection === 'settings' ? 'overflow-visible' : 'overflow-hidden'}`} style={{ maxHeight: activeSection === 'settings' ? '1200px' : '0' }}>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-border-color">
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Tax Class Type</label>
                                <select 
                                    value={invoiceData.taxType} 
                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, taxType: e.target.value }))}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full cursor-pointer"
                                >
                                    <option value="GST">Intra-State GST (CGST + SGST split)</option>
                                    <option value="IGST">Inter-State IGST (Single line)</option>
                                </select>
                            </div>
                            

                            {/* Stamp/Signature Selector */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Authorized Stamp/Seal</label>
                                <div className="border-2 border-dashed border-border-color rounded-xl p-4 text-center relative cursor-pointer bg-black/[0.05] hover:border-accent-primary hover:bg-accent-light transition-all min-h-[80px] flex items-center justify-center">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleImageUpload(e, 'signature')}
                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {!invoiceData.signature ? (
                                        <div className="text-text-secondary text-[0.85rem] flex flex-col items-center justify-center gap-1">
                                            <Image size={18} className="text-text-muted" />
                                            <p>Select Seal Stamp</p>
                                        </div>
                                    ) : (
                                        <div className="relative max-h-[60px] flex items-center justify-center">
                                            <img src={invoiceData.signature} alt="Seal Preview" className="max-h-[60px] max-w-full object-contain rounded-md" />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveImage('signature')}
                                                className="absolute -top-2 -right-2 bg-danger text-white border-none rounded-full w-[18px] h-[18px] flex items-center justify-center cursor-pointer shadow-md"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-[0.75rem] font-bold uppercase tracking-wider text-text-secondary">Bottom Notes</label>
                                <input 
                                    type="text" 
                                    placeholder="Thanks for your business." 
                                    value={invoiceData.notes || ''} 
                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="bg-bg-tertiary border border-border-color text-text-primary rounded-md px-3 py-2 text-sm leading-normal outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button type="button" className="w-full inline-flex items-center justify-center gap-2 px-4.5 py-2.5 text-sm font-semibold rounded-lg bg-accent-primary text-white hover:bg-accent-hover hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer mt-6" onClick={onSave}>
                {isEditMode ? 'Update Invoice in DB' : 'Save Invoice to DB'}
            </button>
        </section>
    );
}
