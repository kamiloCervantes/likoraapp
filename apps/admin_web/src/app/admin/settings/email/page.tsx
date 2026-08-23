'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Server,
  Zap,
  Lock,
  Key,
  Globe,
  Layers,
  Inbox,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Info,
  Sliders,
  CheckSquare,
  Square,
  ShoppingBag,
  Truck,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

type EmailProviderType = 'SMTP' | 'GMAIL' | 'BREVO' | 'RESEND' | 'AMAZON_SES' | 'SENDGRID' | 'MAILGUN';

interface ProviderPreset {
  name: string;
  host: string;
  port: number;
  secure: boolean;
  userHint: string;
  pwdHint: string;
  docsUrl: string;
  badge: string;
}

const PRESETS: Record<EmailProviderType, ProviderPreset> = {
  SMTP: {
    name: 'SMTP Estándar / Personalizado',
    host: 'mail.tudominio.com',
    port: 587,
    secure: false,
    userHint: 'usuario@tudominio.com',
    pwdHint: 'Contraseña de la cuenta de correo',
    docsUrl: '#',
    badge: 'Flexible',
  },
  GMAIL: {
    name: 'Google Workspace / Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    userHint: 'tu-correo@gmail.com o tudominio.com',
    pwdHint: 'Contraseña de Aplicación de 16 caracteres (Google App Password)',
    docsUrl: 'https://myaccount.google.com/apppasswords',
    badge: 'Popular',
  },
  BREVO: {
    name: 'Brevo (Sendinblue)',
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    userHint: 'Correo de login en Brevo',
    pwdHint: 'SMTP Master Key de Brevo',
    docsUrl: 'https://app.brevo.com/settings/keys/smtp',
    badge: 'Recomendado (300/día gratis)',
  },
  RESEND: {
    name: 'Resend',
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    userHint: 'resend',
    pwdHint: 'API Key (re_...)',
    docsUrl: 'https://resend.com/api-keys',
    badge: 'Moderno (100/día gratis)',
  },
  AMAZON_SES: {
    name: 'Amazon Simple Email Service (SES)',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false,
    userHint: 'SMTP Username de AWS IAM',
    pwdHint: 'SMTP Password generado en AWS',
    docsUrl: 'https://console.aws.amazon.com/ses/',
    badge: 'Ultra Económico a Escala',
  },
  SENDGRID: {
    name: 'Twilio SendGrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    userHint: 'apikey',
    pwdHint: 'SendGrid API Key (SG....)',
    docsUrl: 'https://app.sendgrid.com/settings/api_keys',
    badge: 'Empresarial',
  },
  MAILGUN: {
    name: 'Mailgun by Sinch',
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    userHint: 'postmaster@tudominio.com',
    pwdHint: 'Password SMTP de Mailgun',
    docsUrl: 'https://app.mailgun.com/app/sending/domains',
    badge: 'Desarrolladores',
  },
};

