import React from 'react';
import { cn } from '@/utils';
import Container from './Container';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn('bg-slate-950/60 border-t border-slate-900/80 py-8 px-4', className)}>
      <Container className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} Provolution Technologies. All rights reserved.</p>
        <div className="flex gap-6 font-semibold">
          <span className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-blue-400 cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
