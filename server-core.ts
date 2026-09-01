import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Redis } from '@upstash/redis';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data Directory & Storage Path for local development
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initialize Upstash Redis if environment variables are present
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const redis = (redisUrl && redisToken)
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

// Initial Seed Data
const INITIAL_CATEGORIES = [
  {
    id: 'cat-advogado-01',
    name: 'Advogado Ensaio 01',
    description: 'Ensaio fotográfico profissional para advogados, escritórios jurídicos e autoridades do direito.',
    coverUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
];

interface ServerStore {
  categories: any[];
  modelPhotos: any[];
  clients: any[];
  apiSettings: any;
  packages?: any[];
}

let memoryStore: ServerStore = {
  categories: INITIAL_CATEGORIES,
  modelPhotos: [],
  clients: [],
  apiSettings: { geminiApiKey: '', keyTier: 'Gratuito' },
  packages: [],
};

// Initialize DB from disk or write initial
function initLocalDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);

      const legacyCategoryIds = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-advogado'];
      const rawCategories = Array.isArray(parsed.categories) ? parsed.categories : [];
      let cleanCategories = rawCategories.filter((c: any) => !legacyCategoryIds.includes(c.id));
      if (cleanCategories.length === 0) {
        cleanCategories = INITIAL_CATEGORIES;
      }

      const legacyPhotoIds = [
        'photo-adv-1', 'photo-adv-2', 'photo-adv-3', 'photo-adv-4', 'photo-adv-5', 'photo-adv-6', 'photo-adv-7',
        'photo-101', 'photo-102', 'photo-103', 'photo-104', 'photo-105', 'photo-106', 'photo-107', 'photo-108'
      ];
      const rawPhotos = Array.isArray(parsed.modelPhotos) ? parsed.modelPhotos : [];
      let cleanPhotos = rawPhotos.filter((p: any) => !legacyPhotoIds.includes(p.id) && !legacyCategoryIds.includes(p.categoryId));

      const legacyClientIds = ['cli-adv-1', 'cli-1', 'cli-2', 'cli-3'];
      const rawClients = Array.isArray(parsed.clients) ? parsed.clients : [];
      let cleanClients = rawClients.filter((c: any) => !legacyClientIds.includes(c.id));

      const legacyPackageIds = ['pkg-1', 'pkg-2', 'pkg-3', 'pkg-4'];
      const rawPackages = Array.isArray(parsed.packages) ? parsed.packages : [];
      const cleanPackages = rawPackages.filter((p: any) => !legacyPackageIds.includes(p.id));

      memoryStore = {
        categories: cleanCategories,
        modelPhotos: cleanPhotos,
        clients: cleanClients,
        apiSettings: parsed.apiSettings || { geminiApiKey: '', keyTier: 'Gratuito' },
        packages: cleanPackages,
      };
      persistLocalDb();
    } else {
      memoryStore = {
        categories: INITIAL_CATEGORIES,
        modelPhotos: [],
        clients: [],
        apiSettings: { geminiApiKey: '', keyTier: 'Gratuito' },
        packages: [],
      };
      persistLocalDb();
    }
  } catch (err) {
    console.error('Erro ao inicializar DB local:', err);
  }
}

function persistLocalDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch {
    // Ignora erro em ambientes serverless somente leitura
  }
}

// Persist to Upstash Redis and/or local disk
async function persistDb() {
  if (redis) {
    try {
      await redis.set('app_db', memoryStore);
    } catch (err) {
      console.error('Erro ao salvar no Redis:', err);
    }
  }
  persistLocalDb();
}

// Load from Upstash Redis or fallback to memory
async function syncFromStore() {
  if (redis) {
    try {
      const remoteData = await redis.get<ServerStore | string>('app_db');
      if (remoteData) {
        const parsedData: ServerStore = typeof remoteData === 'string' ? JSON.parse(remoteData) : remoteData;
        if (parsedData && typeof parsedData === 'object') {
          memoryStore = {
            categories: Array.isArray(parsedData.categories) ? parsedData.categories : INITIAL_CATEGORIES,
            modelPhotos: Array.isArray(parsedData.modelPhotos) ? parsedData.modelPhotos : [],
            clients: Array.isArray(parsedData.clients) ? parsedData.clients : [],
            apiSettings: parsedData.apiSettings || { geminiApiKey: '', keyTier: 'Gratuito' },
            packages: Array.isArray(parsedData.packages) ? parsedData.packages : [],
          };
          return;
        }
      }
    } catch (err) {
      console.error('Erro ao ler do Redis:', err);
    }
  }
}