export default function EmailSettingsPage() {
  const [provider, setProvider] = useState<EmailProviderType>('GMAIL');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('notificaciones@likora.app');
  const [fromName, setFromName] = useState('Likora Delivery & App');
  const [replyTo, setReplyTo] = useState('soporte@likora.app');
  const [isActive, setIsActive] = useState(true);

  // Granular Feature Flags
  const [enableForgotPassword, setEnableForgotPassword] = useState(true);
  const [enableKycApproved, setEnableKycApproved] = useState(false);
  const [enableKycRejected, setEnableKycRejected] = useState(false);
  const [enableOrderConfirmation, setEnableOrderConfirmation] = useState(false);
  const [enableOrderDispatch, setEnableOrderDispatch] = useState(false);
  const [enableWelcomeSignup, setEnableWelcomeSignup] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('cacesa8931@gmail.com');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/v1/admin/email/config');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setProvider(data.provider || 'GMAIL');
          setSmtpHost(data.smtp_host || 'smtp.gmail.com');
          setSmtpPort(data.smtp_port || 587);
          setSmtpSecure(data.smtp_secure || false);
          setSmtpUser(data.smtp_user || '');
          setSmtpPassword(data.smtp_password || '');
          setFromEmail(data.from_email || 'notificaciones@likora.app');
          setFromName(data.from_name || 'Likora Delivery & App');
          setReplyTo(data.reply_to || 'soporte@likora.app');
          setIsActive(data.is_active ?? true);

          // Feature flags
          setEnableForgotPassword(data.enable_forgot_password ?? true);
          setEnableKycApproved(data.enable_kyc_approved ?? false);
          setEnableKycRejected(data.enable_kyc_rejected ?? false);
          setEnableOrderConfirmation(data.enable_order_confirmation ?? false);
          setEnableOrderDispatch(data.enable_order_dispatch ?? false);
          setEnableWelcomeSignup(data.enable_welcome_signup ?? false);
        }
      }
    } catch (e) {
      console.error('Error fetching email config:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleProviderSelect = (selected: EmailProviderType) => {
    setProvider(selected);
    const preset = PRESETS[selected];
    if (preset) {
      setSmtpHost(preset.host);
      setSmtpPort(preset.port);
      setSmtpSecure(preset.secure);
      if (selected === 'RESEND') setSmtpUser('resend');
      if (selected === 'SENDGRID') setSmtpUser('apikey');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/email/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          smtp_host: smtpHost,
          smtp_port: Number(smtpPort),
          smtp_secure: smtpSecure,
          smtp_user: smtpUser,
          smtp_password: smtpPassword,
          from_email: fromEmail,
          from_name: fromName,
          reply_to: replyTo,
          is_active: isActive,
          enable_forgot_password: enableForgotPassword,
          enable_kyc_approved: enableKycApproved,
          enable_kyc_rejected: enableKycRejected,
          enable_order_confirmation: enableOrderConfirmation,
          enable_order_dispatch: enableOrderDispatch,
          enable_welcome_signup: enableWelcomeSignup,
        }),
      });

      if (res.ok) {
        setSaveMessage('Configuración SMTP y permisos de módulos guardados exitosamente.');
        setTimeout(() => setSaveMessage(null), 5000);
      } else {
        const err = await res.json();
        alert('Error al guardar: ' + (err.message || 'Error desconocido'));
      }
    } catch (err: any) {
      alert('Error de conexión con el backend: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRunTest = async () => {
    if (!testEmailInput) {
      alert('Por favor ingrese un correo de destino');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: testEmailInput,
          config: {
            provider,
            smtp_host: smtpHost,
            smtp_port: Number(smtpPort),
            smtp_secure: smtpSecure,
            smtp_user: smtpUser,
            smtp_password: smtpPassword,
            from_email: fromEmail,
            from_name: fromName,
            reply_to: replyTo,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult({
          success: true,
          message: data.message || '¡Conexión y envío exitoso! Revisa la bandeja de entrada.',
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Fallo en la prueba de conexión SMTP.',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: 'Error de red al contactar al backend: ' + e.message,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-6 md:p-10">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Configuración de Notificaciones & Correo (SMTP)
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Gestiona el servidor SMTP y habilita/deshabilita los envíos de correo por funcionalidad.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-[#161b22] border border-gray-800 p-1 rounded-xl">
            <Link
              href="/admin/kyc"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all"
            >
              Auditoría KYC
            </Link>
            <Link
              href="/admin/settings/storage"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all"
            >
              Almacenamiento
            </Link>
            <Link
              href="/admin/settings/email"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30 transition-all"
            >
              Servicio de Correo (SMTP)
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {saveMessage && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* 1. Granular Modules Toggles Section (NEW) */}
        <section className="bg-[#161b22] border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-400" />
                Control de Envíos de Correo por Módulo / Funcionalidad
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Marca con el checkbox qué eventos del sistema tienen permitido enviar correos electrónicos a los usuarios. Si está desmarcado, el sistema no enviará correos para dicha acción.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* 1. Forgot Password */}
            <div
              onClick={() => setEnableForgotPassword(!enableForgotPassword)}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                enableForgotPassword
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-500/5'
                  : 'bg-[#0d1117] border-gray-800 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Recuperación de Contraseña</h3>
                    <span className="text-[11px] text-gray-400">Código OTP de 6 dígitos</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableForgotPassword}
                  onChange={() => {}}
                  className="w-4 h-4 text-amber-500 rounded border-gray-700 bg-gray-900 focus:ring-0 cursor-pointer mt-1"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">Estado de Envío:</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                  enableForgotPassword ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-800 text-gray-400'
                }`}>
                  {enableForgotPassword ? '✓ HABILITADO' : '✕ DESHABILITADO'}
                </span>
              </div>
            </div>

            {/* 2. KYC Approved */}
            <div
              onClick={() => setEnableKycApproved(!enableKycApproved)}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                enableKycApproved
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                  : 'bg-[#0d1117] border-gray-800 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Verificación KYC Aprobada</h3>
                    <span className="text-[11px] text-gray-400">Aprobación +18 y vigencia</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableKycApproved}
                  onChange={() => {}}
                  className="w-4 h-4 text-emerald-500 rounded border-gray-700 bg-gray-900 focus:ring-0 cursor-pointer mt-1"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">Estado de Envío:</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                  enableKycApproved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-400'
                }`}>
                  {enableKycApproved ? '✓ HABILITADO' : '✕ DESHABILITADO'}
                </span>
              </div>
            </div>

            {/* 3. KYC Rejected */}
            <div
              onClick={() => setEnableKycRejected(!enableKycRejected)}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                enableKycRejected
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-md shadow-rose-500/5'
                  : 'bg-[#0d1117] border-gray-800 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Verificación KYC Rechazada</h3>
                    <span className="text-[11px] text-gray-400">Motivos y reintento</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableKycRejected}
                  onChange={() => {}}
                  className="w-4 h-4 text-rose-500 rounded border-gray-700 bg-gray-900 focus:ring-0 cursor-pointer mt-1"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">Estado de Envío:</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                  enableKycRejected ? 'bg-rose-500/20 text-rose-300' : 'bg-gray-800 text-gray-400'
                }`}>
                  {enableKycRejected ? '✓ HABILITADO' : '✕ DESHABILITADO'}
                </span>
              </div>
            </div>

            {/* 4. Order Confirmation */}
            <div
              onClick={() => setEnableOrderConfirmation(!enableOrderConfirmation)}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                enableOrderConfirmation
                  ? 'bg-blue-950/20 border-blue-500/50 shadow-md shadow-blue-500/5'
                  : 'bg-[#0d1117] border-gray-800 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Confirmación de Pedido</h3>
                    <span className="text-[11px] text-gray-400">Resumen y Factura</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableOrderConfirmation}
                  onChange={() => {}}
                  className="w-4 h-4 text-blue-500 rounded border-gray-700 bg-gray-900 focus:ring-0 cursor-pointer mt-1"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">Estado de Envío:</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                  enableOrderConfirmation ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-800 text-gray-400'
                }`}>
                  {enableOrderConfirmation ? '✓ HABILITADO' : '✕ DESHABILITADO'}
                </span>
              </div>
            </div>

            {/* 5. Order Dispatch */}
            <div
              onClick={() => setEnableOrderDispatch(!enableOrderDispatch)}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                enableOrderDispatch
                  ? 'bg-purple-950/20 border-purple-500/50 shadow-md shadow-purple-500/5'
                  : 'bg-[#0d1117] border-gray-800 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Despacho & En Camino</h3>
                    <span className="text-[11px] text-gray-400">Tracking y Repartidor</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableOrderDispatch}
                  onChange={() => {}}
                  className="w-4 h-4 text-purple-500 rounded border-gray-700 bg-gray-900 focus:ring-0 cursor-pointer mt-1"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">Estado de Envío:</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                  enableOrderDispatch ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-800 text-gray-400'
                }`}>
                  {enableOrderDispatch ? '✓ HABILITADO' : '✕ DESHABILITADO'}
                </span>
              </div>
            </div>

            {/* 6. Welcome Sign Up */}
            <div
              onClick={() => setEnableWelcomeSignup(!enableWelcomeSignup)}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                enableWelcomeSignup
                  ? 'bg-teal-950/20 border-teal-500/50 shadow-md shadow-teal-500/5'
                  : 'bg-[#0d1117] border-gray-800 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Bienvenida de Usuario</h3>
                    <span className="text-[11px] text-gray-400">Al registrar nueva cuenta</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableWelcomeSignup}
                  onChange={() => {}}
                  className="w-4 h-4 text-teal-500 rounded border-gray-700 bg-gray-900 focus:ring-0 cursor-pointer mt-1"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">Estado de Envío:</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                  enableWelcomeSignup ? 'bg-teal-500/20 text-teal-300' : 'bg-gray-800 text-gray-400'
                }`}>
                  {enableWelcomeSignup ? '✓ HABILITADO' : '✕ DESHABILITADO'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Provider Cards Grid */}
        <section className="bg-[#161b22] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Selecciona tu Proveedor de Correo Electrónico
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Al seleccionar un proveedor se auto-rellenan los hosts y puertos recomendados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-2">
            {(Object.keys(PRESETS) as EmailProviderType[]).map((key) => {
              const p = PRESETS[key];
              const isSelected = provider === key;
              return (
                <div
                  key={key}
                  onClick={() => handleProviderSelect(key)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-gradient-to-b from-orange-500/10 to-transparent border-orange-500/80 shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/50'
                      : 'bg-[#0d1117] border-gray-800 hover:border-gray-700 hover:bg-[#12161f]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-sm text-white block">{p.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 ml-2" />}
                  </div>
                  <div className="mt-2 text-xs text-gray-400 font-mono">{p.host}</div>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Puerto: {p.port}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-800 text-orange-400 font-medium">
                      {p.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. SMTP Credentials & Setup Form */}
        <form onSubmit={handleSave} className="bg-[#161b22] border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-orange-400" />
                Parámetros de Conexión SMTP
              </h2>
              <p className="text-xs text-gray-400">
                Ajusta las credenciales de autenticación para enviar correos transaccionales.
              </p>
            </div>
            {PRESETS[provider].docsUrl !== '#' && (
              <a
                href={PRESETS[provider].docsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-orange-400 hover:underline flex items-center gap-1"
              >
                Documentación {PRESETS[provider].name.split(' ')[0]} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Host */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Servidor Host SMTP</label>
              <input
                type="text"
                required
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="ej. smtp.gmail.com"
                className="w-full bg-[#0d1117] border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Port */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Puerto</label>
              <input
                type="number"
                required
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                placeholder="587 o 465"
                className="w-full bg-[#0d1117] border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Secure SSL Toggle */}
          <div className="p-3.5 bg-[#0d1117] border border-gray-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-sm font-semibold text-white">Conexión Segura SSL (Port 465)</div>
                <div className="text-xs text-gray-400">
                  Desmarcado para TLS / STARTTLS en puerto 587 (Recomendado). Marcado solo para SSL directo en 465.
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smtpSecure}
                onChange={(e) => setSmtpSecure(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Usuario / Correo Remitente ({PRESETS[provider].userHint})
              </label>
              <input
                type="text"
                required
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="ej. notificaciones@likora.app"
                className="w-full bg-[#0d1117] border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Contraseña / API Key ({PRESETS[provider].pwdHint})
              </label>
              <input
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder={smtpPassword ? '••••••••••••' : 'Ingrese contraseña o API Key'}
                className="w-full bg-[#0d1117] border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Sender Details */}
          <div className="border-t border-gray-800/80 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Nombre del Remitente</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Likora Delivery & App"
                className="w-full bg-[#0d1117] border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Correo Remitente (From)</label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="notificaciones@likora.app"
                className="w-full bg-[#0d1117] border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Correo de Respuesta (Reply-To)</label>
              <input
                type="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                placeholder="soporte@likora.app"
                className="w-full bg-[#0d1117] border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Actions: Save & Test */}
          <div className="border-t border-gray-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setShowTestModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm font-semibold text-gray-200 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4 text-orange-400" />
              Probar Conexión y Enviar Test
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-7 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl text-sm font-bold text-white shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Guardar Configuración
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Test Connection Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-orange-400" />
                Prueba de Conexión SMTP en Vivo
              </h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-gray-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              El backend intentará autenticarse con el servidor <strong>{smtpHost}:{smtpPort}</strong> y enviar un correo de prueba con la plantilla oficial de Likora.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Correo de Destino:</label>
              <input
                type="email"
                required
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                placeholder="tu-correo@gmail.com"
                className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-all"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleRunTest}
                disabled={testing}
                className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-orange-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verificando...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Enviar Correo de Prueba
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
