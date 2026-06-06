'use client';

import React from 'react';
import Icon from './Icon';
import { plusJakartaStyle } from '../Options';

interface LoginTopHeaderProps {
  primaryColor: string;
}

const LoginTopHeader: React.FC<LoginTopHeaderProps> = ({ primaryColor }) => {
  return (
    <div className="login-top-header">
      <div className="login-header-card">
        <div className="flex-1 md:flex-none">
          <div className="hidden md:flex items-center gap-2">
            <Icon name="outcessHalf" size="lg" />
            <span className="font-semibold text-[14px] md:text-[16px] leading-7 flex items-center text-[#050711]"
              style={{ color: 'var(--text-primary)', ...plusJakartaStyle }}>Outcess</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginTopHeader;
