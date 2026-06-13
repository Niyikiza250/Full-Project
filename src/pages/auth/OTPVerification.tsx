import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/constants/routes';
import { ShieldCheck, Loader2, ArrowLeft, Mail } from 'lucide-react';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const email = (location.state as { email?: string })?.email;

  useEffect(() => {
    if (!email) navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.value !== '' && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    navigate(ROUTES.RESET_PASSWORD, { state: { email } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-sda-gold/20 text-sda-blue rounded-full flex items-center justify-center">
            <ShieldCheck size={32} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('auth.otpHeading')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('auth.otpSubtitle')}</p>
        {email && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sda-blue/10 px-3 py-1 text-xs font-semibold text-sda-blue dark:bg-sda-gold/10 dark:text-sda-gold">
            <Mail size={12} />
            {email}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-1 sm:gap-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              ref={(el) => (inputs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-10 sm:w-12 h-10 sm:h-12 text-center text-lg sm:text-xl font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-sda-blue outline-none transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.join('').length !== 6}
          className="w-full bg-sda-blue hover:bg-sda-blue-dark text-white font-bold py-3 rounded-lg shadow-lg transform transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>{t('auth.otpVerifying')}</span>
            </>
          ) : (
            <span>{t('auth.otpVerifyButton')}</span>
          )}
        </button>
      </form>

      <div className="text-center space-y-4">
        <p className="text-sm text-slate-500">
          {t('auth.otpDidntReceive')}{' '}
          {timer > 0 ? (
            <span className="font-semibold text-sda-blue">{t('auth.otpResendIn', { seconds: timer })}</span>
          ) : (
            <button onClick={() => setTimer(60)} className="font-semibold text-sda-blue hover:underline">{t('auth.otpResend')}</button>
          )}
        </p>
        
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="inline-flex items-center text-sm text-slate-500 hover:text-sda-blue transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('auth.backToLogin')}
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
