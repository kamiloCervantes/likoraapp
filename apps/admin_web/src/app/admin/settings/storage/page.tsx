'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

type ProviderType = 'LOCAL' | 'AWS_S3' | 'CLOUDFLARE_R2' | 'MINIO';

interface StorageConfigForm {
  provider: ProviderType;
  bucket_name: string;
  region: string;
  endpoint: string;
  cloudflare_account_id?: string;
  access_key_id: string;
  secret_access_key: string;
  custom_domain: string;
  is_active: boolean;
}

export default function StorageSettingsPage() {
  const [form, setForm] = useState<StorageConfigForm>({
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

  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/v1/admin/storage/config');
      if (res.ok) {
        const data = await res.json();
        let accountId = '';
        if (data.endpoint && data.endpoint.includes('.r2.cloudflarestorage.com')) {
          const match = data.endpoint.match(/https:\/\/([a-f0-9]+)\.r2\.cloudflarestorage\.com/i);
          if (match) accountId = match[1];
        }

        setForm((prev) => ({
          ...prev,
          ...data,
          cloudflare_account_id: accountId,
          secret_access_key: '', // Vacío por seguridad
        }));
      }
    } catch (e) {
      console.error('Error fetching storage config:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleProviderChange = (newProvider: ProviderType) => {
    setForm((prev) => {
      let endpoint = prev.endpoint;
      let region = prev.region || 'us-east-1';

      if (newProvider === 'CLOUDFLARE_R2') {
        region = 'auto';
        if (prev.cloudflare_account_id) {
          endpoint = `https://${prev.cloudflare_account_id}.r2.cloudflarestorage.com`;
        }
      } else if (newProvider === 'MINIO') {
        endpoint = prev.endpoint || 'http://localhost:9000';
      } else if (newProvider === 'AWS_S3') {
        endpoint = '';
        if (region === 'auto') region = 'us-east-1';
      }

      return {
        ...prev,
        provider: newProvider,
        region,
        endpoint,
      };
    });
    setTestResult(null);
    setSaveMessage(null);
  };

  const handleCloudflareAccountIdChange = (accId: string) => {
    const cleanId = accId.trim();
    setForm((prev) => ({
      ...prev,
      cloudflare_account_id: cleanId,
      endpoint: cleanId ? `https://${cleanId}.r2.cloudflarestorage.com` : '',
      region: 'auto',
    }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/storage/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ success: false, message: `Error de red al conectar: ${e.message || e}` });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/storage/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage(data.message || 'Configuración guardada y activada exitosamente en la base de datos!');
      } else {
        alert(data.message || 'Error al guardar');
      }
    } catch (e: any) {
      alert(`Error: ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 text-slate-100 min-h-screen bg-slate-950">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
            <Link href="/admin/kyc" className="hover:underline">Auditoría KYC</Link>
            <span>/</span>
            <span>Configuración de Almacenamiento</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <HardDrive className="text-indigo-400" size={28} />
            Configuración de Bucket y Almacenamiento
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Selecciona y administra el proveedor de almacenamiento para documentos KYC y fotos de Likora
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Activo en BD: {form.provider}
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
        {/* Selector de Proveedor Principal */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <Layers size={18} className="text-indigo-400" />
            Proveedor de Almacenamiento
          </label>
          <p className="text-xs text-slate-400">
            Elige el servicio donde se almacenarán las fotografías de verificación de identidad y archivos del sistema.
          </p>
          <div className="relative mt-2">
            <select
              value={form.provider}
              onChange={(e) => handleProviderChange(e.target.value as ProviderType)}
              className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-base font-semibold text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer appearance-none pr-10"
            >
              <option value="LOCAL">📁 Almacenamiento Local (Servidor / Disco Duro)</option>
              <option value="AWS_S3">☁️ Amazon Web Services (AWS S3)</option>
              <option value="CLOUDFLARE_R2">⚡ Cloudflare R2 Storage ($0 Egress Fees)</option>
              <option value="MINIO">🦹 MinIO Self-Hosted (S3 Privado en Docker)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              ▼
            </div>
          </div>
        </div>

        {/* Formulario Dinámico según el Proveedor */}
        <div className="pt-4 border-t border-slate-800 space-y-5">
          {/* CASO 1: LOCAL */}
          {form.provider === 'LOCAL' && (
            <div className="p-6 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
                  <Server size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Almacenamiento Local en Servidor</h3>
                  <p className="text-xs text-slate-400">No requiere credenciales externas ni cuentas de pago.</p>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside bg-slate-900 p-4 rounded-lg border border-slate-800/80">
                <li>Los archivos se guardan directamente en <code className="text-indigo-300 font-mono">backend/api/uploads/kyc/</code>.</li>
                <li>Visualización segura a través de los endpoints internos de la API de NestJS.</li>
                <li>Ideal para desarrollo local, pruebas y despliegues sin coste inicial.</li>
              </ul>
            </div>
          )}

          {/* CASO 2: AWS S3 */}
          {form.provider === 'AWS_S3' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <Cloud size={16} />
                Parámetros de Amazon S3
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Nombre del Bucket S3</label>
                  <input
                    type="text"
                    value={form.bucket_name}
                    onChange={(e) => setForm({ ...form, bucket_name: e.target.value })}
                    placeholder="ej: likora-kyc-documents"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Región AWS</label>
                  <input
                    type="text"
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    placeholder="us-east-1"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">AWS Access Key ID</label>
                  <input
                    type="text"
                    value={form.access_key_id}
                    onChange={(e) => setForm({ ...form, access_key_id: e.target.value })}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">AWS Secret Access Key</label>
                  <input
                    type="password"
                    value={form.secret_access_key}
                    onChange={(e) => setForm({ ...form, secret_access_key: e.target.value })}
                    placeholder="••••••••••••••••••••••••••••••••"
                    required={!form.access_key_id}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Dominio CloudFront / CDN (Opcional)</label>
                  <input
                    type="text"
                    value={form.custom_domain}
                    onChange={(e) => setForm({ ...form, custom_domain: e.target.value })}
                    placeholder="https://cdn.likora.com"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CASO 3: CLOUDFLARE R2 */}
          {form.provider === 'CLOUDFLARE_R2' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold">
                <Zap size={16} />
                Parámetros de Cloudflare R2
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Cloudflare Account ID</label>
                  <input
                    type="text"
                    value={form.cloudflare_account_id || ''}
                    onChange={(e) => handleCloudflareAccountIdChange(e.target.value)}
                    placeholder="ej: a1b2c3d4e5f6g7h8..."
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Nombre del Bucket R2</label>
                  <input
                    type="text"
                    value={form.bucket_name}
                    onChange={(e) => setForm({ ...form, bucket_name: e.target.value })}
                    placeholder="ej: likora-kyc"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Endpoint Generado Automáticamente</label>
                  <input
                    type="text"
                    value={form.endpoint}
                    readOnly
                    className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">R2 Access Key ID</label>
                  <input
                    type="text"
                    value={form.access_key_id}
                    onChange={(e) => setForm({ ...form, access_key_id: e.target.value })}
                    placeholder="Access Key generada en R2"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">R2 Secret Access Key</label>
                  <input
                    type="password"
                    value={form.secret_access_key}
                    onChange={(e) => setForm({ ...form, secret_access_key: e.target.value })}
                    placeholder="Secret Key de Cloudflare"
                    required={!form.access_key_id}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Dominio Público R2 / Custom Domain</label>
                  <input
                    type="text"
                    value={form.custom_domain}
                    onChange={(e) => setForm({ ...form, custom_domain: e.target.value })}
                    placeholder="https://pub-xxxx.r2.dev o https://cdn.likora.com"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CASO 4: MINIO */}
          {form.provider === 'MINIO' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                <Radio size={16} />
                Parámetros de MinIO Self-Hosted
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">MinIO Endpoint URL</label>
                  <input
                    type="text"
                    value={form.endpoint}
                    onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
                    placeholder="http://localhost:9000"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Nombre del Bucket</label>
                  <input
                    type="text"
                    value={form.bucket_name}
                    onChange={(e) => setForm({ ...form, bucket_name: e.target.value })}
                    placeholder="likora-kyc-documents"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Root User / Access Key</label>
                  <input
                    type="text"
                    value={form.access_key_id}
                    onChange={(e) => setForm({ ...form, access_key_id: e.target.value })}
                    placeholder="minioadmin"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Root Password / Secret Key</label>
                  <input
                    type="password"
                    value={form.secret_access_key}
                    onChange={(e) => setForm({ ...form, secret_access_key: e.target.value })}
                    placeholder="minioadmin"
                    required={!form.access_key_id}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {testResult && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
              testResult.success
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{testResult.message}</span>
          </div>
        )}

        {saveMessage && (
          <div className="p-4 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center gap-3 text-sm">
            <CheckCircle2 size={20} />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          {form.provider !== 'LOCAL' && (
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition border border-slate-700"
            >
              <RefreshCw size={16} className={testing ? 'animate-spin' : ''} />
              {testing ? 'Comprobando...' : 'Probar Conexión'}
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition"
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar y Activar Proveedor'}
          </button>
        </div>
      </form>
    </div>
  );
}
