import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCrmStore } from '../../../store/useCrmStore';
import { useToast } from '../../../shared/ui/SonnerToast';
import { BRAND_CONFIG } from '../../../shared/i18n';

interface LoginPageProps {
  onOpenLegalModal?: (tab: 'privacy' | 'terms') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenLegalModal }) => {
  const { t } = useTranslation();
  const { login } = useCrmStore();
  const { toast } = useToast();

  const [selectedRole, setSelectedRole] = useState<'propietario' | 'gerente' | 'asesor'>('propietario');
  const [email, setEmail] = useState(`miky.delzar@${BRAND_CONFIG.emailDomain}`);
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roleDefaults = {
    propietario: {
      name: 'Miky Delzar',
      email: `miky.delzar@${BRAND_CONFIG.emailDomain}`,
      label: t('login.roleOwner'),
      roleTitle: t('login.roleOwnerTitle'),
    },
    gerente: {
      name: 'Lic. Sofía Alarcón',
      email: `sofia.gerente@${BRAND_CONFIG.emailDomain}`,
      label: t('login.roleManager'),
      roleTitle: t('login.roleManagerTitle'),
    },
    asesor: {
      name: 'Miky Delzar',
      email: `miky.delzar@${BRAND_CONFIG.emailDomain}`,
      label: t('login.roleAdvisor'),
      roleTitle: t('login.roleAdvisorTitle'),
    },
  };

  const handleRoleChange = (role: 'propietario' | 'gerente' | 'asesor') => {
    setSelectedRole(role);
    setEmail(roleDefaults[role].email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const profile = roleDefaults[selectedRole];
      login(selectedRole, email, profile.name);
      toast({
        type: 'info',
        title: t('login.sessionStarted'),
        description: `${profile.name} (${profile.label})`,
      });
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FB] flex flex-col justify-between items-center px-4 py-8 select-none text-[#1C1E26] font-sans antialiased">
      <div className="w-full" />

      {/* Minimalist Centered Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm bg-white border border-[#EEF0F3] rounded-2xl p-6 sm:p-7 shadow-xs"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#E8F1FF] text-[#007AFF] flex items-center justify-center mb-2.5">
            <Sparkles className="w-4.5 h-4.5 text-[#007AFF]" />
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-[#1C1E26]">
            {t('brand.name')}
          </h1>
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            {t('brand.tagline')}
          </p>
        </div>

        {/* Minimal Segmented Role Selector */}
        <div className="flex p-0.5 bg-[#F1F3F6] rounded-xl mb-4 text-xs">
          {(['propietario', 'gerente', 'asesor'] as const).map((role) => {
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#1C1E26] font-semibold shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#1C1E26] font-medium'
                }`}
              >
                {roleDefaults[role].label}
              </button>
            );
          })}
        </div>

        {/* Minimal Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="login-email"
              className="block text-[11px] font-medium text-[#6B7280] mb-1"
            >
              {t('login.email')}
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#EEF0F3] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1C1E26] placeholder-[#9CA3AF] focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-colors"
              placeholder={t('login.emailPlaceholder')}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-[11px] font-medium text-[#6B7280] mb-1"
            >
              {t('login.password')}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#EEF0F3] rounded-xl pl-3 pr-8 py-2 text-xs sm:text-sm text-[#1C1E26] placeholder-[#9CA3AF] focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-colors"
                placeholder={t('login.passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] p-1 cursor-pointer"
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{t('login.enter')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Subtle Minimal Footer */}
      <footer className="w-full max-w-sm flex items-center justify-between text-[11px] text-[#9CA3AF] px-1">
        <span>{t('brand.copyright')}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenLegalModal?.('privacy')}
            className="hover:text-[#6B7280] transition-colors cursor-pointer"
          >
            {t('login.privacy')}
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => onOpenLegalModal?.('terms')}
            className="hover:text-[#6B7280] transition-colors cursor-pointer"
          >
            {t('login.terms')}
          </button>
        </div>
      </footer>
    </div>
  );
};
