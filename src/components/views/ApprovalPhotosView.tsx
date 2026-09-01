import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Trash2,
  Users,
  Eye,
  ShieldCheck,
  Lock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { compressImageFileWithWatermark } from '../../utils/imageCompressor';
import { updateClient, getClients } from '../../utils/storage';
import { useToast } from '../Toast';
import { ConfirmModal } from '../ConfirmModal';
import { Client, ApprovalPhoto } from '../../types';
import { NavView } from '../Sidebar';

interface ApprovalPhotosViewProps {
  clients: Client[];
  onNavigate?: (view: NavView) => void;
}

export const ApprovalPhotosView: React.FC<ApprovalPhotosViewProps> = ({
  clients,
  onNavigate,
}) => {
  const { addToast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || ''
  );
  const [watermarkText, setWatermarkText] = useState('PRÉVIA • APROVAÇÃO');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activePreviewPhoto, setActivePreviewPhoto] = useState<ApprovalPhoto | null>(null);

  // Delete modal state
  const [photoToDelete, setPhotoToDelete] = useState<{
    clientId: string;
    photoId: string;
  } | null>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedClient) return;

    setUploading(true);
    setUploadProgress(0);

    const newApprovalPhotos: ApprovalPhoto[] = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const file = files[i];
      try {
        const previewUrl = await compressImageFileWithWatermark(
          file,
          watermarkText.trim() || 'PRÉVIA • APROVAÇÃO'
        );

        newApprovalPhotos.push({
          id: `appr-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          previewUrl,
          uploadedAt: new Date().toISOString(),
          approved: true, // Default to true
        });

        setUploadProgress(Math.round(((i + 1) / total) * 100));
      } catch (err) {
        console.error('Erro ao processar imagem com marca d\'água:', err);
      }
    }

    const currentPhotos = selectedClient.approvalPhotos || [];
    const updatedPhotos = [...currentPhotos, ...newApprovalPhotos];

    updateClient(selectedClient.id, {
      approvalPhotos: updatedPhotos,
      status: 'Aguardando Aprovação Final',
    });

    addToast(
      `${newApprovalPhotos.length} foto(s) com marca d'água enviadas para o ensaio de ${selectedClient.name}!`,
      'success'
    );

    setUploading(false);
    setUploadProgress(0);
    // Reset file input
    e.target.value = '';
  };

  const handleDeletePhoto = () => {
    if (!photoToDelete) return;
    const client = clients.find((c) => c.id === photoToDelete.clientId);
    if (!client) return;

    const updated = (client.approvalPhotos || []).filter(
      (p) => p.id !== photoToDelete.photoId
    );

    updateClient(client.id, {
      approvalPhotos: updated,
    });

    addToast('Foto removida da lista de aprovação.', 'info');
    setPhotoToDelete(null);
  };

  const copyApprovalLink = (token: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/aprovacao-final/${token}`;
    navigator.clipboard.writeText(url);
    addToast('Link de Aprovação copiado para a área de transferência!', 'success');
  };

  const openPublicApproval = (token: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/aprovacao-final/${token}`;
    window.open(url, '_blank');
  };

  const clientApprovalPhotos = selectedClient?.approvalPhotos || [];
  const approvedCount = clientApprovalPhotos.filter((p) => p.approved).length;
  const revisionsCount = clientApprovalPhotos.filter(
    (p) => p.revisionNotes && p.revisionNotes.trim().length > 0
  ).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            Etapa 6 • Prévia com Marca d'Água
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
            Fotos para Aprovação Final
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Faça upload das fotos com tratamento preliminar. O sistema aplica automaticamente uma <strong>marca d'água de proteção</strong> sobre as fotos para que o cliente possa avaliar, aprovar quais fotos deseja e solicitar eventuais ajustes finos antes da entrega do pacote final.
          </p>
        </div>
      </div>

      {/* Select Client & Link Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Selecione o Cliente / Ensaio:
            </label>
            <div className="relative">
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
          </div>

          {selectedClient && (
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => copyApprovalLink(selectedClient.token)}
                className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 text-xs font-bold flex items-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition-colors shadow-2xs cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Link do Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => openPublicApproval(selectedClient.token)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold flex items-center gap-2 hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-2xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Página Pública</span>
              </button>
            </div>
          )}
        </div>

        {/* Status of Client Approval */}
        {selectedClient && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  selectedClient.status === 'Aguardando Aprovação Final'
                    ? 'bg-amber-500 animate-pulse'
                    : selectedClient.status === 'Em Edição' || selectedClient.status === 'Entregue'
                    ? 'bg-emerald-500'
                    : 'bg-zinc-400'
                }`}
              />
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Status Atual: <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{selectedClient.status}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">
                Fotos na Prévia: <strong className="text-zinc-900 dark:text-zinc-100">{clientApprovalPhotos.length}</strong>
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                Aprovadas: <strong className="text-emerald-600 dark:text-emerald-400">{approvedCount}</strong>
              </span>
              {revisionsCount > 0 && (
                <span className="text-zinc-600 dark:text-zinc-400">
                  Ajustes Solicitados: <strong className="text-amber-600 dark:text-amber-400">{revisionsCount}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Client Feedback Banner if present */}
        {selectedClient?.approvalFeedback && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Recado do Cliente na Aprovação:</p>
              <p className="italic font-normal">"{selectedClient.approvalFeedback}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Box with Watermark Controls */}
      {selectedClient && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Enviar Novas Fotos para Prévia
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Texto da Marca d'Água:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Ex: PRÉVIA • APROVAÇÃO"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-3xl p-8 sm:p-12 text-center transition-colors bg-zinc-50/50 dark:bg-zinc-800/30">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-inner">
                {uploading ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                {uploading
                  ? `Processando e aplicando marca d'água (${uploadProgress}%)...`
                  : 'Clique ou arraste as fotos aqui'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                Selecione as fotos do ensaio tratadas. A marca d'água será aplicada automaticamente de forma diagonal e semi-transparente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Existing Approval Photos */}
      {selectedClient && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Fotos no Painel de Aprovação ({clientApprovalPhotos.length})
            </h2>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('final_delivery')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/20 cursor-pointer"
              >
                <span>Avançar para Entrega Final</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {clientApprovalPhotos.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <ShieldCheck className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Nenhuma foto enviada para aprovação ainda
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Utilize o campo acima para fazer o upload com marca d'água.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {clientApprovalPhotos.map((photo, index) => {
                const hasNotes = Boolean(
                  photo.revisionNotes && photo.revisionNotes.trim().length > 0
                );

                return (
                  <div
                    key={photo.id}
                    className="group relative rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex flex-col"
                  >
                    <div className="relative aspect-[3/4] bg-zinc-950 overflow-hidden">
                      <img
                        src={photo.previewUrl}
                        alt={photo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setActivePreviewPhoto(photo)}
                        className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Ver ampliado"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                          <span className="text-zinc-800 dark:text-zinc-200">
                            Foto #{index + 1}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                              photo.approved
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300'
                            }`}
                          >
                            {photo.approved ? 'Aprovada' : 'Não Aprovada'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate mb-2">
                          {photo.name}
                        </p>

                        {hasNotes && (
                          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 mb-2">
                            <span className="font-bold block text-[10px] text-amber-700 dark:text-amber-400">
                              Ajuste Solicitado:
                            </span>
                            "{photo.revisionNotes}"
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoToDelete({
                              clientId: selectedClient.id,
                              photoId: photo.id,
                            })
                          }
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="Remover foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              src={activePreviewPhoto.previewUrl}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(photoToDelete)}
        title="Remover Foto de Prévia"
        message="Tem certeza que deseja remover esta foto com marca d'água da lista de aprovação do cliente?"
        confirmLabel="Sim, Remover"
        isDestructive={true}
        onConfirm={handleDeletePhoto}
        onCancel={() => setPhotoToDelete(null)}
      />
    </div>
  );
};
