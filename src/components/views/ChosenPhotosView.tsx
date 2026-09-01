import React, { useState } from 'react';
import {
  CheckCircle2,
  Users,
  Copy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Image as ImageIcon,
  Clock,
  Eye,
} from 'lucide-react';
import { updateClient } from '../../utils/storage';
import { useToast } from '../Toast';
import { Client, ModelPhoto } from '../../types';
import { NavView } from '../Sidebar';

interface ChosenPhotosViewProps {
  clients: Client[];
  modelPhotos: ModelPhoto[];
  onNavigate?: (view: NavView) => void;
}

export const ChosenPhotosView: React.FC<ChosenPhotosViewProps> = ({
  clients,
  modelPhotos,
  onNavigate,
}) => {
  const { addToast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || ''
  );
  const [activePreviewPhoto, setActivePreviewPhoto] = useState<ModelPhoto | null>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const chosenPhotos = selectedClient
    ? modelPhotos.filter((p) => selectedClient.chosenPhotoIds.includes(p.id))
    : [];

  const copySelectionLink = (token: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/selecao/${token}`;
    navigator.clipboard.writeText(url);
    addToast('Link de Seleção copiado para a área de transferência!', 'success');
  };

  const openSelectionPage = (token: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/selecao/${token}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Etapa 5 • Escolhas do Cliente
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
            Fotos Escolhidas pelos Clientes
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Visualize em tempo real quais poses e fotos modelo cada cliente selecionou para o ensaio. Utilize esta lista como referência visual durante a sessão de fotos e no tratamento preliminar.
          </p>
        </div>
      </div>

      {/* Select Client & Status Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Selecione o Cliente:
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} • {c.contractedSession || 'Ensaio'} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {selectedClient && (
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => copySelectionLink(selectedClient.token)}
                className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 text-xs font-bold flex items-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition-colors shadow-2xs cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Link de Seleção</span>
              </button>

              <button
                type="button"
                onClick={() => openSelectionPage(selectedClient.token)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold flex items-center gap-2 hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-2xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Seleção</span>
              </button>
            </div>
          )}
        </div>

        {/* Selected Client Summary Card */}
        {selectedClient && (
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedClient.name}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                  {selectedClient.contractedSession || 'Ensaio'}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    selectedClient.status === 'Selecionado'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {selectedClient.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                WhatsApp: {selectedClient.whatsapp} {selectedClient.email && `• E-mail: ${selectedClient.email}`}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="text-zinc-600 dark:text-zinc-400">
                Fotos Enviadas: <strong className="text-zinc-900 dark:text-zinc-100">{selectedClient.modelPhotoIds.length}</strong>
              </div>
              <div className="text-zinc-600 dark:text-zinc-400">
                Fotos Escolhidas: <strong className="text-amber-600 dark:text-amber-400">{selectedClient.chosenPhotoIds.length}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Client Reference Photo & Notes Banner */}
        {selectedClient && (selectedClient.referencePhotoUrl || selectedClient.selectionNotes) && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start gap-4">
            {selectedClient.referencePhotoUrl && (
              <div className="shrink-0">
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">
                  Foto de Referência do Cliente:
                </p>
                <img
                  src={selectedClient.referencePhotoUrl}
                  alt="Referência"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-amber-500/30 shadow-md"
                />
              </div>
            )}
            {selectedClient.selectionNotes && (
              <div className="flex-1 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                  Observações do Cliente na Seleção:
                </p>
                <p className="italic font-normal bg-white/40 dark:bg-zinc-900/40 p-3 rounded-xl border border-amber-500/20">
                  "{selectedClient.selectionNotes}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid of Chosen Photos */}
      {selectedClient && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Fotos Modelo Escolhidas ({chosenPhotos.length})
            </h2>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('approval_photos')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Avançar para Fotos para Aprovação Final</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {chosenPhotos.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <Clock className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                O cliente ainda não confirmou a escolha das fotos
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Envie o link de seleção para o cliente via WhatsApp. Assim que ele escolher, as fotos aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {chosenPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex flex-col shadow-2xs hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[3/4] bg-zinc-950 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-white">
                      #{index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePreviewPhoto(photo)}
                      className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Ver ampliado"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {photo.name}
                    </h3>
                    {photo.promptSnippet && (
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {photo.promptSnippet}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expanded Modal */}
      {activePreviewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActivePreviewPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={activePreviewPhoto.imageUrl}
              alt={activePreviewPhoto.name}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain border border-zinc-800 shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setActivePreviewPhoto(null)}
              className="mt-4 px-6 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700"
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
