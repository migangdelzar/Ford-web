import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Settings2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Badge, IconBadge, IconButton } from '../../../shared/ui';

interface CookieConsentBannerProps {
  onOpenCookiesPolicy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenCookiesPolicy,
}) => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('meta_crm_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptNecessary = () => {
    localStorage.setItem(
      'meta_crm_cookie_consent',
      JSON.stringify({ necessary: true, analytics: false, date: new Date().toISOString() })
    );
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    localStorage.setItem(
      'meta_crm_cookie_consent',
      JSON.stringify({ necessary: true, analytics: true, date: new Date().toISOString() })
    );
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(
      'meta_crm_cookie_consent',
      JSON.stringify({ necessary: true, analytics: analyticsOptIn, date: new Date().toISOString() })
    );
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none flex justify-center"
        role="region"
        aria-label="Consentimiento de cookies y privacidad"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-auto w-full max-w-4xl bg-white border border-black/10 rounded-2xl shadow-xl p-4 sm:p-5 text-[#1D1D1F]"
        >
          {!showPreferences ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <IconBadge icon={Cookie} color="blue" size="md" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5 flex items-center gap-1.5">
                    <span>{t('compliance.cookieBannerTitle')}</span>
                    <Badge variant="success" size="xs">
                      {t('compliance.cookieBannerBadge')}
                    </Badge>
                  </h3>
                  <p>
                    {t('compliance.cookieBannerText', { brand: t('brand.name') })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0 w-full sm:w-auto justify-end">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setShowPreferences(true)}
                >
                  {t('compliance.customize')}
                </Button>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onOpenCookiesPolicy}
                  className="text-[#0071E3]"
                >
                  {t('compliance.readPolicy')}
                </Button>

                <Button
                  variant="secondary"
                  size="xs"
                  onClick={handleAcceptNecessary}
                >
                  {t('compliance.onlyNecessary')}
                </Button>

                <Button
                  variant="primary"
                  size="xs"
                  onClick={handleAcceptAll}
                >
                  {t('compliance.acceptAll')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <IconBadge icon={Settings2} color="blue" size="xs" />
                  <h4 className="font-bold text-sm text-[#1D1D1F]">{t('compliance.cookiePrefTitle')}</h4>
                </div>
                <IconButton
                  icon={X}
                  size="xs"
                  variant="ghost"
                  onClick={() => setShowPreferences(false)}
                  tooltip="Volver"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-[#F5F5F7] border border-black/[0.04] rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-[#1D1D1F] block">{t('compliance.essentialCookiesTitle')}</span>
                    <span className="text-[#86868B] text-[11px]">
                      {t('compliance.essentialCookiesDesc')}
                    </span>
                  </div>
                  <Badge variant="tertiary" size="xs">
                    {t('compliance.alwaysActive')}
                  </Badge>
                </div>

                <div className="p-2.5 bg-[#F5F5F7] border border-black/[0.04] rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-[#1D1D1F] block">{t('compliance.aiTelemetryTitle')}</span>
                    <span className="text-[#86868B] text-[11px]">
                      {t('compliance.aiTelemetryDesc')}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={analyticsOptIn}
                      onChange={(e) => setAnalyticsOptIn(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0071E3]"></div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06]">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowPreferences(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={handleSavePreferences}
                >
                  {t('compliance.savePreferences')}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
