'use client';

import React from 'react';
import Icon from './Icon';
import { plusJakartaStyle } from '../Options';

interface LoginTopHeaderProps {
  plan: string;
  primaryColor: string;
  onUpgradeClick: () => void;
}

const LoginTopHeader: React.FC<LoginTopHeaderProps> = ({ primaryColor, onUpgradeClick }) => {


  return (
    <div className="login-top-header">
      <div className="login-header-card">
        <button className="upgrade-button" onClick={onUpgradeClick} style={{ color: primaryColor }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Upgrade</span>
        </button>
        <div className="header-separator"></div>
        <div className="flex-1 md:flex-none">
          <div className="hidden md:flex items-center gap-2">
            <Icon name="peoplelyHalf" size="lg" />
            <span className="font-semibold text-[14px] md:text-[16px] leading-7 flex items-center text-[#050711]"
              style={{ color: 'var(--text-primary)', ...plusJakartaStyle }}>Peoplely</span>
          </div>
        </div>
        {/* <div className="user-info">
          <div className="user-email">{email}</div>
          <div className="user-plan">{plan}</div>
        </div> */}
        {/* <div className="profile-icon">
          <div className="profile-avatar"></div>
        </div> */}
      </div>
    </div>
  );
};

export default LoginTopHeader;
