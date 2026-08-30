import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavView } from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { PackageManagementModal } from './components/modals/PackageManagementModal';
import { DashboardView } from './components/views/DashboardView';
import { CategoriesGalleryView } from './components/views/CategoriesGalleryView';
import { ClientsView } from './components/views/ClientsView';
import { UploadModelPhotosView } from './components/views/UploadModelPhotosView';
import { ChosenPhotosView } from './components/views/ChosenPhotosView';
import { FinalDeliveryView } from './components/views/FinalDeliveryView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PublicSelectionPage } from './components/public/PublicSelectionPage';
import { PublicDeliveryPage } from './components/public/PublicDeliveryPage';
import { PublicModelosPage } from './components/public/PublicModelosPage';
import { getCategories, getModelPhotos, getClients, syncDataFromServer } from './utils/storage';
import { Category, ModelPhoto, Client } from './types';

export default function App() {
  // Navigation & Route states
  const [route, setRoute] = useState<{
    type: 'admin' | 'public_selection' | 'public_delivery' | 'public_modelos';
    token?: string;
  }>({
    type: 'admin',
  });

  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [openCreateClientModal, setOpenCreateClientModal] = useState(false);
  const [openCreateCategoryModal, setOpenCreateCategoryModal] = useState(false);
  const [isApiSettingsModalOpen, setIsApiSettingsModalOpen] = useState(false);
  const [isPackageManagementModalOpen, setIsPackageManagementModalOpen] = useState(false);

  // App Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [modelPhotos, setModelPhotos] = useState<ModelPhoto[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Function to reload data from storage
  const loadData = () => {
    setCategories(getCategories());
    setModelPhotos(getModelPhotos());
    setClients(getClients());
  };

  // Check URL hash / query parameters for public pages
  const parseCurrentUrl = () => {
    const hash = window.location.hash;
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);

    // 1. Hash-based routes (Best for Netlify SPA without server rewrites)
    if (hash.startsWith('#/selecao/')) {
      const token = hash.replace('#/selecao/', '').split('?')[0];
      setRoute({ type: 'public_selection', token });
      return;
    }
    if (hash.startsWith('#/entrega/')) {
      const token = hash.replace('#/entrega/', '').split('?')[0];
      setRoute({ type: 'public_delivery', token });
      return;
    }
    if (
      hash.startsWith('#/modelos') ||
      hash.startsWith('#/modelos-de-ensaio-fotografico') ||
      hash.startsWith('#/modelos-ensaio')
    ) {
      setRoute({ type: 'public_modelos' });
      return;
    }

    // 2. Query param based routes fallback
    if (urlParams.get('selecao')) {
      setRoute({ type: 'public_selection', token: urlParams.get('selecao') || '' });
      return;
    }
    if (urlParams.get('entrega')) {
      setRoute({ type: 'public_delivery', token: urlParams.get('entrega') || '' });
      return;
    }
    if (urlParams.get('modelos')) {
      setRoute({ type: 'public_modelos' });
      return;
    }

    // Default: Admin panel
    setRoute({ type: 'admin' });
  };

  useEffect(() => {
    loadData();
    parseCurrentUrl();

    // Pull latest data from server immediately on mount
    syncDataFromServer().then(() => {
      loadData();
    });

    // Listen to local storage and hash changes
    const handleStorageUpdate = () => loadData();
    const handleHashChange = () => parseCurrentUrl();

    // Auto-poll server every 3.5 seconds to catch live selections from clients
    const syncInterval = setInterval(() => {
      syncDataFromServer().then(() => {
        loadData();
      });
    }, 3500);

    // Refresh immediately when window gains focus or tab becomes visible
    const handleFocusOrVisible = () => {
      syncDataFromServer().then(() => {
        loadData();
      });
    };

    window.addEventListener('app_storage_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('app_storage_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
    };
  }, []);

  // Handle Quick navigation actions from Dashboard or views
  const handleNavigate = (view: NavView, actionPayload?: string) => {
    setCurrentView(view);
    if (actionPayload === 'new_client') {
      setOpenCreateClientModal(true);
    } else {
      setOpenCreateClientModal(false);
    }

    if (actionPayload === 'new_category') {
      setOpenCreateCategoryModal(true);
    } else {
      setOpenCreateCategoryModal(false);
    }
  };

  // If Public Selection Page
  if (route.type === 'public_selection' && route.token) {
    return <PublicSelectionPage token={route.token} />;
  }

  // If Public Final Delivery Page
  if (route.type === 'public_delivery' && route.token) {
    return <PublicDeliveryPage token={route.token} />;
  }

  // If Public Modelos Showcase Page
  if (route.type === 'public_modelos') {
    return <PublicModelosPage />;
  }

  // Titles for current active view
  const VIEW_TITLES: Record<NavView, string> = {
    dashboard: 'Visão Geral e Métricas do Estúdio',
    categories: 'Categorias e Galerias de Fotos Modelo',
    clients: 'Cadastro de Clientes e Links de Seleção',
    upload_models: 'Upload de Imagens Modelo & Prompts de IA',
    chosen_photos: 'Fotos Escolhidas pelos Clientes',
    final_delivery: 'Upload Final & Entrega em Pacote .ZIP',
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => {
            setCurrentView(v);
            setOpenCreateClientModal(false);
            setOpenCreateCategoryModal(false);
          }}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          clients={clients}
          onOpenApiSettings={() => setIsApiSettingsModalOpen(true)}
          onOpenPackageSettings={() => setIsPackageManagementModalOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Fixed Header */}
          <Header
            onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
            activeViewTitle={VIEW_TITLES[currentView]}
            onOpenApiSettings={() => setIsApiSettingsModalOpen(true)}
          />

          {/* Main View Container with mobile bottom bar clearance */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView
                clients={clients}
                categories={categories}
                modelPhotos={modelPhotos}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'categories' && (
              <CategoriesGalleryView
                categories={categories}
                modelPhotos={modelPhotos}
                onNavigate={handleNavigate}
                initialOpenCreateModal={openCreateCategoryModal}
              />
            )}

            {currentView === 'clients' && (
              <ClientsView
                clients={clients}
                categories={categories}
                modelPhotos={modelPhotos}
                onNavigate={handleNavigate}
                initialOpenCreateModal={openCreateClientModal}
              />
            )}

            {currentView === 'upload_models' && (
              <UploadModelPhotosView
                categories={categories}
                modelPhotos={modelPhotos}
              />
            )}

            {currentView === 'chosen_photos' && (
              <ChosenPhotosView
                clients={clients}
                modelPhotos={modelPhotos}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'final_delivery' && (
              <FinalDeliveryView
                clients={clients}
              />
            )}
          </main>

          {/* Mobile Bottom Navigation Bar on Smartphones */}
          <MobileBottomNav
            currentView={currentView}
            onSelectView={(v) => {
              setCurrentView(v);
              setOpenCreateClientModal(false);
              setOpenCreateCategoryModal(false);
            }}
            onOpenSidebar={() => setIsSidebarOpenMobile(true)}
            clients={clients}
          />
        </div>

        {/* Modals */}
        <ApiSettingsModal
          isOpen={isApiSettingsModalOpen}
          onClose={() => setIsApiSettingsModalOpen(false)}
        />

        <PackageManagementModal
          isOpen={isPackageManagementModalOpen}
          onClose={() => setIsPackageManagementModalOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}