initLocalDb();

const app = express();

// Increase payload limit for base64 compressed images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware to keep Redis synced in serverless environments
app.use(async (req, res, next) => {
  if (redis) {
    await syncFromStore();
  }
  next();
});

// Helper for GoogleGenAI client initialization
const getGeminiClient = (overrideApiKey?: string) => {
  const apiKey = overrideApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ----------------------------------------------------
// DATA SYNC & CRUD ENDPOINTS
// ----------------------------------------------------

// Get all data
app.get('/api/data', (req, res) => {
  res.json(memoryStore);
});

// Categories CRUD
app.get('/api/categories', (req, res) => {
  res.json(memoryStore.categories);
});

app.post('/api/categories', async (req, res) => {
  const category = req.body;
  if (!category || !category.name) {
    return res.status(400).json({ error: 'Dados da categoria inválidos' });
  }
  const idx = memoryStore.categories.findIndex((c) => c.id === category.id);
  if (idx >= 0) {
    memoryStore.categories[idx] = { ...memoryStore.categories[idx], ...category };
  } else {
    memoryStore.categories.unshift(category);
  }
  await persistDb();
  res.json(category);
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  memoryStore.categories = memoryStore.categories.filter((c) => c.id !== id);
  // Also remove photos from this category
  memoryStore.modelPhotos = memoryStore.modelPhotos.filter((p) => p.categoryId !== id);
  await persistDb();
  res.json({ success: true });
});

// Model Photos CRUD
app.get('/api/model-photos', (req, res) => {
  res.json(memoryStore.modelPhotos);
});

app.post('/api/model-photos', async (req, res) => {
  const photo = req.body;
  if (!photo || !photo.name || !photo.imageUrl) {
    return res.status(400).json({ error: 'Dados da foto modelo inválidos' });
  }
  const idx = memoryStore.modelPhotos.findIndex((p) => p.id === photo.id);
  if (idx >= 0) {
    memoryStore.modelPhotos[idx] = { ...memoryStore.modelPhotos[idx], ...photo };
  } else {
    memoryStore.modelPhotos.unshift(photo);
  }
  await persistDb();
  res.json(photo);
});

app.delete('/api/model-photos/:id', async (req, res) => {
  const { id } = req.params;
  memoryStore.modelPhotos = memoryStore.modelPhotos.filter((p) => p.id !== id);
  await persistDb();
  res.json({ success: true });
});

// Full sync from client
app.post('/api/sync', async (req, res) => {
  const { categories, modelPhotos, clients, apiSettings, packages } = req.body;
  if (Array.isArray(categories)) memoryStore.categories = categories;
  if (Array.isArray(modelPhotos)) memoryStore.modelPhotos = modelPhotos;
  if (Array.isArray(packages)) memoryStore.packages = packages;
  if (Array.isArray(clients)) {
    memoryStore.clients = clients;
  }
  if (apiSettings) memoryStore.apiSettings = apiSettings;
  await persistDb();
  res.json({ success: true, message: 'Dados sincronizados com sucesso', clients: memoryStore.clients, packages: memoryStore.packages });
});

// Clients Endpoints
app.get('/api/clients', (req, res) => {
  res.json(memoryStore.clients);
});

app.post('/api/clients', async (req, res) => {
  const clientData = req.body;
  if (!clientData || !clientData.name) {
    return res.status(400).json({ error: 'Dados do cliente inválidos' });
  }
  const index = memoryStore.clients.findIndex((c) => c.id === clientData.id);
  if (index >= 0) {
    memoryStore.clients[index] = { ...memoryStore.clients[index], ...clientData };
  } else {
    memoryStore.clients.unshift(clientData);
  }
  await persistDb();
  res.json(clientData);
});

app.delete('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  memoryStore.clients = memoryStore.clients.filter((c) => c.id !== id);
  await persistDb();
  res.json({ success: true });
});

