import React from 'react';
import type { Payment } from '../../../types/admin';

interface Props {
    payments: Payment[];
    handleExportPayments: () => void;
}

export const PaymentsView = React.memo(({ payments, handleExportPayments }: Props) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Payments</h3>
                <p className="text-sm text-gray-500">Track all financial transactions.</p>
            </div>
            <button
                onClick={handleExportPayments}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
                Export Report
            </button>
        </div>

        {payments.length === 0 ? (
            <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <div className="font-bold text-2xl">€</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">No payments found</h3>
                <p className="text-gray-500">Once payments are received, they will appear here.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Reference</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-green-50/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                        payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {payment.status}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-IE', { style: 'currency', currency: payment.currency }).format(payment.amount)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{payment.profiles?.full_name || 'Unknown User'}</div>
                                    <div className="text-xs text-gray-400">{payment.profiles?.email}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(payment.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-xs text-gray-400">
                                    {payment.id.substring(0, 8)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
));
