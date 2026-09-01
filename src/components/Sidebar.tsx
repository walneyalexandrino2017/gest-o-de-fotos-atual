import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UploadCloud,
  CheckCircle2,
  PackageCheck,
  Sparkles,
  Settings,
  X,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { Client } from '../types';

export type NavView =
  | 'dashboard'
  | 'categories'
  | 'clients'
  | 'upload_models'
  | 'chosen_photos'
  | 'approval_photos'
  | 'final_delivery';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
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
  // Compute badges for steps
  const chosenPendingCount = clients.filter((c) => c.status === 'Selecionado').length;
  const waitingApprovalCount = clients.filter(
    (c) => c.status === 'Aguardando Aprovação Final' || c.status === 'Em Edição'
  ).length;

  const navItems = [
    {
      id: 'dashboard' as NavView,
      label: '1. Dashboard',
      subtitle: 'Visão Geral & Métricas',
      icon: LayoutDashboard,
    },
    {
      id: 'categories' as NavView,
      label: '2. Categorias & Galerias',
      subtitle: 'Estrutura dos Ensaios',
      icon: FolderKanban,
    },
    {
      id: 'clients' as NavView,
      label: '3. Clientes & Links',
      subtitle: 'Envio para Seleção',
      icon: Users,
    },
    {
      id: 'upload_models' as NavView,
      label: '4. Fotos Modelo & IA',
      subtitle: 'Upload e Prompts',
      icon: UploadCloud,
    },
    {
      id: 'chosen_photos' as NavView,
      label: '5. Fotos Escolhidas',
      subtitle: 'Seleção dos Clientes',
      icon: CheckCircle2,
      badge: chosenPendingCount > 0 ? chosenPendingCount : undefined,
    },
    {
      id: 'approval_photos' as NavView,
      label: '6. Fotos para Aprovação Final',
      subtitle: 'Prévia com Marca d\'Água',
      icon: ShieldCheck,
      badge: waitingApprovalCount > 0 ? waitingApprovalCount : undefined,
    },
    {
      id: 'final_delivery' as NavView,
      label: '7. Entrega Final',
      subtitle: 'Pacote .ZIP & Conclusão',
      icon: PackageCheck,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
                StudioPhoto
              </h2>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                Workflow Profissional
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Fluxo do Ensaio
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-900 dark:text-amber-300 font-semibold border border-amber-500/20 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs truncate tracking-tight">{item.label}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-zinc-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Quick Tools */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          {onOpenPackageSettings && (
            <button
              onClick={onOpenPackageSettings}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Gerenciar Pacotes</span>
            </button>
          )}

          {onOpenApiSettings && (
            <button
              onClick={onOpenApiSettings}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-zinc-400" />
              <span>Configurações da API</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
