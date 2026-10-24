'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Server,
  Zap,
  Radio,
  ExternalLink,
  Info,
  Key,
  Globe,
  Layers,
  Mail,
  Send,
  Sliders,
  Sparkles,
  ShieldCheck,
  Lock,
  ShoppingBag,
  Truck,
  UserCheck,
  Settings,
  SlidersHorizontal,
  Navigation,
  MapPin,
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Check,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';

type StorageProviderType = 'LOCAL' | 'AWS_S3' | 'CLOUDFLARE_R2' | 'MINIO';

interface StorageConfigForm {
  provider: StorageProviderType;
  bucket_name: string;
  region: string;
  endpoint: string;
  cloudflare_account_id?: string;
  access_key_id: string;
  secret_access_key: string;
  custom_domain: string;
  is_active: boolean;
}

type EmailProviderType = 'SMTP' | 'GMAIL' | 'BREVO' | 'RESEND' | 'AMAZON_SES' | 'SENDGRID' | 'MAILGUN';

interface EmailPreset {
  name: string;
  host: string;
  port: number;
  secure: boolean;
  userHint: string;
  pwdHint: string;
  docsUrl: string;
  badge: string;
}

const EMAIL_PRESETS: Record<EmailProviderType, EmailPreset> = {
  SMTP: {
    name: 'SMTP Estándar',
    host: 'mail.tudominio.com',
    port: 587,
    secure: false,
    userHint: 'usuario@tudominio.com',
    pwdHint: 'Contraseña del buzón',
    docsUrl: '#',
    badge: 'Flexible',
  },
  GMAIL: {
    name: 'Google Workspace / Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    userHint: 'tu-correo@gmail.com',
    pwdHint: 'Contraseña de Aplicación (16 car.)',
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
    badge: '300/día gratis',
  },
  RESEND: {
    name: 'Resend',
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    userHint: 'resend',
    pwdHint: 'API Key (re_...)',
    docsUrl: 'https://resend.com/api-keys',
    badge: '100/día gratis',
  },
  AMAZON_SES: {
    name: 'Amazon SES',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false,
    userHint: 'SMTP Username IAM',
    pwdHint: 'SMTP Password AWS',
    docsUrl: 'https://console.aws.amazon.com/ses/',
    badge: 'Económico',
  },
  SENDGRID: {
    name: 'SendGrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    userHint: 'apikey',
    pwdHint: 'SendGrid API Key',
    docsUrl: 'https://app.sendgrid.com/settings/api_keys',
    badge: 'Empresarial',
  },
  MAILGUN: {
    name: 'Mailgun',
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    userHint: 'postmaster@tudominio.com',
    pwdHint: 'Password SMTP Mailgun',
    docsUrl: 'https://app.mailgun.com/app/sending/domains',
    badge: 'Developers',
  },
};

function UnifiedSettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'storage';
  const [activeTab, setActiveTab] = useState<'storage' | 'email' | 'notifications' | 'google_maps' | 'payments'>(
    initialTab === 'email' ? 'email' : initialTab === 'notifications' ? 'notifications' : initialTab === 'google_maps' ? 'google_maps' : initialTab === 'payments' ? 'payments' : 'storage'
  );

  // ==========================================
  // GOOGLE MAPS & LIVE TRACKING CONFIG STATE
  // ==========================================
  const [mapsConfig, setMapsConfig] = useState({
    api_key_web: '',
    api_key_android: '',
    api_key_ios: '',
    api_key_server: '',
    is_live_tracking_enabled: true,
    is_directions_enabled: true,
    gps_update_interval_sec: 5,
    default_center_lat: 6.2085710,
    default_center_lng: -75.5684340,
    is_active: true,
  });
  const [loadingMaps, setLoadingMaps] = useState(false);
  const [savingMaps, setSavingMaps] = useState(false);
  const [testingMaps, setTestingMaps] = useState(false);
  const [mapsSaveSuccess, setMapsSaveSuccess] = useState(false);
  const [mapsTestResult, setMapsTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchMapsConfig = async () => {
    try {
      setLoadingMaps(true);
      const res = await fetch('http://localhost:3000/api/v1/admin/maps/config');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMapsConfig({
            api_key_web: json.data.api_key_web || '',
            api_key_android: json.data.api_key_android || '',
            api_key_ios: json.data.api_key_ios || '',
            api_key_server: json.data.api_key_server || '',
            is_live_tracking_enabled: json.data.is_live_tracking_enabled !== false,
            is_directions_enabled: json.data.is_directions_enabled !== false,
            gps_update_interval_sec: json.data.gps_update_interval_sec || 5,
            default_center_lat: Number(json.data.default_center_lat) || 6.2085710,
            default_center_lng: Number(json.data.default_center_lng) || -75.5684340,
            is_active: json.data.is_active !== false,
          });
        }
      }
    } catch (e) {
      console.error('Error fetching Google Maps config:', e);
    } finally {
      setLoadingMaps(false);
    }
  };

  const saveMapsConfig = async () => {
    try {
      setSavingMaps(true);
      setMapsSaveSuccess(false);
      const res = await fetch('http://localhost:3000/api/v1/admin/maps/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapsConfig),
      });
      if (res.ok) {
        setMapsSaveSuccess(true);
        setTimeout(() => setMapsSaveSuccess(false), 3500);
      } else {
        alert('Error al guardar la configuración de Google Maps.');
      }
    } catch (e) {
      console.error('Error saving Google Maps config:', e);
      alert('Error de conexión al guardar configuración.');
    } finally {
      setSavingMaps(false);
    }
  };

  const testMapsConnection = async () => {
    try {
      setTestingMaps(true);
      setMapsTestResult(null);
      const res = await fetch('http://localhost:3000/api/v1/admin/maps/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: mapsConfig.api_key_server || mapsConfig.api_key_web }),
      });
      const data = await res.json();
      setMapsTestResult({
        success: data.status === 'success' || data.success === true,
        message: data.message || 'Prueba de conexión completada',
      });
    } catch (e: any) {
      setMapsTestResult({
        success: false,
        message: `Error al probar Google Maps: ${e.message}`,
      });
    } finally {
      setTestingMaps(false);
    }
  };

  // ==========================================
  // STRIPE PAYMENTS CONFIG & TRANSACTIONS STATE
  // ==========================================
  const [paymentsConfig, setPaymentsConfig] = useState({
    provider: 'stripe',
    publishable_key: '',
    secret_key: '',
    webhook_secret: '',
    currency: 'USD',
    is_live_mode: false,
    is_active: true,
    merchant_name: 'Likora Liquors & Spirits',
    statement_descriptor: 'LIKORA',
  });
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [savingPayments, setSavingPayments] = useState(false);
  const [testingPayments, setTestingPayments] = useState(false);
  const [paymentsSaveSuccess, setPaymentsSaveSuccess] = useState(false);
  const [paymentsTestResult, setPaymentsTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const fetchPaymentsConfig = async () => {
    try {
      setLoadingPayments(true);
      const res = await fetch('http://localhost:3000/api/v1/admin/payments/config');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setPaymentsConfig({
            provider: json.data.provider || 'stripe',
            publishable_key: json.data.publishable_key || '',
            secret_key: json.data.secret_key || '',
            webhook_secret: json.data.webhook_secret || '',
            currency: json.data.currency || 'USD',
            is_live_mode: json.data.is_live_mode === true,
            is_active: json.data.is_active !== false,
            merchant_name: json.data.merchant_name || 'Likora Liquors & Spirits',
            statement_descriptor: json.data.statement_descriptor || 'LIKORA',
          });
        }
      }
    } catch (e) {
      console.error('Error fetching Payments config:', e);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const res = await fetch('http://localhost:3000/api/v1/admin/payments/transactions?limit=15');
      if (res.ok) {
        const json = await res.json();
        setTransactions(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching transactions:', e);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const savePaymentsConfig = async () => {
    try {
      setSavingPayments(true);
      setPaymentsSaveSuccess(false);
      const res = await fetch('http://localhost:3000/api/v1/admin/payments/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentsConfig),
      });
      if (res.ok) {
        setPaymentsSaveSuccess(true);
        setTimeout(() => setPaymentsSaveSuccess(false), 3500);
      } else {
        alert('Error al guardar la configuración de Stripe.');
      }
    } catch (e) {
      console.error('Error saving payments config:', e);
      alert('Error de conexión al guardar configuración de Stripe.');
    } finally {
      setSavingPayments(false);
    }
  };

  const testPaymentsConnection = async () => {
    try {
      setTestingPayments(true);
      setPaymentsTestResult(null);
      const res = await fetch('http://localhost:3000/api/v1/admin/payments/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret_key: paymentsConfig.secret_key }),
      });
      const data = await res.json();
      setPaymentsTestResult({
        success: data.status === 'success' || data.success === true,
        message: data.message || 'Prueba de conexión completada',
        details: data.details,
      });
    } catch (e: any) {
      setPaymentsTestResult({
        success: false,
        message: `Error al probar Stripe: ${e.message}`,
      });
    } finally {
      setTestingPayments(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    fetchMapsConfig();
    fetchPaymentsConfig();
    fetchTransactions();
  }, []);


  // Storage
  const [storageForm, setStorageForm] = useState<StorageConfigForm>({
    provider: 'LOCAL',
    bucket_name: '',
    region: 'us-east-1',
    endpoint: '',
    cloudflare_account_id: '',
    access_key_id: '',
    secret_access_key: '',
    custom_domain: '',
    is_active: true,
  });
  const [storageTesting, setStorageTesting] = useState(false);
  const [storageSaving, setStorageSaving] = useState(false);
  const [storageTestResult, setStorageTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [storageSaveMsg, setStorageSaveMsg] = useState<string | null>(null);

  // Email
  const [emailProvider, setEmailProvider] = useState<EmailProviderType>('GMAIL');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('notificaciones@likora.app');
  const [fromName, setFromName] = useState('Likora Delivery & App');
  const [replyTo, setReplyTo] = useState('soporte@likora.app');
  const [emailIsActive, setEmailIsActive] = useState(true);

  // Feature Flags
  const [enableForgotPassword, setEnableForgotPassword] = useState(true);
  const [enableKycApproved, setEnableKycApproved] = useState(false);
  const [enableKycRejected, setEnableKycRejected] = useState(false);
  const [enableOrderConfirmation, setEnableOrderConfirmation] = useState(false);
  const [enableOrderDispatch, setEnableOrderDispatch] = useState(false);
  const [enableWelcomeSignup, setEnableWelcomeSignup] = useState(false);

  const [emailSaving, setEmailSaving] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);
  const [showEmailTestModal, setShowEmailTestModal] = useState(false);
  const [emailTestInput, setEmailTestInput] = useState('cacesa8931@gmail.com');
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [emailSaveMsg, setEmailSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/admin/storage/config')
      .then((r) => r.json())
      .then((d) => {
        if (d) setStorageForm((prev) => ({ ...prev, ...d }));
      })
      .catch(() => {});

    fetch('http://localhost:3000/api/v1/admin/email/config')
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setEmailProvider(d.provider || 'GMAIL');
          setSmtpHost(d.smtp_host || 'smtp.gmail.com');
          setSmtpPort(d.smtp_port || 587);
          setSmtpSecure(d.smtp_secure || false);
          setSmtpUser(d.smtp_user || '');
          setSmtpPassword(d.smtp_password || '');
          setFromEmail(d.from_email || 'notificaciones@likora.app');
          setFromName(d.from_name || 'Likora Delivery & App');
          setReplyTo(d.reply_to || 'soporte@likora.app');
          setEmailIsActive(d.is_active ?? true);
          setEnableForgotPassword(d.enable_forgot_password ?? true);
          setEnableKycApproved(d.enable_kyc_approved ?? false);
          setEnableKycRejected(d.enable_kyc_rejected ?? false);
          setEnableOrderConfirmation(d.enable_order_confirmation ?? false);
          setEnableOrderDispatch(d.enable_order_dispatch ?? false);
          setEnableWelcomeSignup(d.enable_welcome_signup ?? false);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    setStorageSaving(true);
    setStorageSaveMsg(null);
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/storage/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storageForm),
      });
      if (res.ok) {
        setStorageSaveMsg('Configuración de almacenamiento guardada exitosamente.');
        setTimeout(() => setStorageSaveMsg(null), 5000);
      }
    } finally {
      setStorageSaving(false);
    }
  };

  const handleTestStorage = async () => {
    setStorageTesting(true);
    setStorageTestResult(null);
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/storage/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: storageForm }),
      });
      const data = await res.json();
      setStorageTestResult({
        success: res.ok && data.success,
        message: data.message || 'Prueba de Bucket completada',
      });
    } finally {
      setStorageTesting(false);
    }
  };

  const handleEmailProviderSelect = (selected: EmailProviderType) => {
    setEmailProvider(selected);
    const preset = EMAIL_PRESETS[selected];
    if (preset) {
      setSmtpHost(preset.host);
      setSmtpPort(preset.port);
      setSmtpSecure(preset.secure);
      if (selected === 'RESEND') setSmtpUser('resend');
      if (selected === 'SENDGRID') setSmtpUser('apikey');
    }
  };

  const handleSaveEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEmailSaving(true);
    setEmailSaveMsg(null);
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/email/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: emailProvider,
          smtp_host: smtpHost,
          smtp_port: Number(smtpPort),
          smtp_secure: smtpSecure,
          smtp_user: smtpUser,
          smtp_password: smtpPassword,
          from_email: fromEmail,
          from_name: fromName,
          reply_to: replyTo,
          is_active: emailIsActive,
          enable_forgot_password: enableForgotPassword,
          enable_kyc_approved: enableKycApproved,
          enable_kyc_rejected: enableKycRejected,
          enable_order_confirmation: enableOrderConfirmation,
          enable_order_dispatch: enableOrderDispatch,
          enable_welcome_signup: enableWelcomeSignup,
        }),
      });
      if (res.ok) {
        setEmailSaveMsg('Configuración SMTP y permisos guardados exitosamente.');
        setTimeout(() => setEmailSaveMsg(null), 5000);
      }
    } finally {
      setEmailSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setEmailTesting(true);
    setEmailTestResult(null);
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: emailTestInput,
          config: {
            provider: emailProvider,
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
      setEmailTestResult({
        success: res.ok && data.success,
        message: data.message || 'Prueba de conexión SMTP completada',
      });
    } finally {
      setEmailTesting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Configuración General</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Administra los Buckets de almacenamiento en la nube, servidores SMTP y políticas de envío de notificaciones.
          </p>
        </div>

        {/* shadcn Tabs Switcher */}
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground shadow-xs">
          <button
            onClick={() => setActiveTab('storage')}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none',
              activeTab === 'storage' && 'bg-background text-foreground shadow-xs font-semibold'
            )}
          >
            <HardDrive className="w-3.5 h-3.5 mr-1.5" />
            Almacenamiento
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none',
              activeTab === 'email' && 'bg-background text-foreground shadow-xs font-semibold'
            )}
          >
            <Server className="w-3.5 h-3.5 mr-1.5" />
            Servidor SMTP
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none',
              activeTab === 'notifications' && 'bg-background text-foreground shadow-xs font-semibold'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Módulos de Envío
          </button>
          <button
            onClick={() => setActiveTab('google_maps')}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none',
              activeTab === 'google_maps' && 'bg-background text-foreground shadow-xs font-semibold'
            )}
          >
            <Navigation className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            Google Maps & GPS
          </button>
          <button
            onClick={() => {
              setActiveTab('payments');
              fetchTransactions();
            }}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none',
              activeTab === 'payments' && 'bg-background text-foreground shadow-xs font-semibold'
            )}
          >
            <CreditCard className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
            Stripe & Pagos
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STORAGE / BUCKETS                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          {storageSaveMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{storageSaveMsg}</span>
            </div>
          )}

          {/* Provider Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Proveedor de Almacenamiento (Buckets)</CardTitle>
              <CardDescription>
                Selecciona la infraestructura para almacenar fotografías de documentos KYC y multimedia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {[
                  { id: 'LOCAL', name: 'Local (Disco)', desc: 'Servidor local / Desarrollo', icon: HardDrive },
                  { id: 'CLOUDFLARE_R2', name: 'Cloudflare R2', desc: '$0 Egress Fees (Recomendado)', icon: Zap },
                  { id: 'AWS_S3', name: 'Amazon S3', desc: 'Estándar empresarial AWS', icon: Cloud },
                  { id: 'MINIO', name: 'MinIO Server', desc: 'S3 Propio / Auto-hospedado', icon: Server },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = storageForm.provider === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setStorageForm({ ...storageForm, provider: item.id as StorageProviderType })}
                      className={cn(
                        'cursor-pointer p-4 rounded-xl border transition-all text-left relative',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted/40'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={cn('w-4 h-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="text-xs font-semibold text-foreground">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          {storageForm.provider !== 'LOCAL' ? (
            <Card>
              <form onSubmit={handleSaveStorage}>
                <CardHeader>
                  <CardTitle>Credenciales de Conexión ({storageForm.provider})</CardTitle>
                  <CardDescription>Parámetros de acceso y autenticación al Bucket S3/R2.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Nombre del Bucket</label>
                      <Input
                        required
                        value={storageForm.bucket_name}
                        onChange={(e) => setStorageForm({ ...storageForm, bucket_name: e.target.value })}
                        placeholder="ej. likora-kyc-documents"
                      />
                    </div>

                    {storageForm.provider === 'CLOUDFLARE_R2' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Cloudflare Account ID</label>
                        <Input
                          required
                          value={storageForm.cloudflare_account_id || ''}
                          onChange={(e) => setStorageForm({ ...storageForm, cloudflare_account_id: e.target.value })}
                          placeholder="Account ID de Cloudflare"
                        />
                      </div>
                    )}

                    {storageForm.provider === 'AWS_S3' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Región AWS</label>
                        <Input
                          required
                          value={storageForm.region}
                          onChange={(e) => setStorageForm({ ...storageForm, region: e.target.value })}
                          placeholder="ej. us-east-1"
                        />
                      </div>
                    )}

                    {storageForm.provider === 'MINIO' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Endpoint URL</label>
                        <Input
                          required
                          value={storageForm.endpoint}
                          onChange={(e) => setStorageForm({ ...storageForm, endpoint: e.target.value })}
                          placeholder="ej. http://192.168.1.50:9000"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Access Key ID</label>
                      <Input
                        required
                        value={storageForm.access_key_id}
                        onChange={(e) => setStorageForm({ ...storageForm, access_key_id: e.target.value })}
                        placeholder="Access Key"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Secret Access Key</label>
                      <Input
                        type="password"
                        required
                        value={storageForm.secret_access_key}
                        onChange={(e) => setStorageForm({ ...storageForm, secret_access_key: e.target.value })}
                        placeholder="Secret Key"
                      />
                    </div>
                  </div>

                  {storageTestResult && (
                    <div
                      className={cn(
                        'p-3 rounded-lg border text-xs flex items-center gap-2',
                        storageTestResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-destructive/10 border-destructive/20 text-destructive'
                      )}
                    >
                      {storageTestResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{storageTestResult.message}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                  <Button type="button" variant="outline" onClick={handleTestStorage} disabled={storageTesting}>
                    {storageTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Radio className="w-3.5 h-3.5 mr-1.5" />}
                    Probar Conexión
                  </Button>
                  <Button type="submit" disabled={storageSaving}>
                    {storageSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                    Guardar Configuración
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-foreground">Modo Local Activo</div>
                  <div className="text-[11px] text-muted-foreground">Los archivos se almacenan en el disco del servidor.</div>
                </div>
                <Button type="button" onClick={handleSaveStorage}>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> Confirmar Modo Local
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EMAIL SMTP SERVER                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          {emailSaveMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{emailSaveMsg}</span>
            </div>
          )}

          {/* Provider Grid */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Proveedor de Correo Electrónico (SMTP)</CardTitle>
              <CardDescription>
                Selecciona tu servicio de mensajería para auto-completar host y puerto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {(Object.keys(EMAIL_PRESETS) as EmailProviderType[]).map((key) => {
                  const p = EMAIL_PRESETS[key];
                  const isSelected = emailProvider === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleEmailProviderSelect(key)}
                      className={cn(
                        'cursor-pointer p-3.5 rounded-xl border transition-all text-left',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted/40'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-xs text-foreground">{p.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground mt-1 truncate">{p.host}</div>
                      <div className="mt-2.5 flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Puerto: {p.port}</span>
                        <Badge variant={isSelected ? 'default' : 'secondary'} className="text-[9px] px-1.5 py-0 h-4">
                          {p.badge}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card>
            <form onSubmit={handleSaveEmail}>
              <CardHeader>
                <CardTitle>Credenciales de Servidor SMTP</CardTitle>
                <CardDescription>Configura el buzón emisor de notificaciones y OTPs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Servidor Host SMTP</label>
                    <Input
                      required
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="ej. smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Puerto</label>
                    <Input
                      type="number"
                      required
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value))}
                      placeholder="587 o 465"
                    />
                  </div>
                </div>

                <div className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-foreground">Conexión Segura SSL (Port 465)</div>
                    <div className="text-[11px] text-muted-foreground">Desmarcado para TLS/STARTTLS en 587 (Recomendado). Marcado para SSL en 465.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smtpSecure}
                    onChange={(e) => setSmtpSecure(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-input cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Usuario / Remitente ({EMAIL_PRESETS[emailProvider].userHint})</label>
                    <Input
                      required
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="ej. notificaciones@likora.app"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Contraseña / API Key</label>
                    <Input
                      type="password"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder={smtpPassword ? '••••••••••••' : 'Ingrese clave o API key'}
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Nombre Remitente</label>
                    <Input
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      placeholder="Likora Delivery"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Correo Remitente (From)</label>
                    <Input
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="notificaciones@likora.app"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Correo de Respuesta (Reply-To)</label>
                    <Input
                      type="email"
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                      placeholder="soporte@likora.app"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEmailTestModal(true)}>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Probar Conexión SMTP
                </Button>
                <Button type="submit" disabled={emailSaving}>
                  {emailSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                  Guardar Configuración
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GRANULAR NOTIFICATION TOGGLES                                     */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Control de Envíos de Correo por Módulo</CardTitle>
            <CardDescription>
              Habilita o deshabilita individualmente qué funciones del sistema pueden enviar correos a los usuarios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                {
                  id: 'forgot_password',
                  name: 'Recuperación de Contraseña',
                  desc: 'Código OTP de 6 dígitos con 15m vigencia',
                  icon: Lock,
                  enabled: enableForgotPassword,
                  toggle: () => setEnableForgotPassword(!enableForgotPassword),
                },
                {
                  id: 'kyc_approved',
                  name: 'Verificación KYC Aprobada',
                  desc: 'Aprobación +18 y vigencia de 1 hora',
                  icon: CheckCircle2,
                  enabled: enableKycApproved,
                  toggle: () => setEnableKycApproved(!enableKycApproved),
                },
                {
                  id: 'kyc_rejected',
                  name: 'Verificación KYC Rechazada',
                  desc: 'Motivos de rechazo y recaptura',
                  icon: AlertCircle,
                  enabled: enableKycRejected,
                  toggle: () => setEnableKycRejected(!enableKycRejected),
                },
                {
                  id: 'order_confirmation',
                  name: 'Confirmación de Pedido',
                  desc: 'Resumen de compra y factura digital',
                  icon: ShoppingBag,
                  enabled: enableOrderConfirmation,
                  toggle: () => setEnableOrderConfirmation(!enableOrderConfirmation),
                },
                {
                  id: 'order_dispatch',
                  name: 'Despacho & En Camino',
                  desc: 'Tracking del repartidor en vivo',
                  icon: Truck,
                  enabled: enableOrderDispatch,
                  toggle: () => setEnableOrderDispatch(!enableOrderDispatch),
                },
                {
                  id: 'welcome_signup',
                  name: 'Bienvenida de Usuario',
                  desc: 'Al crear cuenta en la plataforma',
                  icon: UserCheck,
                  enabled: enableWelcomeSignup,
                  toggle: () => setEnableWelcomeSignup(!enableWelcomeSignup),
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={item.toggle}
                    className={cn(
                      'cursor-pointer p-4 rounded-xl border transition-all text-left',
                      item.enabled
                        ? 'border-primary/40 bg-primary/5 shadow-xs'
                        : 'border-border bg-card opacity-60 hover:opacity-100'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={cn('p-1.5 rounded-lg', item.enabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground">{item.name}</div>
                          <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => {}}
                        className="w-4 h-4 text-primary rounded border-input cursor-pointer mt-1"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs border-t border-border/50 pt-2.5">
                      <span className="text-muted-foreground text-[11px]">Envío:</span>
                      <Badge variant={item.enabled ? 'success' : 'secondary'} className="text-[10px] py-0 h-4">
                        {item.enabled ? 'HABILITADO' : 'DESHABILITADO'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border pt-4">
            <Button onClick={() => handleSaveEmail()} disabled={emailSaving}>
              {emailSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Guardar Permisos de Módulos
            </Button>
          </CardFooter>
        </Card>
      )}


      {/* ========================================================================= */}
      {/* TAB 4: GOOGLE MAPS API & LIVE DRIVER TRACKING                             */}
      {/* ========================================================================= */}
      {activeTab === 'google_maps' && (
        <div className="space-y-6">
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-indigo-600" />
                    Google Maps API & Rastreo de Conductores en Tiempo Real
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    Configure las credenciales de Google Cloud Maps para el seguimiento GPS del repartidor y geolocalización.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs py-1 px-3">
                  Google Maps SDK
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    API Key Android (Mobile App)
                  </label>
                  <Input
                    type="password"
                    value={mapsConfig.api_key_android}
                    onChange={(e) => setMapsConfig({ ...mapsConfig, api_key_android: e.target.value })}
                    placeholder="AIzaSyB..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">Restringida por SHA-1 y paquete com.likora.passenger</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    API Key Web (Panel Administrativo)
                  </label>
                  <Input
                    type="password"
                    value={mapsConfig.api_key_web}
                    onChange={(e) => setMapsConfig({ ...mapsConfig, api_key_web: e.target.value })}
                    placeholder="AIzaSyB..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">Restringida por referenciador HTTP (dominio likora.app)</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    API Key iOS (App Store)
                  </label>
                  <Input
                    type="password"
                    value={mapsConfig.api_key_ios}
                    onChange={(e) => setMapsConfig({ ...mapsConfig, api_key_ios: e.target.value })}
                    placeholder="AIzaSyB..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">Restringida por Bundle ID de iOS</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    API Key Servidor Backend (Geocoding & Directions)
                  </label>
                  <Input
                    type="password"
                    value={mapsConfig.api_key_server}
                    onChange={(e) => setMapsConfig({ ...mapsConfig, api_key_server: e.target.value })}
                    placeholder="AIzaSyB..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">Usada para calcular rutas optimizadas y distancias</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Parámetros de Rastreo & Coordenadas</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Frecuencia GPS Conductor</label>
                    <select
                      value={mapsConfig.gps_update_interval_sec}
                      onChange={(e) => setMapsConfig({ ...mapsConfig, gps_update_interval_sec: Number(e.target.value) })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value={3}>Cada 3 segundos (Tiempo real ultra suave)</option>
                      <option value={5}>Cada 5 segundos (Recomendado estándar)</option>
                      <option value={10}>Cada 10 segundos (Ahorro de batería)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Latitud Central Predeterminada</label>
                    <Input
                      type="number"
                      step="any"
                      value={mapsConfig.default_center_lat}
                      onChange={(e) => setMapsConfig({ ...mapsConfig, default_center_lat: Number(e.target.value) })}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Longitud Central Predeterminada</label>
                    <Input
                      type="number"
                      step="any"
                      value={mapsConfig.default_center_lng}
                      onChange={(e) => setMapsConfig({ ...mapsConfig, default_center_lng: Number(e.target.value) })}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={mapsConfig.is_live_tracking_enabled}
                      onChange={(e) => setMapsConfig({ ...mapsConfig, is_live_tracking_enabled: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    Habilitar Seguimiento GPS en Vivo en la App
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={mapsConfig.is_directions_enabled}
                      onChange={(e) => setMapsConfig({ ...mapsConfig, is_directions_enabled: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    Trazar Polilíneas de Ruta (Google Directions)
                  </label>
                </div>
              </div>

              {mapsTestResult && (
                <div
                  className={cn(
                    'p-3.5 rounded-xl border text-xs flex items-center gap-2',
                    mapsTestResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      : 'bg-destructive/10 border-destructive/20 text-destructive'
                  )}
                >
                  {mapsTestResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{mapsTestResult.message}</span>
                </div>
              )}

              {mapsSaveSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Configuración de Google Maps guardada exitosamente en el servidor.</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-200/80 pt-4">
              <Button
                variant="outline"
                onClick={testMapsConnection}
                disabled={testingMaps}
                className="text-xs"
              >
                {testingMaps ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Navigation className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />}
                Probar Conexión con Google Maps
              </Button>
              <Button
                onClick={saveMapsConfig}
                disabled={savingMaps}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
              >
                {savingMaps ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                Guardar Configuración de Mapas
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: STRIPE PAYMENTS CONFIG & PAYMENT GATEWAY                            */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    Pasarela de Pagos Stripe & Cobros de Clientes
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    Administre las credenciales secretas y públicas del API de Stripe para recibir cobros con tarjetas bancarias en las aplicaciones.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    'text-xs py-1 px-2.5 font-semibold',
                    paymentsConfig.is_live_mode
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-blue-50 text-blue-700 border-blue-300'
                  )}>
                    {paymentsConfig.is_live_mode ? '🔴 MODO PRODUCCIÓN (LIVE)' : '🧪 MODO SANDBOX (TEST)'}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    'text-xs py-1 px-2.5 font-semibold',
                    paymentsConfig.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  )}>
                    {paymentsConfig.is_active ? 'HABILITADO' : 'DESHABILITADO'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* API Keys Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Secret Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Stripe Secret Key (sk_test_... / sk_live_...)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      {showSecretKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showSecretKey ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <Input
                    type={showSecretKey ? 'text' : 'password'}
                    value={paymentsConfig.secret_key}
                    onChange={(e) => setPaymentsConfig({ ...paymentsConfig, secret_key: e.target.value })}
                    placeholder="sk_test_51..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Utilizada por el servidor backend para crear y confirmar los PaymentIntents. Manténgala confidencial.
                  </p>
                </div>

                {/* Publishable Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      Stripe Publishable Key (pk_test_... / pk_live_...)
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(paymentsConfig.publishable_key, 'publishable')}
                      className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      {copiedKey === 'publishable' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'publishable' ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <Input
                    type="text"
                    value={paymentsConfig.publishable_key}
                    onChange={(e) => setPaymentsConfig({ ...paymentsConfig, publishable_key: e.target.value })}
                    placeholder="pk_test_51..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Sincronizada automáticamente con la app móvil Flutter para validar tokens y checkout seguro.
                  </p>
                </div>

                {/* Webhook Secret */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    Stripe Webhook Signing Secret (whsec_...)
                  </label>
                  <Input
                    type="password"
                    value={paymentsConfig.webhook_secret}
                    onChange={(e) => setPaymentsConfig({ ...paymentsConfig, webhook_secret: e.target.value })}
                    placeholder="whsec_..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Endpoint de retorno: <span className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded">https://api.likora.app/api/v1/payments/webhook</span>
                  </p>
                </div>

                {/* Currency & Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    Moneda Predeterminada de Cobro
                  </label>
                  <select
                    value={paymentsConfig.currency}
                    onChange={(e) => setPaymentsConfig({ ...paymentsConfig, currency: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="USD">USD - Dólar Estadounidense ($)</option>
                    <option value="MXN">MXN - Peso Mexicano ($)</option>
                    <option value="COP">COP - Peso Colombiano ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Moneda en la que se calculan los montos de la cesta de compras.
                  </p>
                </div>
              </div>

              {/* Business Name and Statement Descriptor */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Identidad de Comercio & Preferencias</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Nombre del Comercio</label>
                    <Input
                      type="text"
                      value={paymentsConfig.merchant_name}
                      onChange={(e) => setPaymentsConfig({ ...paymentsConfig, merchant_name: e.target.value })}
                      placeholder="Likora Liquors & Spirits"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Descriptor en Extracto Bancario (Max 22 caracteres)</label>
                    <Input
                      type="text"
                      maxLength={22}
                      value={paymentsConfig.statement_descriptor}
                      onChange={(e) => setPaymentsConfig({ ...paymentsConfig, statement_descriptor: e.target.value })}
                      placeholder="LIKORA"
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={paymentsConfig.is_active}
                      onChange={(e) => setPaymentsConfig({ ...paymentsConfig, is_active: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    Aceptar Pagos con Tarjeta y Stripe en la Aplicación
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={paymentsConfig.is_live_mode}
                      onChange={(e) => setPaymentsConfig({ ...paymentsConfig, is_live_mode: e.target.checked })}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    Modo Producción Live (Desmarcar para modo Test Sandbox de pruebas)
                  </label>
                </div>
              </div>

              {paymentsTestResult && (
                <div
                  className={cn(
                    'p-3.5 rounded-xl border text-xs flex items-center gap-2',
                    paymentsTestResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      : 'bg-destructive/10 border-destructive/20 text-destructive'
                  )}
                >
                  {paymentsTestResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <div className="flex-1">
                    <span className="font-semibold">{paymentsTestResult.message}</span>
                    {paymentsTestResult.details?.livemode !== undefined && (
                      <span className="block text-[11px] opacity-80 mt-0.5">
                        Modo detectado: {paymentsTestResult.details.livemode ? 'Live Producción' : 'Test Sandbox'} • Monedas soportadas: {paymentsTestResult.details.available_currencies?.join(', ') || 'Todas'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {paymentsSaveSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Configuración y credenciales de Stripe guardadas exitosamente en el servidor.</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-200/80 pt-4">
              <Button
                variant="outline"
                onClick={testPaymentsConnection}
                disabled={testingPayments}
                className="text-xs"
              >
                {testingPayments ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Zap className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />}
                Probar Conexión con Stripe API
              </Button>
              <Button
                onClick={savePaymentsConfig}
                disabled={savingPayments}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
              >
                {savingPayments ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                Guardar Configuración de Stripe
              </Button>
            </CardFooter>
          </Card>

          {/* Transactions History Card */}
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Transacciones Recientes de Stripe
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Historial de órdenes y pagos procesados a través del API de Stripe.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchTransactions}
                  disabled={loadingTransactions}
                  className="text-xs h-8"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loadingTransactions && 'animate-spin')} />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No hay transacciones registradas todavía. Las órdenes procesadas aparecerán aquí.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Payment Intent ID</th>
                        <th className="py-2.5 px-4">Monto</th>
                        <th className="py-2.5 px-4">Estado</th>
                        <th className="py-2.5 px-4">Cliente / Email</th>
                        <th className="py-2.5 px-4">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 text-slate-800 font-medium">{tx.payment_intent_id}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">${Number(tx.amount).toFixed(2)} {tx.currency}</td>
                          <td className="py-2.5 px-4">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] py-0.5 px-2 font-semibold',
                                tx.status === 'succeeded'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : tx.status === 'failed'
                                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                                  : 'bg-amber-50 text-amber-700 border-amber-300'
                              )}
                            >
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 font-sans text-slate-600">
                            {tx.metadata?.customer_email || tx.metadata?.customer_name || 'Cliente App'}
                          </td>
                          <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                            {new Date(tx.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Modal (shadcn Dialog style) */}
      {showEmailTestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-xl">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  Prueba de Conexión SMTP
                </CardTitle>
                <button onClick={() => setShowEmailTestModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-mono">
                  ✕
                </button>
              </div>
              <CardDescription>
                Se enviará un correo de verificación en tiempo real al destinatario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Correo de Destino:</label>
                <Input
                  type="email"
                  required
                  value={emailTestInput}
                  onChange={(e) => setEmailTestInput(e.target.value)}
                  placeholder="ej. tu-correo@gmail.com"
                />
              </div>

              {emailTestResult && (
                <div
                  className={cn(
                    'p-3 rounded-lg border text-xs flex items-center gap-2',
                    emailTestResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      : 'bg-destructive/10 border-destructive/20 text-destructive'
                  )}
                >
                  {emailTestResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{emailTestResult.message}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-2 border-t border-border pt-3">
              <Button variant="ghost" onClick={() => setShowEmailTestModal(false)}>
                Cerrar
              </Button>
              <Button onClick={handleTestEmail} disabled={emailTesting}>
                {emailTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
                Enviar Prueba
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function UnifiedSettingsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-muted-foreground p-6 text-center">Cargando configuración...</div>}>
      <UnifiedSettingsContent />
    </Suspense>
  );
}
