import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  Building2,
  ExternalLink,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BRAND_CONFIG } from '../../../shared/i18n';

export type LegalTab = 'privacy' | 'terms' | 'refund' | 'cookies' | 'business';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 id="legal-modal-title" className="text-base font-bold text-slate-900 leading-snug">
                  {t('compliance.legalModalTitle')}
                </h2>
                <p className="text-xs text-slate-600">
                  {t('brand.legalName')} • Cumplimiento Normativo LFPDPPP y PROFECO
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
              aria-label="Cerrar ventana de marco legal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-slate-200 overflow-x-auto scrollbar-none shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{t('compliance.tabPrivacy')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{t('compliance.tabTerms')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('refund')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'refund'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{t('compliance.tabRefund')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cookies')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'cookies'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{t('compliance.tabCookies')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('business')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'business'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('compliance.tabBusiness')}</span>
            </button>
          </div>

          {/* Modal Body / Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 text-sm text-slate-700 leading-relaxed space-y-4">
            {/* 1. AVISO DE PRIVACIDAD */}
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs">
                  <strong>Aviso de Privacidad Integral:</strong> En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y lineamientos del INAI.
                </div>

                <h3 className="text-base font-bold text-slate-900">1. Identidad y Domicilio del Responsable</h3>
                <p>
                  <strong>{t('brand.legalName')}</strong> (en lo sucesivo «{t('brand.name')}»), con domicilio en {t('brand.address')}, es el responsable del tratamiento y protección de sus datos personales.
                </p>

                <h3 className="text-base font-bold text-slate-900">2. Datos Personales que Recabamos y Principio de Minimización</h3>
                <p>
                  {t('brand.name')} únicamente recaba los datos indispensables para atender su solicitud de cotización, prueba de manejo o proceso de compraventa vehicular:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li><strong>Datos de Identificación y Contacto:</strong> Nombre completo, número de teléfono celular (para comunicación vía WhatsApp o llamada), y correo electrónico.</li>
                  <li><strong>Datos de Interés Comercial:</strong> Modelo de vehículo de interés, presupuesto estimado, y sucursal de preferencia.</li>
                  <li><strong>Exclusión de Datos Sensibles:</strong> {t('brand.name')} <em>NO</em> recaba datos personales sensibles (como origen étnico, estado de salud presente o futuro, información genética, creencias religiosas, filosóficas o afiliación sindical).</li>
                </ul>

                <h3 className="text-base font-bold text-slate-900">3. Finalidades del Tratamiento</h3>
                <p><strong>Finalidades Primarias (necesarias para el servicio):</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>Atender consultas y solicitudes enviadas a través de nuestros canales oficiales (WhatsApp Cloud API, Instagram DM, Facebook Messenger y portal web).</li>
                  <li>Coordinar y confirmar citas para pruebas de manejo en agencia o a domicilio.</li>
                  <li>Elaborar cotizaciones y planes de financiamiento automotriz personalizados.</li>
                  <li>Formalizar la reserva (apartado) o adquisición del vehículo y tramitar garantías oficiales de planta.</li>
                </ul>
                <p className="mt-2"><strong>Finalidades Secundarias (opcionales):</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>Encuestas de satisfacción de servicio postventa y notificaciones de mantenimientos programados. En cualquier momento puede solicitar no recibir comunicaciones secundarias enviando un correo a <span className="font-mono text-blue-700">{t('brand.privacyEmail')}</span>.</li>
                </ul>

                <h3 className="text-base font-bold text-slate-900">4. Transferencia de Datos y Proveedores Tecnológicos</h3>
                <p>
                  Sus datos personales no son vendidos, cedidos ni comercializados a terceras partes ajenas a la operación. Las únicas transferencias realizadas son con proveedores de infraestructura tecnológica debidamente contratados:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li><strong>Meta Platforms Ireland Ltd. / Meta Cloud API:</strong> Como procesador de comunicaciones para el servicio de mensajería empresarial de WhatsApp, Instagram y Messenger, bajo Cláusulas Contractuales Tipo (SCC).</li>
                  <li><strong>Instituciones Financieras Reguladas:</strong> (BBVA México, Banco Santander, Ford Credit) exclusivamente cuando el cliente solicite formalmente la corrida de crédito para el financiamiento vehicular.</li>
                </ul>

                <h3 className="text-base font-bold text-slate-900">5. Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h3>
                <p>
                  Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los usamos y las condiciones de su tratamiento (Acceso). Asimismo, es su derecho solicitar la corrección de su información (Rectificación), que la eliminemos de nuestros registros cuando considere que no está siendo utilizada conforme a los principios legales (Cancelación), o bien oponerse al uso de sus datos para fines específicos (Oposición).
                </p>
                <p>
                  Para ejercer sus derechos ARCO, envíe un correo electrónico a nuestro Oficial de Privacidad a <span className="font-mono text-blue-700 font-semibold">{t('brand.privacyEmail')}</span> con su nombre, identificación oficial y descripción clara del derecho a ejercer. Recibirá respuesta formal en un plazo máximo de <strong>20 días hábiles</strong>.
                </p>

                <h3 className="text-base font-bold text-slate-900">6. Seguridad y Encriptación</h3>
                <p>
                  {t('brand.name')} implementa medidas de seguridad técnicas, físicas y administrativas conforme a la norma ISO/IEC 27001, incluyendo cifrado TLS 1.3 de extremo a extremo en tránsito y controles de acceso basados en roles (RBAC) para nuestro personal autorizado.
                </p>
              </div>
            )}

            {/* 2. TÉRMINOS Y CONDICIONES */}
            {activeTab === 'terms' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs">
                  <strong>Términos Generales de Uso y Comercialización:</strong> Aplican a todas las consultas, cotizaciones y reservas realizadas a través de los canales digitales de {t('brand.legalName')}.
                </div>

                <h3 className="text-base font-bold text-slate-900">1. Precios y Vigencia de Cotizaciones</h3>
                <p>
                  Todos los precios exhibidos en nuestro catálogo digital están expresados en <strong>Pesos Mexicanos (MXN)</strong> e incluyen el Impuesto al Valor Agregado (IVA) correspondiente y el Impuesto sobre Automóviles Nuevos (ISAN), salvo indicación en contrario.
                </p>
                <p>
                  Las cotizaciones emitidas por nuestro Concierge Digital o asesores tienen una vigencia de <strong>5 días naturales</strong> y están sujetas a la disponibilidad física de inventario en planta y concesionaria.
                </p>

                <h3 className="text-base font-bold text-slate-900">2. Financiamiento y Evaluación Crediticia (Sin Afirmaciones Engañosas)</h3>
                <p>
                  {t('brand.name')} no ofrece «aprobación garantizada al 100%» ni condiciones engañosas. Todo financiamiento está sujeto a la validación de capacidad de pago, historial en Buró de Crédito y políticas de crédito vigentes de las instituciones financieras autorizadas por la Comisión Nacional Bancaria y de Valores (CNBV) y la CONDUSEF. El Costo Anual Total (CAT) promedio informativo será transparentado de manera previa a la firma de cualquier contrato.
                </p>

                <h3 className="text-base font-bold text-slate-900">3. Disponibilidad de Unidades</h3>
                <p>
                  Las fotografías y especificaciones técnicas mostradas son representativas de los modelos comercializados en México. El equipamiento final puede variar de acuerdo a la versión, año modelo y disponibilidad de paquetes de accesorios oficiales.
                </p>

                <h3 className="text-base font-bold text-slate-900">4. Pruebas de Manejo</h3>
                <p>
                  Para la realización de una prueba de manejo (en agencia o a domicilio), es requisito indispensable contar con licencia de conducir vigente emitida por autoridad mexicana competente y firmar la responsiva de prueba con cobertura de seguro vehicular vigente provisto por {t('brand.name')}.
                </p>

                <h3 className="text-base font-bold text-slate-900">5. Jurisdicción y Competencia</h3>
                <p>
                  Para la interpretación y cumplimiento de los presentes Términos, las partes se someten a la competencia de la Procuraduría Federal del Consumidor (PROFECO) en la vía administrativa, y a los tribunales competentes de la Ciudad de México.
                </p>
              </div>
            )}

            {/* 3. POLÍTICA DE REEMBOLSOS Y APARTADOS */}
            {activeTab === 'refund' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs">
                  <strong>Compromiso de Transparencia en Apartados:</strong> Cumplimiento estricto con el Artículo 86 de la Ley Federal de Protección al Consumidor (PROFECO). Sus anticipos están 100% respaldados.
                </div>

                <h3 className="text-base font-bold text-slate-900">1. Garantía de Reembolso en Apartados Vehiculares</h3>
                <p>
                  Cuando un cliente realiza un depósito de reserva («Apartado») para apartar una unidad de inventario:
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Reembolso del 100% sin penalización</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-normal">
                    Si el crédito automotriz no es aprobado por las entidades financieras, o si el cliente decide declinar la compra antes de la firma del contrato definitivo de compraventa, el importe total del apartado será devuelto íntegramente.
                  </p>
                </div>

                <h3 className="text-base font-bold text-slate-900">2. Plazo de Reintegro de Fondos</h3>
                <p>
                  El reintegro se procesará en un plazo máximo de <strong>cinco (5) días hábiles</strong> posteriores a la recepción de la solicitud de cancelación y los datos de la cuenta bancaria origen.
                </p>

                <h3 className="text-base font-bold text-slate-900">3. Método de Reembolso</h3>
                <p>
                  Los reembolsos se realizan exclusivamente mediante transferencia electrónica interbancaria (SPEI) a la misma cuenta bancaria y titular desde donde se originó el depósito, garantizando trazabilidad fiscal y seguridad financiera conforme a las regulaciones del SAT y BANXICO.
                </p>

                <h3 className="text-base font-bold text-slate-900">4. Procedimiento para Solicitar el Reembolso</h3>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
                  <li>Enviar un correo electrónico a <span className="font-mono text-blue-700 font-semibold">{t('brand.cancellationEmail')}</span> con el asunto «Solicitud de Devolución de Apartado - [Nombre Completo]».</li>
                  <li>Adjuntar comprobante de pago o folio de recibo emitido por {t('brand.name')}.</li>
                  <li>Proporcionar estado de cuenta bancario con CLABE interbancaria visible a nombre del titular.</li>
                </ol>

                <h3 className="text-base font-bold text-slate-900">5. Garantías de Taller y Refacciones</h3>
                <p>
                  Las refacciones originales adquiridas en mostrador cuentan con <strong>1 año de garantía de fabricante</strong>. Si una pieza presenta defecto de fabricación, se realiza el cambio físico sin costo o el reembolso íntegro tras el diagnóstico del taller certificado.
                </p>
              </div>
            )}

            {/* 4. POLÍTICA DE COOKIES Y ALMACENAMIENTO */}
            {activeTab === 'cookies' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs">
                  <strong>Política de Almacenamiento Local y Privacidad Digital:</strong> {t('brand.name')} opera con estricto apego a la privacidad por diseño. No comercializamos con sus hábitos de navegación.
                </div>

                <h3 className="text-base font-bold text-slate-900">1. ¿Qué tecnologías utilizamos?</h3>
                <p>
                  Nuestra plataforma utiliza únicamente almacenamiento local del navegador (<em>HTML5 LocalStorage</em>) y cookies técnicas de sesión con fines operativos indispensables:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Clave de Almacenamiento</th>
                        <th className="p-2.5">Propósito</th>
                        <th className="p-2.5">Duración</th>
                        <th className="p-2.5">Tipo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr>
                        <td className="p-2.5 font-mono">meta_crm_cookie_consent</td>
                        <td className="p-2.5">Registra la preferencia de consentimiento de cookies del usuario</td>
                        <td className="p-2.5">12 meses</td>
                        <td className="p-2.5">Esencial</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono">meta_crm_conversations_v1</td>
                        <td className="p-2.5">Mantiene el estado local de mensajes y seguimiento en la bandeja CRM</td>
                        <td className="p-2.5">Local (Persistente)</td>
                        <td className="p-2.5">Funcional</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono">meta_crm_user_role_v1</td>
                        <td className="p-2.5">Almacena el rol operativo activo (Propietario / Gerente / Asesor)</td>
                        <td className="p-2.5">Sesión local</td>
                        <td className="p-2.5">Funcional</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-base font-bold text-slate-900">2. Cero Rastreadores Publicitarios de Terceros</h3>
                <p>
                  {t('brand.name')} <strong>NO</strong> utiliza píxeles de remarketing invasivos, ni vende audiencias a redes publicitarias cruzadas. No compartimos datos de telemetría personal sin consentimiento expreso.
                </p>

                <h3 className="text-base font-bold text-slate-900">3. Control del Usuario</h3>
                <p>
                  Usted puede en todo momento limpiar las cookies y el almacenamiento local desde las opciones de configuración de su navegador web (Chrome, Safari, Edge, Firefox), o restablecer sus datos locales desde el menú de usuario de la aplicación.
                </p>
              </div>
            )}

            {/* 5. DATOS FISCALES Y NEGOCIO REAL */}
            {activeTab === 'business' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Razón Social y Domicilio Legal</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold block">Razón Social:</span>
                      <span className="font-medium text-slate-900">{t('brand.legalName')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">R.F.C.:</span>
                      <span className="font-mono font-medium text-slate-900">{t('brand.rfc')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Giro Comercial:</span>
                      <span className="font-medium text-slate-900">Distribución y Venta de Vehículos Nuevos y Seminuevos, Refacciones y Taller</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Registro PROFECO:</span>
                      <span className="font-medium text-slate-900">{t('brand.profecoContract')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block mb-0.5">Showroom Principal</span>
                      <span className="text-slate-600">{t('brand.address')}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block mb-0.5">Línea Directa de Atención</span>
                      <span className="text-slate-600 font-mono">{t('brand.phone')}</span>
                      <span className="block text-[11px] text-slate-500">WhatsApp Oficial: {t('brand.whatsapp')}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block mb-0.5">Correos de Contacto</span>
                      <span className="block text-slate-600 font-mono">{t('brand.contactEmail')}</span>
                      <span className="block text-[11px] text-slate-500 font-mono">{t('brand.privacyEmail')} (ARCO)</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block mb-0.5">Horarios de Operación</span>
                      <span className="text-slate-600 block">{t('brand.hoursWeekday')}</span>
                      <span className="text-slate-600 block">{t('brand.hoursSaturday')}</span>
                      <span className="text-emerald-700 font-semibold block mt-0.5">Concierge Virtual: 24/7</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                  <span>¿Requiere validar nuestro contrato ante PROFECO?</span>
                  <a
                    href="https://rpca.profeco.gob.mx/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-950 underline"
                  >
                    <span>Registro Público PROFECO</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-500">
              {t('compliance.lastUpdated')}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('compliance.understoodClose')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
