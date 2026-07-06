import React, { useState } from 'react';
import { Database, Link2, Info, CheckCircle, RefreshCw, Clipboard, Check, Trash2, ArrowUpRight, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { ModuleData } from '../types';
import { auth } from '../lib/firebase';
import { mergeSyncedContentIntoFirestore, resetContentToDefaults } from '../lib/content';
import { authedFetchWithRetry } from '../lib/fetchWithRetry';

interface SheetSyncProps {
  userId: string;
  googleSheetUrl: string;
  lastSyncedAt: string;
  onSyncSuccess: (modules: ModuleData[], sheetUrl: string, syncedAt: string) => void;
  onClearSync: (defaultModules: ModuleData[]) => void;
  hasSyncedContent: boolean;
}

export default function SheetSync({
  userId,
  googleSheetUrl,
  lastSyncedAt,
  onSyncSuccess,
  onClearSync,
  hasSyncedContent
}: SheetSyncProps) {
  const [url, setUrl] = useState(googleSheetUrl);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      setError(null);
      const res = await authedFetchWithRetry('/api/export-excel');
      if (!res.ok) {
        throw new Error('No se pudo generar el archivo en el servidor');
      }
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('El servidor devolvió una página HTML en lugar de Excel. Por favor, dale unos segundos al servidor para reiniciarse e inténtalo de nuevo.');
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.setAttribute('download', 'plantilla_b2_english.xlsx');
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      setError('Error al descargar el archivo Excel: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const [resetting, setResetting] = useState(false);

  const handleClearSync = async () => {
    setResetting(true);
    setError(null);
    try {
      const defaultModules = await resetContentToDefaults();
      onClearSync(defaultModules);
      setSuccess('Contenido restaurado a la base estática por defecto para todos los alumnos.');
    } catch (err: any) {
      setError(err.message || 'No se pudo restaurar el contenido por defecto');
    } finally {
      setResetting(false);
    }
  };

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError('Por favor introduce una URL válida');
      return;
    }

    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await authedFetchWithRetry('/api/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl: url }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error inesperado al sincronizar');
      }

      // Write straight into the shared Firestore content docs so every signed-in student sees the
      // update immediately, instead of caching it only in this browser's localStorage.
      const { modules, questionsAdded, theoryLinesAdded } = await mergeSyncedContentIntoFirestore(
        data.questions,
        data.theories,
        url,
        auth.currentUser?.email ?? null
      );
      const syncedAt = new Date().toISOString();
      onSyncSuccess(modules, url, syncedAt);
      setSuccess(
        `¡Sincronización exitosa! Se añadieron ${questionsAdded} preguntas nuevas` +
        (theoryLinesAdded > 0 ? ` y ${theoryLinesAdded} líneas de teoría` : '') +
        ` (ya visibles para todos los alumnos).`
      );
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor de sincronización');
    } finally {
      setSyncing(false);
    }
  };

  const templateHeaders = "module,day,type,question,option_a,option_b,option_c,option_d,correct_option,explanation";
  const templateRow1 = "1,1,practice,I _________ basketball for ten years and I still play now.,played,have played,play,had played,b,Usa Present Perfect para acciones iniciadas en el pasado que continúan hoy.";

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(`${templateHeaders}\n${templateRow1}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-4">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-600">
          <Database className="w-6 h-6" />
          <h2 className="text-xl font-bold tracking-tight font-display text-slate-900">Google Sheets Sync Engine</h2>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Amplía el banco de lecciones, prácticas y exámenes oficiales de forma ilimitada conectando tu propia hoja de cálculo en la nube.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Sync Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold font-display text-slate-900">Configurar Conexión</h3>
            
            <form onSubmit={handleSync} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">URL o ID de la Hoja de Google Sheets</label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/SpreadsheetID/edit"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-all placeholder-slate-400"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  La hoja de cálculo debe estar compartida públicamente: <strong>Archivo &gt; Compartir &gt; Publicar en la web</strong> como archivo CSV o de acceso general de lectura.
                </p>
              </div>

              {success && (
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-xl">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm text-indigo-800 font-medium">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
                  <div className="flex">
                    <span className="text-red-500">⚠️</span>
                    <div className="ml-3">
                      <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={syncing}
                  className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {syncing ? (
                    <span className="flex items-center space-x-2">
                      <RefreshCw className="animate-spin w-4 h-4" />
                      <span>Sincronizando...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5">
                      <RefreshCw className="w-4 h-4" />
                      <span>Sincronizar Ahora</span>
                    </span>
                  )}
                </button>

                {hasSyncedContent && (
                  <button
                    type="button"
                    onClick={handleClearSync}
                    disabled={resetting}
                    className="flex justify-center items-center p-3 border border-red-200 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                    title="Restaurar Banco de Preguntas Predeterminado"
                  >
                    {resetting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </form>

            {/* Sync state metadata */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado Actual</span>
                <span className="text-slate-900 font-bold mt-0.5 block font-display">
                  {hasSyncedContent ? 'Sincronizado' : 'Utilizando base estática'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Última Sync</span>
                <span className="text-slate-900 font-bold mt-0.5 block font-display">
                  {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Nunca'}
                </span>
              </div>
            </div>
          </div>

          {/* Table Schema blueprint */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold font-display text-slate-900">Estructura Requerida de Columnas (Cabeceras)</h4>
              <button
                onClick={handleCopyTemplate}
                className="text-xs text-indigo-600 hover:text-indigo-500 flex items-center space-x-1 bg-indigo-50 py-1 px-2.5 rounded-lg font-medium transition-colors focus:outline-none"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar CSV'}</span>
              </button>
            </div>
            
            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">Columna</th>
                    <th className="px-3 py-2">Tipo de Valor</th>
                    <th className="px-3 py-2">Ejemplo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold text-indigo-600">module</td>
                    <td className="px-3 py-2">Número entero (1 a 4)</td>
                    <td className="px-3 py-2">1</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold text-indigo-600">day</td>
                    <td className="px-3 py-2">Número entero (1 a 5, opcional)</td>
                    <td className="px-3 py-2">1</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold text-indigo-600">type</td>
                    <td className="px-3 py-2">'theory' | 'practice' | 'test'</td>
                    <td className="px-3 py-2">practice</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold text-indigo-600">question</td>
                    <td className="px-3 py-2">Texto de la pregunta en inglés</td>
                    <td className="px-3 py-2">I saw her two days _________.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold text-indigo-600">option_a</td>
                    <td className="px-3 py-2">Opción de respuesta A</td>
                    <td className="px-3 py-2">ago</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold text-indigo-600">option_b</td>
                    <td className="px-3 py-2">Opción de respuesta B</td>
                    <td className="px-3 py-2">since</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold text-indigo-600">correct_option</td>
                    <td className="px-3 py-2">Letra de la opción correcta (a, b, c, d)</td>
                    <td className="px-3 py-2">a</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold text-indigo-600">explanation</td>
                    <td className="px-3 py-2">Texto de explicación en español</td>
                    <td className="px-3 py-2">Usa 'ago' para referirse a...</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold text-indigo-600">theory_content</td>
                    <td className="px-3 py-2">Solo si type='theory': una línea por regla (o separadas por "|")</td>
                    <td className="px-3 py-2">Usa Present Perfect con "since"/"for"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Informative column / Tutorial */}
        <div className="space-y-6 font-sans">
          {/* Export Card */}
          <div className="bg-emerald-50/70 p-6 rounded-3xl border border-emerald-100 flex flex-col space-y-4">
            <div className="flex items-center space-x-2 text-emerald-800">
              <Database className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold font-display text-sm text-emerald-900">Exportar Banco de Preguntas</h4>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              ¿Quieres crear tu propia hoja de cálculo a partir de las preguntas actuales de la aplicación? Descarga el libro de Excel completo que incluye una solapa de instrucciones de formato y otra con las preguntas de la app listas para copiar.
            </p>
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none cursor-pointer text-center w-full"
            >
              <Download className={`w-4 h-4 mr-1.5 ${exporting ? 'animate-bounce' : ''}`} />
              {exporting ? 'Generando libro...' : 'Descargar Datos Actuales (Excel)'}
            </button>
            <div className="text-[10px] text-emerald-700 leading-relaxed bg-white/50 p-2.5 rounded-xl border border-emerald-100/50">
              <strong>Estructura del archivo descargado:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>Solapa 1 ("Instrucciones de Uso"):</strong> Guía detallada de cada columna y ejemplos para evitar fallos.</li>
                <li><strong>Solapa 2 ("Preguntas"):</strong> Listado real de las preguntas existentes de la app para que las copies a tu propio Google Sheets de trabajo.</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex flex-col space-y-4">
            <div className="flex items-center space-x-2 text-indigo-800">
              <Info className="w-5 h-5" />
              <h4 className="font-bold font-display text-sm">¿Cómo publicar tu hoja?</h4>
            </div>
            
            <ol className="list-decimal list-inside text-xs text-indigo-900 space-y-3 pl-1 leading-relaxed">
              <li>
                <strong>Crea la hoja</strong> con las columnas: <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">Module</code>, <code className="bg-white/80" style={{fontSize: '11px'}}>Day</code>, <code className="bg-white/80">Type</code>, <code className="bg-white/80">Question</code>, <code className="bg-white/80">Option_A</code>, <code style={{fontFamily:'monospace'}}>Option_B</code>, <code className="bg-white/80">Option_C</code>, <code className="bg-white/80">Option_D</code>, <code className="bg-white/80">Correct_Option</code>, <code className="bg-white/80">Explanation</code>.
              </li>
              <li>
                Ve a <strong>Archivo &gt; Compartir &gt; Publicar en la web</strong>.
              </li>
              <li>
                Selecciona <strong>Valores separados por comas (.csv)</strong> en lugar de Página web.
              </li>
              <li>
                Haz clic en <strong>Publicar</strong> y copia el enlace generado.
              </li>
              <li>
                Pega el enlace en el campo de la izquierda y haz clic en <strong>Sincronizar Ahora</strong>.
              </li>
            </ol>

            <a
              href="https://docs.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-700 font-semibold hover:text-indigo-600 flex items-center space-x-1 mt-2 focus:outline-none"
            >
              <span>Ir a Google Sheets</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
