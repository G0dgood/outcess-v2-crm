import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoreHorizontal } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface FilterDropdownProps {
  label: React.ReactNode;
  children: (props: { close: () => void }) => React.ReactNode;
  className?: string;
  triggerClassName?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  title?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  children,
  className = '',
  triggerClassName = '',
  isOpen: controlledIsOpen,
  onToggle,
  title
}) => {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : uncontrolledIsOpen;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleOpen = () => {
    const nextState = !isOpen;
    if (onToggle) onToggle(nextState);
    else setUncontrolledIsOpen(nextState);
  };

  const close = useCallback(() => {
    if (onToggle) onToggle(false);
    else setUncontrolledIsOpen(false);
  }, [onToggle]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobile && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close();
      }
    };

    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile, close]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        onClick={toggleOpen}
        className={`dark:bg-gray-800 px-3 py-2 text-[10px] md:text-[12px] flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap rounded-[var(--radius)] ${triggerClassName}`}
        style={{ backgroundColor: 'var(--accent-white)', color: 'var(--text-secondary)' }}
      >
        {label}
        <MoreHorizontal className="w-4 h-4 rotate-90" />
      </div>

      {!isMobile && isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 min-w-[200px]">
          {children({ close })}
        </div>
      )}

      {isMobile && (
        <Modal
          isOpen={isOpen}
          onClose={close}
          title={title || (typeof label === 'string' ? label : 'Filter')}
        >
          <div className="p-4">
            {children({ close })}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FilterDropdown;
