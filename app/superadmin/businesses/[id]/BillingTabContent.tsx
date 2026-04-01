import React, { useState, useMemo } from 'react';
import Pagination from '@/components/ui/Pagination';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

interface BillingRecord {
    id: string;
    date: string;
    amount: string;
    status: string;
}

interface BillingTabContentProps {
    billingHistory: BillingRecord[];
}

const BillingTabContent: React.FC<BillingTabContentProps> = ({ billingHistory }) => {
    const { lineOfBusinessData } = useLineOfBusiness();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const totalPages = Math.ceil(billingHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedBilling = useMemo(() => {
        return billingHistory.slice(startIndex, endIndex);
    }, [billingHistory, startIndex, endIndex]);

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2
                    className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Billing History
                </h2>
            </div>

            {/* Billing Table */}
            <div
                className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden mb-6 rounded-[var(--radius)]"
                style={{
                    backgroundColor: 'var(--accent-white)',
                    borderColor: 'var(--light-gray)'
                }}
            >
                <div className="overflow-x-auto">
                    <table
                        className="min-w-full divide-y dark:divide-gray-700"
                        style={{ borderColor: 'var(--light-gray)' }}
                    >
                        <thead
                            className="dark:bg-gray-700 border-b dark:border-gray-700"
                            style={{
                                backgroundColor: 'var(--bg-primary)',
                                borderBottomColor: 'var(--light-gray)'
                            }}
                        >
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-300 uppercase tracking-wider"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Date
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-300 uppercase tracking-wider"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Amount
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-300 uppercase tracking-wider"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody
                            className="dark:bg-gray-800 divide-y dark:divide-gray-700"
                            style={{
                                backgroundColor: 'var(--accent-white)',
                                borderColor: 'var(--light-gray)'
                            }}
                        >
                            {paginatedBilling.map((billing) => (
                                <tr
                                    key={billing.id}
                                    className="dark:hover:bg-gray-700 transition-colors"
                                    style={{ borderColor: 'var(--light-gray)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--accent-white)';
                                    }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className="text-[10px] md:text-[12px] dark:text-gray-100"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {billing.date}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {billing.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className="inline-flex px-2 py-1 text-[8px] md:text-[10px] font-semibold rounded-full dark:bg-green-900/30 dark:text-green-400"
                                            style={{
                                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                color: '#16A34A'
                                            }}
                                        >
                                            {billing.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Section */}
            <div className="flex items-center justify-between">
                {/* Pagination Controls */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    showEllipsis={true}
                    maxVisiblePages={5}
                    primaryColor={lineOfBusinessData?.primaryColor || 'var(--primary)'}
                    secondaryColor={lineOfBusinessData?.secondaryColor || 'var(--primary)'}
                    className="mt-0"
                />
            </div>
        </div>
    );
};

export default BillingTabContent;
