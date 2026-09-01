import { Category, ModelPhoto, Client, ApiSettings, PackageOption, ApprovalPhoto } from '../types';

const STORAGE_KEYS = {
  CATEGORIES: 'studiophoto_categories_v2',
  MODEL_PHOTOS: 'studiophoto_model_photos_v2',
  CLIENTS: 'studiophoto_clients_v2',
  API_SETTINGS: 'studiophoto_api_settings_v2',
  PACKAGES: 'studiophoto_packages_v2',
};

// Initial Seed Data for local prototype
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-advogado-01',
    name: 'Advogado Ensaio 01',
    description: 'Ensaio fotográfico profissional para advogados, escritórios jurídicos e autoridades do direito.',
    coverUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_PACKAGES: PackageOption[] = [
  {
    id: 'pkg-1',
    name: 'Essencial',
    photoCount: 10,
    price: 350,
    description: 'Ideal para fotos rápidas de perfil profissional e redes sociais.',
  },
  {
    id: 'pkg-2',
    name: 'Profissional',
    photoCount: 20,
    price: 590,
    description: 'O mais escolhido: fotos de alta resolução, diferentes enquadramentos e edição fina.',
    featured: true,
  },
  {
    id: 'pkg-3',
    name: 'Premium Executivo',
    photoCount: 35,
    price: 890,
    description: 'Cobertura completa, múltiplos looks, retratos corporativos e entrega prioritária.',
  },
  {
    id: 'pkg-4',
    name: 'Empresarial & Equipe',
    photoCount: 50,
    price: 1350,
    description: 'Para escritórios com sócios, colaboradores e ambientação do espaço.',
  },
];

// Helper to notify other parts of the app that storage updated
export const triggerStorageUpdate = () => {
  window.dispatchEvent(new Event('app_storage_updated'));
};

export const generateUniqueToken = (prefix = 'tok'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};

// Background sync with Node.js Express server to persist data across reloads
export const syncDataWithServer = async (
  categories: Category[],
  modelPhotos: ModelPhoto[],
  clients: Client[],
  apiSettings: ApiSettings,
  packages?: PackageOption[]
) => {
  try {
    const currentPackages = packages || getPackages();
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories, modelPhotos, clients, apiSettings, packages: currentPackages }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.clients) && data.clients.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data.clients));
        triggerStorageUpdate();
      }
      if (Array.isArray(data.packages) && data.packages.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(data.packages));
        triggerStorageUpdate();
      }
    }
  } catch (err) {
    console.warn('Sync com servidor backend indisponível, usando localStorage local:', err);
  }
};

// Initial sync on app boot
export const syncDataFromServer = async () => {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
      }
      if (Array.isArray(data.modelPhotos)) {
        localStorage.setItem(STORAGE_KEYS.MODEL_PHOTOS, JSON.stringify(data.modelPhotos));
      }
      if (Array.isArray(data.clients)) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data.clients));
      }
      if (data.apiSettings) {
        localStorage.setItem(STORAGE_KEYS.API_SETTINGS, JSON.stringify(data.apiSettings));
      }
      if (Array.isArray(data.packages) && data.packages.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(data.packages));
      }
      triggerStorageUpdate();
    }
  } catch (err) {
    console.warn('Falha ao baixar dados do servidor backend:', err);
  }
};

// ---------------- CATEGORIES ----------------
export const getCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    const legacyCategoryIds = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-advogado'];
    const filtered = parsed.filter((c: Category) => !legacyCategoryIds.includes(c.id));
    if (filtered.length === 0) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return filtered;
  } catch {
    return INITIAL_CATEGORIES;
  }
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  triggerStorageUpdate();
  syncDataWithServer(categories, getModelPhotos(), getClients(), getApiSettings(), getPackages());
};

export const addCategory = (category: Omit<Category, 'id' | 'createdAt'>): Category => {
  const categories = getCategories();
  const newCat: Category = {
    ...category,
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newCat, ...categories];
  saveCategories(updated);
  return newCat;
};

export const deleteCategory = (id: string) => {
  const categories = getCategories().filter((c) => c.id !== id);
  saveCategories(categories);
  const photos = getModelPhotos().filter((p) => p.categoryId !== id);
  saveModelPhotos(photos);
};

// ---------------- MODEL PHOTOS ----------------
export const getModelPhotos = (): ModelPhoto[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MODEL_PHOTOS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const legacyCategoryIds = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-advogado'];
    return parsed.filter((p: ModelPhoto) => !legacyCategoryIds.includes(p.categoryId));
  } catch {
    return [];
  }
};

