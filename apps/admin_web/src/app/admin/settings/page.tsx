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
  const [activeTab, setActiveTab] = useState<'storage' | 'email' | 'notifications'>(
    initialTab === 'email' ? 'email' : initialTab === 'notifications' ? 'notifications' : 'storage'
  );

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
