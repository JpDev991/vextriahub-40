// Tipos simplificados para Processos
export interface Processo {
  id: string;
  titulo: string;
  cliente: string;
  clienteId?: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  dataInicio: string;
  proximoPrazo?: string;
  descricao?: string;
  valorCausa?: number;
  numeroProcesso?: string;
  tipoProcesso?: string;
}

export interface NovoProcessoForm {
  titulo: string;
  cliente: string;
  clienteId?: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  proximoPrazo?: string;
  descricao?: string;
  valorCausa?: number;
  numeroProcesso?: string;
  tipoProcesso?: string;
}

export interface ProcessoFilters {
  search: string;
  status: string;
}

// Dados de exemplo para novos usuários
export const processosExemplo: Processo[] = [
  {
    id: '1',
    titulo: 'Ação Trabalhista - Maria Silva',
    cliente: 'Maria Silva',
    clienteId: '1',
    status: 'Em andamento',
    dataInicio: '2024-01-15',
    proximoPrazo: '2024-02-15',
    descricao: 'Ação trabalhista por rescisão indireta contra antiga empresa.',
    valorCausa: 50000,
    numeroProcesso: '5001234-12.2024.5.02.0001',
    tipoProcesso: 'Trabalhista'
  },
  {
    id: '2',
    titulo: 'Divórcio Consensual - João Santos',
    cliente: 'João Santos',
    clienteId: '2',
    status: 'Em andamento',
    dataInicio: '2024-01-20',
    proximoPrazo: '2024-02-20',
    descricao: 'Processo de divórcio consensual com partilha de bens.',
    valorCausa: 200000,
    numeroProcesso: '1001234-12.2024.8.26.0001',
    tipoProcesso: 'Família'
  },
  {
    id: '3',
    titulo: 'Cobrança - Tech Solutions Ltda',
    cliente: 'Tech Solutions Ltda',
    clienteId: '3',
    status: 'Concluído',
    dataInicio: '2023-12-01',
    proximoPrazo: '',
    descricao: 'Ação de cobrança de serviços prestados.',
    valorCausa: 15000,
    numeroProcesso: '1001234-12.2023.8.26.0002',
    tipoProcesso: 'Cível'
  }
];

export const tiposProcesso = [
  'Trabalhista',
  'Cível',
  'Criminal',
  'Família',
  'Empresarial',
  'Tributário',
  'Previdenciário',
  'Consumidor'
];

export const statusProcesso = [
  'Em andamento',
  'Concluído', 
  'Suspenso'
] as const;