export const saveModelPhotos = (photos: ModelPhoto[]) => {
  localStorage.setItem(STORAGE_KEYS.MODEL_PHOTOS, JSON.stringify(photos));
  triggerStorageUpdate();
  syncDataWithServer(getCategories(), photos, getClients(), getApiSettings(), getPackages());
};

export const addModelPhoto = (photo: Omit<ModelPhoto, 'id' | 'createdAt'>): ModelPhoto => {
  const photos = getModelPhotos();
  const newPhoto: ModelPhoto = {
    ...photo,
    id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newPhoto, ...photos];
  saveModelPhotos(updated);
  return newPhoto;
};

export const deleteModelPhoto = (id: string) => {
  const photos = getModelPhotos().filter((p) => p.id !== id);
  saveModelPhotos(photos);
};

// ---------------- CLIENTS ----------------
export const getClients = (): Client[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const legacyClientIds = ['cli-adv-1', 'cli-1', 'cli-2', 'cli-3'];
    return parsed.filter((c: Client) => !legacyClientIds.includes(c.id));
  } catch {
    return [];
  }
};

export const saveClients = (clients: Client[]) => {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  triggerStorageUpdate();
  syncDataWithServer(getCategories(), getModelPhotos(), clients, getApiSettings(), getPackages());
};

export const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'token'>): Client => {
  const clients = getClients();
  const token = `tok-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newClient: Client = {
    ...client,
    id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    token,
    createdAt: new Date().toISOString(),
  };
  const updated = [newClient, ...clients];
  saveClients(updated);
  return newClient;
};

export const updateClient = (id: string, partial: Partial<Client>) => {
  const clients = getClients().map((c) => (c.id === id ? { ...c, ...partial } : c));
  saveClients(clients);
};

export const deleteClient = (id: string) => {
  const clients = getClients().filter((c) => c.id !== id);
  saveClients(clients);
};

// ---------------- PACKAGES ----------------
export const getPackages = (): PackageOption[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_PACKAGES));
      return INITIAL_PACKAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PACKAGES;
  }
};

export const savePackages = (packages: PackageOption[]) => {
  localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  triggerStorageUpdate();
  syncDataWithServer(getCategories(), getModelPhotos(), getClients(), getApiSettings(), packages);
};

export const getAgencyPackages = (): any[] => {
  return getPackages();
};

export const saveAgencyPackages = (packages: any[]) => {
  savePackages(packages);
};

// ---------------- API SETTINGS ----------------
export const getApiSettings = (): ApiSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_SETTINGS);
    if (!raw) return { geminiApiKey: '', keyTier: 'Gratuito' };
    return JSON.parse(raw);
  } catch {
    return { geminiApiKey: '', keyTier: 'Gratuito' };
  }
};

export const saveApiSettings = (settings: ApiSettings) => {
  localStorage.setItem(STORAGE_KEYS.API_SETTINGS, JSON.stringify(settings));
  triggerStorageUpdate();
  syncDataWithServer(getCategories(), getModelPhotos(), getClients(), settings, getPackages());
};

// ---------------- PUBLIC SELECTION API FETCHERS ----------------
export const fetchPublicSelectionData = async (token: string): Promise<{
  client: Client;
  modelPhotos: ModelPhoto[];
  packages?: PackageOption[];
} | null> => {
  try {
    const res = await fetch(`/api/public/selection/${token}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Erro ao carregar dados do servidor para seleção pública:', err);
  }

  // Fallback to local storage if offline or running in pure client
  const allClients = getClients();
  const client = allClients.find((c) => c.token === token);
  if (!client) return null;

  const allPhotos = getModelPhotos();
  const modelPhotos = allPhotos.filter((p) => client.modelPhotoIds.includes(p.id));
  const packages = getPackages();

  return { client, modelPhotos, packages };
};

