import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Smartphone } from 'lucide-react';
import { JasperLogo } from '../../app/routes/Landing';

interface MobileGuardProps {
  children: React.ReactNode;
}

export default function MobileGuard({ children }: MobileGuardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isSmallScreen = window.innerWidth < 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
              <JasperLogo className="w-10 h-10 text-slate-800 dark:text-white" />
            </div>
          </div>

          {/* Icon */}
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center border-4 border-white dark:border-slate-900">
              <Monitor className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white mb-3">
            Desktop Required
          </h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
            The Jasper process design editor requires a desktop or laptop computer for the best experience. 
            Please continue on a larger screen to access the full design tools.
          </p>

          {/* CTA */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Back to Home
          </Link>

          {/* Footer note */}
          <p className="mt-8 text-xs text-slate-400 dark:text-slate-500">
            Open this page on a desktop to start designing
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

