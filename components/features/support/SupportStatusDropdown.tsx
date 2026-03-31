'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
 Circle,
 CircleDot,
 CheckCircle2,
 Clock,
 Search as SearchIcon,
 Check,
 MoreHorizontal
} from 'lucide-react';
import { useUpdateTicketMutation, SupportTicket } from '@/store/services/supportApi';
import { toastSuccess, toastError } from '@/utils/toastWithSound';

interface SupportStatusDropdownProps {
 ticket: SupportTicket;
 lineOfBusinessData?: {
  primaryColor?: string;
 };
}

type StatusValue = SupportTicket['status'];

interface StatusOption {
 value: StatusValue;
 label: string;
 category: 'Not started' | 'Active' | 'Closed';
 color: string;
 icon: React.ElementType;
}

const STATUS_OPTIONS: StatusOption[] = [
 { value: 'Open', label: 'OPEN', category: 'Not started', color: '#9CA3AF', icon: Circle },
 { value: 'Pending', label: 'PENDING', category: 'Active', color: '#F59E0B', icon: Clock },
 { value: 'In Progress', label: 'IN PROGRESS', category: 'Active', color: '#10B981', icon: CircleDot },
 { value: 'Completed', label: 'COMPLETED', category: 'Active', color: '#3B82F6', icon: Circle },
 { value: 'In Review', label: 'IN REVIEW', category: 'Active', color: '#EA580C', icon: Circle },
 { value: 'Accepted', label: 'ACCEPTED', category: 'Active', color: '#7C3AED', icon: Circle },
 { value: 'Rejected', label: 'REJECTED', category: 'Active', color: '#DC2626', icon: Circle },
 { value: 'Closed', label: 'CLOSED', category: 'Closed', color: '#059669', icon: CheckCircle2 },
];

export const SupportStatusDropdown: React.FC<SupportStatusDropdownProps> = ({ ticket }) => {
 const [isOpen, setIsOpen] = useState(false);
 const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
 const [searchQuery, setSearchQuery] = useState('');
 const [updateTicket] = useUpdateTicketMutation();
 const buttonRef = useRef<HTMLButtonElement>(null);

 const updateCoords = useCallback(() => {
  if (buttonRef.current) {
   const rect = buttonRef.current.getBoundingClientRect();
   setCoords({
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width
   });
  }
 }, []);

 useEffect(() => {
  if (isOpen) {
   updateCoords();
   window.addEventListener('resize', updateCoords);
   window.addEventListener('scroll', updateCoords, true);
  }
  return () => {
   window.removeEventListener('resize', updateCoords);
   window.removeEventListener('scroll', updateCoords, true);
  };
 }, [isOpen, updateCoords]);

 const filteredOptions = useMemo(() => {
  return STATUS_OPTIONS.filter(opt =>
   opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
   opt.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
 }, [searchQuery]);

 const groupedOptions = useMemo(() => {
  const groups: Record<string, StatusOption[]> = {
   'Not started': [],
   'Active': [],
   'Closed': []
  };
  filteredOptions.forEach(opt => {
   groups[opt.category].push(opt);
  });
  return groups;
 }, [filteredOptions]);

 const handleStatusChange = async (newStatus: StatusValue) => {
  if (newStatus === ticket.status) {
   setIsOpen(false);
   return;
  }

  try {
   await updateTicket({
    id: ticket._id,
    data: { status: newStatus }
   }).unwrap();
   toastSuccess(`Status updated to ${newStatus}`);
   setIsOpen(false);
  } catch (error: unknown) {
   const err = error as { data?: { message?: string } };
   toastError(err?.data?.message || 'Failed to update status');
  }
 };

 const currentOption = STATUS_OPTIONS.find(opt => opt.value === ticket.status) || STATUS_OPTIONS[0];
 const StatusIcon = currentOption.icon;

 return (
  <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
   <button
    ref={buttonRef}
    type="button"
    onClick={() => setIsOpen(!isOpen)}
    className="flex items-center gap-2 px-2.5 py-1 min-w-[110px] justify-between shadow-sm rounded-[var(--radius)] transition-all hover:brightness-95 active:scale-95"
    style={{ backgroundColor: currentOption.color }}
   >
    <div className="flex items-center gap-2">
     <StatusIcon className="w-3 h-3 text-white" />
     <span className="text-[9px] font-black text-white tracking-widest whitespace-nowrap uppercase">
      {currentOption.label}
     </span>
    </div>
    <div className="w-4 h-4 rounded-[var(--radius)] bg-white/20 flex items-center justify-center">
     <Check className={`w-2.5 h-2.5 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </div>
   </button>

   {isOpen && typeof document !== 'undefined' && createPortal(
    <>
     <div
      className="fixed inset-0 z-[9998] bg-black/5"
      onClick={() => setIsOpen(false)}
     />
     <div
      className="fixed z-[9999] w-64 origin-top-right bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden border dark:border-gray-800 rounded-[var(--radius)]"
      style={{
       top: `${coords.top + 4}px`,
       left: `${coords.left + coords.width - 256}px`,
      }}
     >
      {/* Search Bar */}
      <div className="p-3 border-b dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-800/50">
       <SearchIcon className="w-4 h-4 text-gray-400" />
       <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-transparent border-none text-[13px] focus:ring-0 placeholder:text-gray-400 dark:text-gray-200"
        autoFocus
       />
      </div>

      {/* Options List */}
      <div className="max-h-[350px] overflow-y-auto py-2 custom-scrollbar">
       {Object.entries(groupedOptions).map(([category, options]) => (
        options.length > 0 && (
         <div key={category} className="mb-2 last:mb-0">
          <div className="px-4 py-2 flex items-center justify-between">
           <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {category}
           </span>
           <MoreHorizontal className="w-3.5 h-3.5 text-gray-300 cursor-pointer hover:text-gray-500 transition-colors" />
          </div>
          <div className="space-y-0.5">
           {options.map((option) => {
            const OptionIcon = option.icon;
            const isActive = ticket.status === option.value;
            return (
             <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`w-full px-4 py-2 current-status-item flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group ${isActive ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
             >
              <div className="flex items-center gap-3">
               <div className="relative">
                <OptionIcon
                 className={`w-4 h-4 transition-transform group-hover:scale-110 ${option.value === 'Open' ? 'stroke-dashed' : ''}`}
                 style={{ color: option.color, fill: option.value === 'In Progress' ? 'transparent' : (option.value === 'Open' ? 'transparent' : option.color) }}
                />
                {option.value === 'In Progress' && (
                 <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-current" style={{ backgroundColor: option.color }} />
                 </div>
                )}
               </div>
               <span className={`text-[12px] font-bold tracking-tight uppercase ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                {option.label}
               </span>
              </div>
              {isActive && <Check className="w-4 h-4 text-gray-900 dark:text-white" />}
             </button>
            );
           })}
          </div>
         </div>
        )
       ))}
      </div>
     </div>
    </>,
    document.body
   )}

   <style jsx>{`
    .stroke-dashed {
     stroke-dasharray: 2 2;
    }
    .custom-scrollbar::-webkit-scrollbar {
     width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
     background: #e2e8f0;
     border-radius: 10px;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
     background: #334155;
    }
   `}</style>
  </div>
 );
};