// Public Selection Token Endpoint (Accessible by anyone with the link)
app.get('/api/public/selection/:token', (req, res) => {
  const { token } = req.params;
  const client = memoryStore.clients.find((c) => c.token === token);
  if (!client) {
    return res.status(404).json({ error: 'Cliente não encontrado para este link de seleção.' });
  }

  // Filter model photos sent to this client
  const clientModelPhotos = memoryStore.modelPhotos.filter((p) =>
    client.modelPhotoIds.includes(p.id)
  );

  res.json({
    client,
    modelPhotos: clientModelPhotos,
    packages: memoryStore.packages || [],
  });
});

// Public Selection Confirmation Submit
app.post('/api/public/selection/:token', async (req, res) => {
  const { token } = req.params;
  const { chosenPhotoIds } = req.body;

  const index = memoryStore.clients.findIndex((c) => c.token === token);
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado.' });
  }

  const client = memoryStore.clients[index];
  const updatedClient = {
    ...client,
    chosenPhotoIds: Array.isArray(chosenPhotoIds) ? chosenPhotoIds : client.chosenPhotoIds,
    status: 'Selecionado',
    selectionSubmittedAt: new Date().toISOString(),
  };

  memoryStore.clients[index] = updatedClient;
  await persistDb();

  res.json({
    success: true,
    client: updatedClient,
  });
});

// Public Delivery Token Endpoint
app.get('/api/public/delivery/:token', (req, res) => {
  const { token } = req.params;
  const client = memoryStore.clients.find((c) => c.token === token);
  if (!client) {
    return res.status(404).json({ error: 'Ensaio não encontrado para este link de entrega.' });
  }

  res.json({
    client,
  });
});

// Public Proof / Watermark Review Token Endpoint
app.get('/api/public/proof/:token', (req, res) => {
  const { token } = req.params;
  const client = memoryStore.clients.find((c) => c.token === token);
  if (!client) {
    return res.status(404).json({ error: 'Cliente não encontrado para este link de aprovação.' });
  }

  res.json({
    client,
    packages: memoryStore.packages || [],
  });
});

// Public Proof Confirmation & Feedback Submit Endpoint
app.post('/api/public/proof/:token', async (req, res) => {
  const { token } = req.params;
  const { watermarkedPhotos } = req.body;

  const index = memoryStore.clients.findIndex((c) => c.token === token);
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado.' });
  }

  const client = memoryStore.clients[index];
  const validPhotos = Array.isArray(watermarkedPhotos) ? watermarkedPhotos : client.watermarkedPhotos || [];
  const hasAdjustments = validPhotos.some((p: any) => (p.clientFeedback || '').trim().length > 0 && !p.approved);
  const proofStatus = hasAdjustments ? 'Ajustes solicitados' : 'Aprovado';

  const updatedClient = {
    ...client,
    watermarkedPhotos: validPhotos,
    proofStatus,
    proofSubmittedAt: new Date().toISOString(),
  };

  memoryStore.clients[index] = updatedClient;
  await persistDb();

  res.json({
    success: true,
    client: updatedClient,
  });
});

// Public Models Gallery / Showcase Endpoint (Modelos de Ensaio Fotográfico)
app.get('/api/public/modelos', (req, res) => {
  res.json({
    categories: memoryStore.categories,
    modelPhotos: memoryStore.modelPhotos,
    packages: memoryStore.packages || [],
  });
});

// Dedicated Packages Endpoints
app.get('/api/packages', (req, res) => {
  res.json({ packages: memoryStore.packages || [] });
});

app.put('/api/packages', async (req, res) => {
  const { packages } = req.body;
  if (Array.isArray(packages)) {
    memoryStore.packages = packages;
    await persistDb();
    return res.json({ success: true, packages: memoryStore.packages });
  }
  res.status(400).json({ error: 'Array de pacotes inválido' });
});