export const submitPublicSelectionData = async (
  token: string,
  chosenPhotoIds: string[]
): Promise<boolean> => {
  try {
    const res = await fetch(`/api/public/selection/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chosenPhotoIds }),
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('Falha no envio da seleção para a API, salvando localmente:', err);
  }

  // Fallback local persistence
  const allClients = getClients();
  const idx = allClients.findIndex((c) => c.token === token);
  if (idx >= 0) {
    allClients[idx].chosenPhotoIds = chosenPhotoIds;
    allClients[idx].status = 'Selecionado';
    allClients[idx].selectionSubmittedAt = new Date().toISOString();
    saveClients(allClients);
    return true;
  }
  return false;
};

// ---------------- PUBLIC APPROVAL API FETCHERS (NEW) ----------------
export const fetchPublicApprovalData = async (token: string): Promise<{
  client: Client;
  approvalPhotos: ApprovalPhoto[];
} | null> => {
  try {
    const res = await fetch(`/api/public/approval/${token}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Erro ao carregar dados da API de aprovação final:', err);
  }

  // Local fallback
  const allClients = getClients();
  const client = allClients.find((c) => c.token === token);
  if (!client) return null;

  return {
    client,
    approvalPhotos: client.approvalPhotos || [],
  };
};

export const submitPublicApprovalData = async (
  token: string,
  approvalPhotos: ApprovalPhoto[],
  feedback?: string
): Promise<boolean> => {
  try {
    const res = await fetch(`/api/public/approval/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalPhotos, feedback }),
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('Falha ao enviar aprovação para API, salvando localmente:', err);
  }

  // Fallback local
  const allClients = getClients();
  const idx = allClients.findIndex((c) => c.token === token);
  if (idx >= 0) {
    allClients[idx].approvalPhotos = approvalPhotos;
    allClients[idx].approvalFeedback = feedback;
    allClients[idx].status = 'Em Edição';
    allClients[idx].approvalSubmittedAt = new Date().toISOString();
    saveClients(allClients);
    return true;
  }
  return false;
};

// ---------------- PUBLIC DELIVERY API FETCHERS ----------------
export const fetchPublicDeliveryData = async (token: string): Promise<{
  client: Client;
} | null> => {
  try {
    const res = await fetch(`/api/public/delivery/${token}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Erro ao carregar dados do servidor para entrega pública:', err);
  }

  const allClients = getClients();
  const client = allClients.find((c) => c.token === token);
  if (!client) return null;

  return { client };
};

// ---------------- PUBLIC MODELOS SHOWCASE API FETCHERS ----------------
export const fetchPublicModelosShowcase = async (): Promise<{
  categories: Category[];
  modelPhotos: ModelPhoto[];
  packages: PackageOption[];
} | null> => {
  try {
    const res = await fetch('/api/public/modelos');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Erro ao buscar modelos do servidor:', err);
  }

  return {
    categories: getCategories(),
    modelPhotos: getModelPhotos(),
    packages: getPackages(),
  };
};

export const submitPublicModelosLead = async (payload: {
  name: string;
  whatsapp: string;
  email?: string;
  referencePhotoUrl?: string;
  selectedPhotoIds: string[];
  notes?: string;
}): Promise<{ success: boolean; client?: Client; error?: string }> => {
  try {
    const res = await fetch('/api/public/submit-modelos-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.client) {
        const clients = getClients();
        const updated = [data.client, ...clients.filter((c) => c.id !== data.client.id)];
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updated));
        triggerStorageUpdate();
      }
      return { success: true, client: data.client };
    }
    return { success: false, error: data.error || 'Erro ao registrar solicitação' };
  } catch (err: any) {
    console.warn('Erro ao enviar lead público:', err);
    // Fallback local creation
    const newClient = addClient({
      name: payload.name,
      whatsapp: payload.whatsapp,
      email: payload.email,
      contractedSession: 'Outro',
      categoryId: getCategories()[0]?.id || 'cat-outro',
      modelPhotoIds: payload.selectedPhotoIds,
      chosenPhotoIds: payload.selectedPhotoIds,
      finalPhotos: [],
      referencePhotoUrl: payload.referencePhotoUrl,
      selectionNotes: payload.notes || 'Enviado através da página de Modelos de Ensaio Fotográfico',
      source: 'public_models_showcase',
      status: 'Selecionado',
      selectionSubmittedAt: new Date().toISOString(),
    });
    return { success: true, client: newClient };
  }
};

export interface ModelosLeadSubmission {
  name: string;
  whatsapp: string;
  email?: string;
  referencePhotoBase64?: string | null;
  referencePhotoUrl?: string | null;
  selectedPhotoIds: string[];
  notes?: string;
}

export const fetchPublicModelosData = fetchPublicModelosShowcase;

export const submitModelosSelection = async (payload: ModelosLeadSubmission) => {
  return submitPublicModelosLead({
    name: payload.name,
    whatsapp: payload.whatsapp,
    email: payload.email,
    referencePhotoUrl: payload.referencePhotoBase64 || payload.referencePhotoUrl || undefined,
    selectedPhotoIds: payload.selectedPhotoIds,
    notes: payload.notes,
  });
};
