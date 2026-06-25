import React, { useState } from 'react';
import { Plus, Search, FileText, Trash2, Edit3, Receipt } from 'lucide-react';

export default function Dashboard({ invoices, onEdit, onDelete, onCreateNew, loading }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter invoices by invoiceNo or client name
    const filteredInvoices = invoices.filter(inv => {
        const query = searchQuery.toLowerCase();
        const noMatch = inv.invoiceNo?.toLowerCase().includes(query);
        const clientMatch = inv.billingDetails?.name?.toLowerCase().includes(query);
        return noMatch || clientMatch;
    });

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-GB');
    };

    return (
        <div className="p-4 sm:p-8 h-full overflow-y-auto max-w-[1600px] mx-auto">
            <div className="flex sm:flex-row flex-col justify-between items-stretch sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">Invoice History</h2>
                        <p className="text-xs sm:text-sm text-text-muted">Manage saved client invoices</p>
                    </div>
                </div>
                
                <button className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 text-sm font-semibold rounded-lg bg-accent-primary text-white hover:bg-accent-hover hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer max-sm:w-full" onClick={onCreateNew}>
                    <Plus size={16} /> Create Invoice
                </button>
            </div>

            <div className="mb-6">
                <div className="relative w-full max-w-[500px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by invoice number or client name..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-bg-secondary border border-border-color text-text-primary rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-light/50 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="bg-bg-secondary border border-border-color rounded-xl overflow-x-auto shadow-[var(--shadow-main)]">
                {loading ? (
                    <div className="p-12 text-center text-text-secondary text-base">
                        <span className="w-2.5 h-2.5 bg-accent-primary rounded-full inline-block mr-2 animate-[simplePulse_1.2s_infinite]"></span> Loading invoices...
                    </div>
                ) : filteredInvoices.length > 0 ? (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border-color">
                                <th className="text-left px-5 py-4 text-xs font-extrabold text-text-secondary uppercase bg-black/[0.02] tracking-wider">Invoice No</th>
                                <th className="text-left px-5 py-4 text-xs font-extrabold text-text-secondary uppercase bg-black/[0.02] tracking-wider">Date</th>
                                <th className="text-left px-5 py-4 text-xs font-extrabold text-text-secondary uppercase bg-black/[0.02] tracking-wider">Client Name</th>
                                <th className="text-right px-5 py-4 text-xs font-extrabold text-text-secondary uppercase bg-black/[0.02] tracking-wider">Total Amount</th>
                                <th className="text-center px-5 py-4 text-xs font-extrabold text-text-secondary uppercase bg-black/[0.02] tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv) => {
                                const totalAmt = inv.totals?.total || 0;
                                return (
                                    <tr key={inv._id} className="border-b border-border-color hover:bg-black/[0.01] transition-colors">
                                        <td className="px-5 py-4 text-sm font-bold text-text-primary flex items-center gap-2">
                                            <FileText size={16} className="text-text-muted shrink-0" />
                                            {inv.invoiceNo}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-text-secondary">{formatDate(inv.invoiceDate)}</td>
                                        <td className="px-5 py-4 text-sm text-text-secondary">{inv.billingDetails?.name}</td>
                                        <td className="px-5 py-4 text-sm text-right font-mono font-bold text-text-primary">
                                            ₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    className="bg-none border border-border-color w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all text-text-secondary hover:text-accent-primary hover:bg-accent-light hover:border-accent-primary" 
                                                    title="Edit Invoice"
                                                    onClick={() => onEdit(inv)}
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    className="bg-none border border-border-color w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all text-text-secondary hover:text-danger hover:bg-danger-light hover:border-danger" 
                                                    title="Delete Invoice"
                                                    onClick={() => onDelete(inv._id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center text-text-muted text-base italic">
                        {searchQuery ? 'No matching invoices found.' : 'No invoices saved yet. Click "Create Invoice" above to build your first one!'}
                    </div>
                )}
            </div>
        </div>
    );
}
