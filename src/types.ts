export type KeyTier = 'Gratuito' | 'Pago';

export type ClientStatus =
  | 'Pendente'
  | 'Enviado'
  | 'Selecionado'
  | 'Aguardando Aprovação Final'
  | 'Em Edição'
  | 'Entregue'
  | 'Novo'
  | 'Aguardando seleção'
  | 'Em produção';

export interface ModelPhoto {
  id: string;
  name: string;
  categoryId: string;
  imageUrl: string;
  promptSnippet?: string;
  prompt?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  createdAt: string;
}

export interface FinalPhoto {
  id: string;
  name: string;
  dataUrl?: string;
  imageUrl?: string; // Sinônimo para dataUrl
  uploadedAt?: string;
  createdAt?: string;
  sizeBytes?: number;
}

export interface ApprovalPhoto {
  id: string;
  name: string;
  previewUrl: string; // Base64 com marca d'água
  originalDataUrl?: string; // Base64 da foto original sem marca d'água (opcional/para entrega posterior)
  uploadedAt: string;
  approved?: boolean; // Se o cliente marcou como aprovada para a entrega final
  revisionNotes?: string; // Ajustes solicitados pelo cliente para esta foto
}

export interface PackageOption {
  id: string;
  name: string;
  photoCount: number;
  price: number | string;
  description: string;
  featured?: boolean;
  badge?: string;
  isPopular?: boolean;
}

export interface AgencyPackage {
  id: string;
  name: string;
  photoCount: number;
  price: string | number;
  description: string;
  badge?: string;
  isPopular?: boolean;
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  contractedSession: string; // Categoria ou pacote contratado
  categoryId: string;
  modelPhotoIds: string[]; // IDs das fotos modelo enviadas para o cliente escolher
  chosenPhotoIds: string[]; // IDs das fotos que o cliente escolheu na etapa 1
  approvalPhotos?: ApprovalPhoto[]; // Fotos enviadas pelo fotógrafo com marca d'água para aprovação
  approvalFeedback?: string; // Observações gerais do cliente na aprovação
  approvalSubmittedAt?: string; // Data em que o cliente confirmou a aprovação
  finalPhotos: FinalPhoto[]; // Fotos finais em alta resolução prontas para download
  referencePhotoUrl?: string; // Foto de referência enviada pelo cliente (se houver)
  selectionNotes?: string; // Notas deixadas pelo cliente na seleção
  source?: 'admin' | 'public_models_showcase'; // Origem do cadastro
  token: string; // Token exclusivo para o link público
  status: ClientStatus;
  createdAt: string;
  selectionSubmittedAt?: string;
  deliverySubmittedAt?: string;
}

export interface ApiSettings {
  geminiApiKey: string;
  keyTier: KeyTier;
}

export interface StudioStats {
  totalClients: number;
  pendingSelectionCount: number;
  chosenCount: number;
  waitingApprovalCount: number;
  deliveredCount: number;
  totalCategories: number;
  totalModelPhotos: number;
}
