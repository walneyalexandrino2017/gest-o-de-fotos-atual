export type ClientStatus =
  | 'Novo'
  | 'Aguardando seleção'
  | 'Selecionado'
  | 'Em produção'
  | 'Entregue';

export type KeyTier = 'Gratuito' | 'Pago';

export interface ApiSettings {
  geminiApiKey: string;
  keyTier: KeyTier;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  createdAt: string;
}

export interface ModelPhoto {
  id: string;
  categoryId: string;
  name: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

export interface FinalPhoto {
  id: string;
  name: string;
  imageUrl: string;
  prompt?: string;
  createdAt: string;
}

export interface AgencyPackage {
  id: string;
  name: string;
  photoCount: number;
  price: string;
  description: string;
  badge?: string;
  isPopular?: boolean;
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  contractedSession: string; // Ensaio contratado
  categoryId: string;
  modelPhotoIds: string[]; // Fotos modelo enviadas para o cliente
  chosenPhotoIds: string[]; // Fotos marcadas pelo cliente
  finalPhotos: FinalPhoto[]; // Fotos finais geradas e entregues
  referencePhotoUrl?: string; // Imagem de referência enviada pelo cliente (ex: página de modelos)
  source?: 'admin' | 'public_models_showcase'; // Origem do cadastro
  status: ClientStatus;
  token: string; // Token único para a página pública
  selectionNotes?: string;
  createdAt: string;
  selectionSubmittedAt?: string;
  deliveredAt?: string;
}