// Public Models Submission to Photographer ("Enviar para fotógrafo" -> Cliente "Outro")
app.post('/api/public/submit-modelos-lead', async (req, res) => {
  const { name, whatsapp, email, referencePhotoUrl, selectedPhotoIds, notes } = req.body;

  if (!name || !whatsapp) {
    return res.status(400).json({ error: 'Nome e WhatsApp são obrigatórios.' });
  }

  const validPhotoIds = Array.isArray(selectedPhotoIds) ? selectedPhotoIds : [];
  if (validPhotoIds.length === 0) {
    return res.status(400).json({ error: 'Ao menos uma foto modelo deve ser selecionada.' });
  }

  // Determine category if available from first photo
  const firstPhoto = memoryStore.modelPhotos.find((p) => validPhotoIds.includes(p.id));
  const categoryId = firstPhoto?.categoryId || memoryStore.categories[0]?.id || 'cat-outro';

  const token = `tok-outro-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newClient = {
    id: `cli-outro-${Date.now()}`,
    name: name.trim(),
    whatsapp: whatsapp.trim(),
    email: email ? email.trim() : undefined,
    contractedSession: 'Outro',
    categoryId,
    modelPhotoIds: validPhotoIds,
    chosenPhotoIds: validPhotoIds,
    finalPhotos: [],
    referencePhotoUrl: referencePhotoUrl || undefined,
    selectionNotes: notes ? notes.trim() : 'Enviado através da página de Modelos de Ensaio Fotográfico',
    source: 'public_models_showcase',
    status: 'Selecionado',
    token,
    createdAt: new Date().toISOString(),
    selectionSubmittedAt: new Date().toISOString(),
  };

  memoryStore.clients.unshift(newClient);
  await persistDb();

  res.json({
    success: true,
    message: 'Seleção enviada com sucesso para o fotógrafo!',
    client: newClient,
  });
});

// ----------------------------------------------------
// GEMINI AI PROMPT GENERATION
// ----------------------------------------------------
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { categoryName, conceptIdea, apiKey: customApiKey, keyTier } = req.body;

    if (!categoryName && !conceptIdea) {
      return res.status(400).json({ error: 'Categoria ou ideia de conceito são obrigatórias.' });
    }

    const effectiveKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!effectiveKey) {
      return res.status(400).json({
        error: 'Chave do Gemini API não configurada. Defina GEMINI_API_KEY ou informe nas configurações.',
      });
    }

    const ai = getGeminiClient(effectiveKey);
    if (!ai) {
      return res.status(500).json({ error: 'Falha ao inicializar o cliente do Gemini.' });
    }

    const model = keyTier === 'Pago' ? 'gemini-3.1-pro-preview' : 'gemini-3.7-flash';

    const systemInstruction = `Você é um fotógrafo profissional e engenheiro de prompts especialista em fotografia hiper-realista para ferramentas de IA (como Nano Banana, Midjourney v6, Flux, Stable Diffusion).
Gere um prompt em inglês detalhado, cinematográfico e profissional de fotografia para a categoria e conceito solicitados.
Inclua: estilo de iluminação (golden hour, softbox, chiaroscuro), lente da câmera (ex: Sony A7IV 85mm f/1.4, Canon 50mm), paleta de cores, enquadramento, vestimenta, expressão e atmosfera.
Retorne SOMENTE o texto do prompt pronto para copiar, sem introduções ou explicações. Termine opcionalmente com flags úteis como --ar 3:4.`;

    const promptText = `Categoria do Ensaio: ${categoryName || 'Fotografia Geral'}\nIdeia/Conceito: ${conceptIdea || 'Retrato fotográfico'}\n\nGere o prompt de fotografia perfeito em inglês:`;

    const response = await ai.models.generateContent({
      model,
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || '';
    return res.json({ prompt: text.trim() });
  } catch (err: any) {
    console.error('Erro na API de geração de prompt:', err);
    return res.status(500).json({ error: err.message || 'Erro ao gerar prompt com Gemini AI.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Admin Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const masterEmail = process.env.ADMIN_EMAIL || 'alunodosenai3@gmail.com';
  const masterPassword = process.env.ADMIN_PASSWORD || 'Tudodebom2026@#';

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (cleanEmail === masterEmail.toLowerCase() && cleanPassword === masterPassword) {
    return res.json({
      success: true,
      user: {
        email: masterEmail,
        name: 'Administrador do Estúdio',
        role: 'Fotógrafo / Diretor Criativo',
        lastLogin: new Date().toISOString(),
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
  });
});

export default app;
