import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderHeart,
  Users,
  ImagePlus,
  HeartHandshake,
  PackageCheck,
  X,
  ExternalLink,
  Sparkles,
  Settings,
  Key,
  Tag,
} from 'lucide-react';
import { Client } from '../types';
import { getApiSettings } from '../utils/storage';

export type NavView =
  | 'dashboard'
  | 'categories'
  | 'clients'
  | 'upload_models'
  | 'chosen_photos'
  | 'final_delivery';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  clients: Client[];
  onOpenApiSettings?: () => void;
  onOpenPackageSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  clients,
  onOpenApiSettings,
  onOpenPackageSettings,
}) => {
  const [apiSettings, setApiSettings] = useState(getApiSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setApiSettings(getApiSettings());
    };
    window.addEventListener('app_storage_updated', handleUpdate);
    return () => window.removeEventListener('app_storage_updated', handleUpdate);
  }, []);

  const hasKey = Boolean(apiSettings.geminiApiKey?.trim());
  // Compute badge counts according to proper workflow steps
  const awaitingSelectionCount = clients.filter((c) => c.status === 'Aguardando seleção').length;
  const chosenPhotosCount = clients.filter((c) => c.status === 'Selecionado').length;
  const inProductionCount = clients.filter((c) => c.status === 'Em produção').length;

  const menuItems = [
    {
      id: 'dashboard' as NavView,
      label: '1. Dashboard',
      subtitle: 'Visão geral & métricas',
      icon: LayoutDashboard,
    },
    {
      id: 'categories' as NavView,
      label: '2. Categorias & Galeria',
      subtitle: 'Modelos por categoria',
      icon: FolderHeart,
    },
    {
      id: 'clients' as NavView,
      label: '3. Clientes & Ensaios',
      subtitle: 'Cadastro e links de seleção',
      icon: Users,
      badge: awaitingSelectionCount > 0 ? awaitingSelectionCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      id: 'upload_models' as NavView,
      label: '4. Upload Fotos Modelo',
      subtitle: 'Imagens & prompts de IA',
      icon: ImagePlus,
    },
    {
      id: 'chosen_photos' as NavView,
      label: '5. Fotos Escolhidas',
      subtitle: 'Seleções feitas pelos clientes',
      icon: HeartHandshake,
      badge: chosenPhotosCount > 0 ? chosenPhotosCount : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      id: 'final_delivery' as NavView,
      label: '6. Entrega Final',
      subtitle: 'Upload final & download .zip',
      icon: PackageCheck,
      badge: inProductionCount > 0 ? inProductionCount : undefined,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    },
  ];

  const handleNavClick = (viewId: NavView) => {
    onSelectView(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 md:w-72 bg-zinc-900 text-zinc-200 flex flex-col border-r border-zinc-800 transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header of Sidebar */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-base">
              SF
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight text-sm block">
                Painel do Fotógrafo
              </span>
              <span className="text-[10px] text-zinc-400 block -mt-0.5">
                Venda & Gestão de Ensaios
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg md:hidden hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
            Menu de Gestão
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white font-medium shadow-sm'
                    : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-zinc-400'
                    }`}
                  />
                  <div className="truncate">
                    <p className="text-xs font-semibold leading-tight truncate">
                      {item.label}
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isActive ? 'text-amber-100' : 'text-zinc-400'
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                      isActive
                        ? 'bg-amber-800/80 text-white border border-amber-500/50'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
            Configurações
          </div>

          {/* API Settings button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenApiSettings) onOpenApiSettings();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-zinc-300 hover:bg-zinc-800/80 hover:text-white cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Key className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold leading-tight truncate">
                  Configurações da API
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  Gemini API ({apiSettings.keyTier || 'Gratuito'})
                </p>
              </div>
            </div>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                hasKey ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Packages & Pricing button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenPackageSettings) onOpenPackageSettings();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-zinc-300 hover:bg-zinc-800/80 hover:text-white cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Tag className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold leading-tight truncate">
                  Pacotes & Valores
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  Tabela e preços dos ensaios
                </p>
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          </button>
        </nav>

        {/* Public Models Showcase Link Button */}
        <div className="px-3 pt-2">
          <a
            href="#/modelos"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all text-xs font-semibold group cursor-pointer shadow-2xs"
            title="Abrir página pública de Modelos de Ensaio Fotográfico em nova aba"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 group-hover:rotate-12 transition-transform" />
              <span className="truncate">Página de Modelos</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400/80 group-hover:text-amber-300 shrink-0" />
          </a>
        </div>

        {/* Footer info box */}
        <div className="p-3.5 border-t border-zinc-800 m-3 bg-zinc-950/60 rounded-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="font-medium text-zinc-300">Fluxo do Ensaio:</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Cliente → Categoria → Fotos Modelo → Seleção Pública → Prompt → Entrega .ZIP
          </p>
        </div>
      </aside>
    </>
  );
};
