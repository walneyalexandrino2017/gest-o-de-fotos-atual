import React from 'react';
import {
  Users,
  CheckCircle2,
  PackageCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  Camera,
  FolderKanban,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Client, Category, ModelPhoto } from '../../types';
import { NavView } from '../Sidebar';

interface DashboardViewProps {
  clients: Client[];
  categories: Category[];
  modelPhotos: ModelPhoto[];
  onNavigate: (view: NavView, actionPayload?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  categories,
  modelPhotos,
  onNavigate,
}) => {
  // Metric counts
  const totalClients = clients.length;
  const pendingSelection = clients.filter(
    (c) => c.status === 'Pendente' || c.status === 'Enviado'
  ).length;
  const chosenCount = clients.filter((c) => c.status === 'Selecionado').length;
  const waitingApprovalCount = clients.filter(
    (c) => c.status === 'Aguardando Aprovação Final' || c.status === 'Em Edição'
  ).length;
  const deliveredCount = clients.filter((c) => c.status === 'Entregue').length;

  const stats = [
    {
      title: 'Total de Clientes',
      value: totalClients,
      subtext: 'Cadastros no estúdio',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300',
      viewTarget: 'clients' as NavView,
    },
    {
      title: 'Aguardando Escolha',
      value: pendingSelection,
      subtext: 'Link de seleção enviado',
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300',
      viewTarget: 'clients' as NavView,
    },
    {
      title: 'Fotos Escolhidas',
      value: chosenCount,
      subtext: 'Prontos para o ensaio/edição',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300',
      viewTarget: 'chosen_photos' as NavView,
    },
    {
      title: 'Aprovação de Prévia',
      value: waitingApprovalCount,
      subtext: 'Fotos c/ marca d\'água',
      icon: ShieldCheck,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60 text-purple-700 dark:text-purple-300',
      viewTarget: 'approval_photos' as NavView,
    },
    {
      title: 'Ensaios Entregues',
      value: deliveredCount,
      subtext: 'Pacote .ZIP concluído',
      icon: PackageCheck,
      color: 'from-amber-600 to-amber-700',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300',
      viewTarget: 'final_delivery' as NavView,
    },
  ];

  const recentClients = [...clients].slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-600/5 to-transparent border border-amber-500/20 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            Painel Geral do Estúdio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
            Controle Completo do Fluxo de Ensaios
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Acompanhe desde a escolha das poses modelos com inteligência artificial até a prévia com marca d'água e a entrega final dos arquivos em alta resolução.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('clients', 'new_client')}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Novo Cliente / Ensaio</span>
            </button>

            <button
              onClick={() => onNavigate('categories', 'new_category')}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FolderKanban className="w-4 h-4" />
              <span>Nova Categoria</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigate(stat.viewTarget)}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:shadow-md hover:border-amber-400/40 dark:hover:border-amber-600/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl border ${stat.bgColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                  {stat.subtext}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                <span>Ver detalhes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Workflow Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Etapas do Fluxo de Trabalho
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Fotos Modelo & Categorias */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                1. Acervo & Fotos Modelo (IA)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Organize as categorias de ensaios e crie prompts fotográficos realistas com o Gemini AI para alimentar as opções de poses.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">
                {categories.length} categorias • {modelPhotos.length} fotos
              </span>
              <button
                onClick={() => onNavigate('upload_models')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar Acervo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Prévia e Aprovação Final */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                2. Prévia & Aprovação (Marca d'Água)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Envie as fotos tratadas com marca d'água para o cliente avaliar, aprovar quais fotos deseja e solicitar retoques pontuais.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">
                {waitingApprovalCount} ensaio(s) em aprovação
              </span>
              <button
                onClick={() => onNavigate('approval_photos')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Prévias</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Entrega Final */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <PackageCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                3. Entrega em Pacote .ZIP
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Envie as fotos em alta resolução finalizadas. O cliente pode baixar individualmente ou em um arquivo .ZIP completo.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">
                {deliveredCount} ensaios entregues
              </span>
              <button
                onClick={() => onNavigate('final_delivery')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ir para Entrega</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Clients Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Clientes Recentes
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Últimos ensaios cadastrados e seu andamento no fluxo
            </p>
          </div>

          <button
            onClick={() => onNavigate('clients')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Todos ({clients.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentClients.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Users className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Nenhum cliente cadastrado ainda
            </p>
            <button
              onClick={() => onNavigate('clients', 'new_client')}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer"
            >
              Cadastrar Primeiro Cliente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Ensaio / Pacote</th>
                  <th className="pb-3">Fotos Escolhidas</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {recentClients.map((client) => {
                  const hasSelection = client.chosenPhotoIds.length > 0;
                  const hasApproval = client.approvalPhotos && client.approvalPhotos.length > 0;

                  return (
                    <tr key={client.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {client.name}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {client.whatsapp}
                        </div>
                      </td>

                      <td className="py-3.5 text-zinc-600 dark:text-zinc-400">
                        {client.contractedSession || 'Ensaio'}
                      </td>

                      <td className="py-3.5">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {client.chosenPhotoIds.length}
                        </span>
                        <span className="text-zinc-400"> / {client.modelPhotoIds.length}</span>
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            client.status === 'Entregue'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : client.status === 'Aguardando Aprovação Final' || client.status === 'Em Edição'
                              ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : client.status === 'Selecionado'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>

                      <td className="py-3.5 text-right">
                        {client.status === 'Aguardando Aprovação Final' || client.status === 'Em Edição' ? (
                          <button
                            onClick={() => onNavigate('approval_photos')}
                            className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
                          >
                            Ver Aprovação
                          </button>
                        ) : hasSelection ? (
                          <button
                            onClick={() => onNavigate('chosen_photos')}
                            className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            Ver Escolhas
                          </button>
                        ) : (
                          <button
                            onClick={() => onNavigate('clients')}
                            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
                          >
                            Gerenciar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
