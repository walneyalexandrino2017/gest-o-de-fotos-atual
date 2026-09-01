import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Camera,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Eye,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { fetchPublicApprovalData, submitPublicApprovalData } from '../../utils/storage';
import { Client, ApprovalPhoto } from '../../types';

interface PublicApprovalPageProps {
  token: string;
}

export const PublicApprovalPage: React.FC<PublicApprovalPageProps> = ({ token }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [photos, setPhotos] = useState<ApprovalPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [activeModalPhoto, setActiveModalPhoto] = useState<ApprovalPhoto | null>(null);
  const [activeNoteEditId, setActiveNoteEditId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchPublicApprovalData(token);
      if (data && data.client) {
        setClient(data.client);
        // Initialize photos with default approved = true if not already set
        const initialPhotos = (data.approvalPhotos || []).map((p) => ({
          ...p,
          approved: p.approved !== undefined ? p.approved : true,
        }));
        setPhotos(initialPhotos);
        if (data.client.approvalFeedback) {
          setGeneralFeedback(data.client.approvalFeedback);
        }
        if (data.client.status === 'Em Edição' || data.client.status === 'Entregue') {
          setSubmittedSuccess(true);
        }
      }
      setLoading(false);
    }
    load();
  }, [token]);

  const toggleApprove = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, approved: !p.approved } : p))
    );
  };

  const handleSaveNote = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, revisionNotes: tempNoteText.trim() } : p))
    );
    setActiveNoteEditId(null);
    setTempNoteText('');
  };

  const handleSubmit = async () => {
    const approvedCount = photos.filter((p) => p.approved).length;
    if (approvedCount === 0 && photos.length > 0) {
      alert('Por favor, selecione pelo menos uma foto para aprovar.');
      return;
    }

    setSubmitting(true);
    const success = await submitPublicApprovalData(token, photos, generalFeedback);
    if (success) {
      setSubmittedSuccess(true);
    } else {
      alert('Erro ao enviar sua resposta. Por favor, tente novamente ou entre em contato com o fotógrafo.');
    }
    setSubmitting(false);
  };

  const approvedPhotosCount = photos.filter((p) => p.approved).length;
  const notesCount = photos.filter((p) => p.revisionNotes && p.revisionNotes.trim().length > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 text-sm animate-pulse">Carregando fotos para aprovação...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-zinc-100 mb-2">Link não encontrado</h1>
        <p className="text-zinc-400 text-sm max-w-md">
          Este link de aprovação não é válido ou já foi expirado. Entre em contato com seu fotógrafo para obter um novo link.
        </p>
      </div>
    );
  }

  if (submittedSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400 shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3">
          Aprovação Enviada com Sucesso!
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
          Olá, <strong className="text-amber-400">{client.name}</strong>! Recebemos suas escolhas de aprovação{' '}
          {approvedPhotosCount > 0 && `(${approvedPhotosCount} fotos aprovadas)`}.
          {notesCount > 0 && ` Registramos também ${notesCount} pedido(s) de ajuste.`}
          <br /><br />
          Nosso estúdio já está realizando o fechamento e a edição final em altíssima resolução. Assim que o pacote .ZIP estiver pronto para download, você receberá a notificação!
        </p>
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Status do Ensaio: <strong className="text-amber-400">Em Edição / Finalização</strong></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-32">
      {/* Top Banner Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-zinc-100">StudioPhoto</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  Aprovação Final
                </span>
              </div>
              <p className="text-xs text-zinc-400">Cliente: <strong className="text-zinc-200">{client.name}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-700">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Fotos com Marca d'Água de Prévia</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
        {/* Intro Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl mb-8 relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              Etapa de Prévia e Aprovação
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-2">
              Confira as fotos tratadas do seu ensaio
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Abaixo estão as fotos preparadas pelo estúdio. Por favor, <strong>marque as fotos que deseja incluir no pacote final de entrega</strong>.
              Caso precise de algum ajuste ou retoque específico em alguma foto (ex: pele, cabelo, enquadramento), clique no botão de comentário da foto correspondente.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Fotos Aprovadas: <strong className="text-emerald-400">{approvedPhotosCount} de {photos.length}</strong></span>
            </div>
            {notesCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Ajustes Solicitados: <strong className="text-amber-400">{notesCount} foto(s)</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm font-medium">Nenhuma foto para aprovação disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {photos.map((photo, index) => {
              const isApproved = Boolean(photo.approved);
              const hasNotes = Boolean(photo.revisionNotes && photo.revisionNotes.trim().length > 0);

              return (
                <div
                  key={photo.id}
                  className={`group relative rounded-2xl overflow-hidden bg-zinc-900 border transition-all duration-300 flex flex-col ${
                    isApproved
                      ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'border-zinc-800 opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Photo Preview Container */}
                  <div className="relative aspect-[3/4] bg-zinc-950 overflow-hidden cursor-pointer">
                    <img
                      src={photo.previewUrl}
                      alt={photo.name}
                      onClick={() => setActiveModalPhoto(photo)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Watermark Notice Ribbon */}
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-semibold text-zinc-300 border border-zinc-800 flex items-center gap-1.5 pointer-events-none">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Marca d'Água de Prévia</span>
                    </div>

                    {/* Quick Expand Button */}
                    <button
                      type="button"
                      onClick={() => setActiveModalPhoto(photo)}
                      className="absolute bottom-3 right-3 p-2 rounded-xl bg-zinc-900/80 backdrop-blur-md text-zinc-300 hover:text-white border border-zinc-700/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Ver em tamanho ampliado"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo Details and Actions */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-zinc-900/90 border-t border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-zinc-300 truncate">
                        Foto #{index + 1}
                      </span>
                      <span className="text-[11px] text-zinc-500 truncate max-w-[140px]">
                        {photo.name}
                      </span>
                    </div>

                    {/* Revision Note Box if present */}
                    {hasNotes && (
                      <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                        <div className="flex items-center gap-1 font-semibold text-[11px] text-amber-400 mb-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>Seu pedido de ajuste:</span>
                        </div>
                        <p className="text-zinc-300 italic">"{photo.revisionNotes}"</p>
                      </div>
                    )}

                    {/* Control Buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      {/* Approve / Reject Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleApprove(photo.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isApproved
                            ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Foto Aprovada</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            <span>Desmarcada</span>
                          </>
                        )}
                      </button>

                      {/* Add/Edit Note Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveNoteEditId(photo.id);
                          setTempNoteText(photo.revisionNotes || '');
                        }}
                        className={`p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          hasNotes
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                        }`}
                        title={hasNotes ? 'Editar pedido de ajuste' : 'Solicitar ajuste nesta foto'}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* General Feedback Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl mb-12">
          <label className="block text-sm font-bold text-zinc-200 mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            Observações ou recado geral para o estúdio (opcional)
          </label>
          <textarea
            value={generalFeedback}
            onChange={(e) => setGeneralFeedback(e.target.value)}
            rows={3}
            placeholder="Ex: Gostei muito das cores! As fotos 2 e 4 estão perfeitas. Se possível, clarear um pouquinho a foto 7."
            className="w-full p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Floating Bottom Submit Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 p-4 sm:p-5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs text-zinc-400">Total de Fotos:</p>
            <p className="text-sm font-bold text-zinc-100">
              <span className="text-emerald-400">{approvedPhotosCount} fotos aprovadas</span> de {photos.length}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || photos.length === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Confirmar e Enviar Aprovação</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Note Editing Modal */}
      {activeNoteEditId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-100 mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              Solicitar Ajuste ou Retoque
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Descreva com detalhes o que você gostaria que fosse ajustado nesta foto (ex: suavizar marcas, remover fundo, ajustar luz):
            </p>
            <textarea
              value={tempNoteText}
              onChange={(e) => setTempNoteText(e.target.value)}
              rows={4}
              placeholder="Digite aqui o que você gostaria de alterar nesta foto..."
              className="w-full p-3.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveNoteEditId(null);
                  setTempNoteText('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveNote(activeNoteEditId)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md"
              >
                Salvar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Photo Preview Modal */}
      {activeModalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveModalPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={activeModalPhoto.previewUrl}
              alt={activeModalPhoto.name}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain border border-zinc-800 shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setActiveModalPhoto(null)}
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
