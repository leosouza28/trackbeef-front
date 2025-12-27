import { Injectable } from '@angular/core';

export interface HelpField {
  nome: string;
  descricao: string;
  icone: string;
  obrigatorio: boolean;
  exemplo?: string;
}

export interface HelpContent {
  titulo: string;
  descricao: string;
  campos?: HelpField[];
  dicas?: string[];
  passos?: string[];
  atalhos?: { tecla: string; acao: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class HelpService {

  private helpDatabase: { [key: string]: HelpContent } = {
    'entrada-notas': {
      titulo: 'Entrada de Notas Fiscais',
      descricao: 'Registre a entrada de mercadorias no estoque através de notas fiscais. O sistema suporta OCR para extração automática de dados.',
      campos: [
        {
          nome: 'Upload de Nota (PDF)',
          descricao: 'Faça upload do arquivo PDF da nota fiscal. O sistema irá extrair automaticamente os dados usando OCR (Reconhecimento Óptico de Caracteres).',
          icone: 'bi bi-file-earmark-pdf',
          obrigatorio: false,
          exemplo: 'nota-12345.pdf'
        },
        {
          nome: 'Número da Nota',
          descricao: 'Número identificador da nota fiscal emitida pelo fornecedor.',
          icone: 'bi bi-hash',
          obrigatorio: true,
          exemplo: '12345'
        },
        {
          nome: 'Data de Emissão',
          descricao: 'Data em que a nota fiscal foi emitida pelo fornecedor.',
          icone: 'bi bi-calendar',
          obrigatorio: true,
          exemplo: '21/12/2025'
        },
        {
          nome: 'Fornecedor',
          descricao: 'Selecione o fornecedor que emitiu a nota fiscal. Deve estar previamente cadastrado.',
          icone: 'bi bi-building',
          obrigatorio: true,
          exemplo: 'Frigorífico ABC Ltda'
        },
        {
          nome: 'Almoxarifado',
          descricao: 'Local onde os produtos serão armazenados. Escolha o almoxarifado de destino.',
          icone: 'bi bi-box-seam',
          obrigatorio: true,
          exemplo: 'Câmara Fria 01'
        },
        {
          nome: 'Produtos',
          descricao: 'Lista de produtos da nota. Informe código, nome, quantidade de peças e pesos individuais de cada item.',
          icone: 'bi bi-boxes',
          obrigatorio: true,
          exemplo: 'Picanha - 50 peças'
        },
        {
          nome: 'Peso Individual',
          descricao: 'Peso de cada peça em quilogramas. O sistema calcula automaticamente o peso médio.',
          icone: 'bi bi-speedometer',
          obrigatorio: true,
          exemplo: '1.5 kg, 1.6 kg, 1.4 kg'
        },
        {
          nome: 'Preço de Custo',
          descricao: 'Valor unitário de custo de cada produto. Usado para cálculo de margem e lucro.',
          icone: 'bi bi-currency-dollar',
          obrigatorio: true,
          exemplo: 'R$ 35,00/kg'
        },
        {
          nome: 'Condições de Pagamento',
          descricao: 'Defina como será o pagamento: à vista ou parcelado. Configure vencimentos e valores.',
          icone: 'bi bi-credit-card',
          obrigatorio: true,
          exemplo: 'Parcelado em 3x'
        }
      ],
      dicas: [
        'Use o OCR para acelerar o processo - basta fazer upload do PDF',
        'Sempre confira os dados extraídos automaticamente',
        'Os pesos individuais são importantes para rastreabilidade',
        'Configure alertas de vencimento das cobranças',
        'Após salvar, os produtos entram automaticamente no estoque'
      ],
      passos: [
        'Faça upload do PDF da nota fiscal (opcional)',
        'Preencha ou confirme os dados da nota',
        'Adicione os produtos com seus respectivos pesos',
        'Configure as condições de pagamento',
        'Revise todos os dados',
        'Clique em "Salvar" para registrar a entrada'
      ],
      atalhos: [
        { tecla: 'Enter', acao: 'Avançar para próximo campo' },
        { tecla: 'Tab', acao: 'Navegar entre campos' },
        { tecla: 'Ctrl + S', acao: 'Salvar (quando disponível)' }
      ]
    },
    'listar-estoque': {
      titulo: 'Consulta de Estoque',
      descricao: 'Visualize e gerencie o estoque atual de produtos. Acompanhe quantidades, valores e movimentações.',
      campos: [
        {
          nome: 'Filtro de Produto',
          descricao: 'Busque produtos por código, nome ou descrição.',
          icone: 'bi bi-search',
          obrigatorio: false,
          exemplo: 'Picanha'
        },
        {
          nome: 'Almoxarifado',
          descricao: 'Filtre por almoxarifado específico para ver estoque localizado.',
          icone: 'bi bi-building',
          obrigatorio: false,
          exemplo: 'Câmara Fria 01'
        },
        {
          nome: 'Quantidade',
          descricao: 'Quantidade de peças disponíveis no estoque.',
          icone: 'bi bi-123',
          obrigatorio: false
        },
        {
          nome: 'Peso Total',
          descricao: 'Peso total do produto em estoque (kg).',
          icone: 'bi bi-speedometer',
          obrigatorio: false
        }
      ],
      dicas: [
        'Use os filtros para encontrar produtos rapidamente',
        'Clique no produto para ver histórico completo',
        'Configure alertas de estoque mínimo',
        'Estoque é atualizado em tempo real'
      ],
      passos: [
        'Use a busca para filtrar produtos',
        'Clique em um produto para ver detalhes',
        'Visualize o histórico de movimentações',
        'Acompanhe entradas e saídas'
      ]
    },
    'vendas-pdv': {
      titulo: 'PDV - Ponto de Venda',
      descricao: 'Realize vendas de forma rápida e eficiente. O PDV foi desenvolvido para agilizar o atendimento.',
      campos: [
        {
          nome: 'Cliente',
          descricao: 'Selecione ou cadastre o cliente. Pode buscar por CPF/CNPJ, nome ou telefone.',
          icone: 'bi bi-person',
          obrigatorio: true,
          exemplo: 'João Silva - 123.456.789-00'
        },
        {
          nome: 'Produto',
          descricao: 'Adicione produtos digitando o código ou buscando pelo nome. Suporta leitor de código de barras.',
          icone: 'bi bi-upc-scan',
          obrigatorio: true,
          exemplo: 'Digite código ou nome'
        },
        {
          nome: 'Quantidade/Peso',
          descricao: 'Informe a quantidade (peças) ou peso (kg) do produto a ser vendido.',
          icone: 'bi bi-calculator',
          obrigatorio: true,
          exemplo: '2 kg ou 3 unidades'
        },
        {
          nome: 'Preço Unitário',
          descricao: 'Preço por unidade ou kg. Pode ser editado para dar descontos.',
          icone: 'bi bi-currency-dollar',
          obrigatorio: true,
          exemplo: 'R$ 65,00/kg'
        },
        {
          nome: 'Forma de Pagamento',
          descricao: 'Escolha como o cliente vai pagar: Dinheiro, Cartão (Débito/Crédito), PIX ou Crediário.',
          icone: 'bi bi-credit-card',
          obrigatorio: true,
          exemplo: 'PIX'
        },
        {
          nome: 'Desconto',
          descricao: 'Aplique desconto em valor fixo (R$) ou percentual (%).',
          icone: 'bi bi-percent',
          obrigatorio: false,
          exemplo: '10% ou R$ 5,00'
        }
      ],
      dicas: [
        'Use o leitor de código de barras para agilizar',
        'Tecle Enter para adicionar produto ao carrinho',
        'Configure atalhos para produtos mais vendidos',
        'Estoque é baixado automaticamente após finalizar',
        'Sempre imprima ou envie o cupom ao cliente'
      ],
      passos: [
        'Selecione ou cadastre o cliente',
        'Adicione produtos ao carrinho',
        'Confira o valor total',
        'Escolha a forma de pagamento',
        'Finalize a venda',
        'Imprima o cupom fiscal'
      ],
      atalhos: [
        { tecla: 'F2', acao: 'Buscar cliente' },
        { tecla: 'F3', acao: 'Adicionar produto' },
        { tecla: 'F5', acao: 'Aplicar desconto' },
        { tecla: 'F9', acao: 'Finalizar venda' },
        { tecla: 'ESC', acao: 'Cancelar/Voltar' }
      ]
    },
    'produtos-form': {
      titulo: 'Cadastro de Produtos',
      descricao: 'Cadastre e edite produtos do catálogo. Configure preços, unidades de medida e informações nutricionais.',
      campos: [
        {
          nome: 'Código',
          descricao: 'Código único do produto. Pode ser código de barras, SKU ou código interno.',
          icone: 'bi bi-upc',
          obrigatorio: true,
          exemplo: '7891234567890'
        },
        {
          nome: 'Nome',
          descricao: 'Nome do produto que será exibido nas vendas e relatórios.',
          icone: 'bi bi-tag',
          obrigatorio: true,
          exemplo: 'Picanha Bovina Resfriada'
        },
        {
          nome: 'Descrição',
          descricao: 'Descrição detalhada do produto com suas características.',
          icone: 'bi bi-text-paragraph',
          obrigatorio: false,
          exemplo: 'Carne nobre, macia e saborosa'
        },
        {
          nome: 'Unidade de Medida',
          descricao: 'Como o produto é vendido: kg, unidade, bandeja, etc.',
          icone: 'bi bi-rulers',
          obrigatorio: true,
          exemplo: 'kg'
        },
        {
          nome: 'Preço de Custo',
          descricao: 'Custo de aquisição do produto. Base para cálculo de margem.',
          icone: 'bi bi-cash-coin',
          obrigatorio: true,
          exemplo: 'R$ 35,00'
        },
        {
          nome: 'Preço de Venda',
          descricao: 'Preço pelo qual o produto será vendido ao consumidor.',
          icone: 'bi bi-currency-dollar',
          obrigatorio: true,
          exemplo: 'R$ 65,00'
        },
        {
          nome: 'Categoria',
          descricao: 'Categoria do produto para organização e relatórios.',
          icone: 'bi bi-folder',
          obrigatorio: false,
          exemplo: 'Carnes Bovinas'
        },
        {
          nome: 'Estoque Mínimo',
          descricao: 'Quantidade mínima que deve ter em estoque. Sistema alerta quando atingir.',
          icone: 'bi bi-exclamation-triangle',
          obrigatorio: false,
          exemplo: '10 kg'
        },
        {
          nome: 'Status',
          descricao: 'Produto ativo ou inativo. Inativos não aparecem no PDV.',
          icone: 'bi bi-toggle-on',
          obrigatorio: true,
          exemplo: 'Ativo'
        }
      ],
      dicas: [
        'Use códigos padronizados para facilitar',
        'Mantenha preços sempre atualizados',
        'Configure alertas de estoque mínimo',
        'Produtos inativos não aparecem nas vendas',
        'A margem é calculada automaticamente'
      ],
      passos: [
        'Informe o código do produto',
        'Preencha nome e descrição',
        'Defina unidade de medida',
        'Configure preços de custo e venda',
        'Adicione categoria e estoque mínimo',
        'Salve o cadastro'
      ]
    },
    'pessoas-form': {
      titulo: 'Cadastro de Pessoas',
      descricao: 'Cadastre clientes e fornecedores. Mantenha dados atualizados para melhor controle.',
      campos: [
        {
          nome: 'Tipo',
          descricao: 'Defina se é Cliente, Fornecedor ou ambos.',
          icone: 'bi bi-person-badge',
          obrigatorio: true,
          exemplo: 'Cliente'
        },
        {
          nome: 'Tipo de Pessoa',
          descricao: 'Pessoa Física (CPF) ou Jurídica (CNPJ).',
          icone: 'bi bi-building',
          obrigatorio: true,
          exemplo: 'Física'
        },
        {
          nome: 'Nome/Razão Social',
          descricao: 'Nome completo (PF) ou razão social (PJ).',
          icone: 'bi bi-person',
          obrigatorio: true,
          exemplo: 'João Silva'
        },
        {
          nome: 'CPF/CNPJ',
          descricao: 'Documento de identificação. Importante para emissão de notas.',
          icone: 'bi bi-card-text',
          obrigatorio: true,
          exemplo: '123.456.789-00'
        },
        {
          nome: 'Telefone',
          descricao: 'Telefone para contato. Pode adicionar vários.',
          icone: 'bi bi-telephone',
          obrigatorio: true,
          exemplo: '(11) 98765-4321'
        },
        {
          nome: 'Email',
          descricao: 'Email para envio de cobranças e notas fiscais.',
          icone: 'bi bi-envelope',
          obrigatorio: false,
          exemplo: 'joao@email.com'
        },
        {
          nome: 'Endereço',
          descricao: 'Endereço completo com CEP, rua, número e complemento.',
          icone: 'bi bi-geo-alt',
          obrigatorio: false,
          exemplo: 'Rua A, 123 - Centro'
        },
        {
          nome: 'Limite de Crédito',
          descricao: 'Valor máximo de crédito para vendas a prazo (apenas clientes).',
          icone: 'bi bi-wallet2',
          obrigatorio: false,
          exemplo: 'R$ 5.000,00'
        }
      ],
      dicas: [
        'CPF/CNPJ válidos facilitam emissão de notas',
        'Mantenha contatos atualizados',
        'Configure limite de crédito para clientes',
        'Use observações para informações importantes'
      ],
      passos: [
        'Escolha o tipo de pessoa',
        'Preencha dados pessoais/empresariais',
        'Adicione contatos',
        'Informe endereço completo',
        'Configure limite de crédito (se cliente)',
        'Salve o cadastro'
      ]
    },
    'caixa-form': {
      titulo: 'Gerenciamento de Caixa',
      descricao: 'Abra, feche e gerencie movimentações do caixa diário.',
      campos: [
        {
          nome: 'Data de Abertura',
          descricao: 'Data e hora da abertura do caixa.',
          icone: 'bi bi-calendar',
          obrigatorio: true,
          exemplo: '21/12/2025 08:00'
        },
        {
          nome: 'Valor Inicial',
          descricao: 'Valor em dinheiro que está no caixa no início do dia (troco).',
          icone: 'bi bi-cash',
          obrigatorio: true,
          exemplo: 'R$ 200,00'
        },
        {
          nome: 'Responsável',
          descricao: 'Usuário responsável pela operação do caixa.',
          icone: 'bi bi-person',
          obrigatorio: true,
          exemplo: 'Maria Santos'
        },
        {
          nome: 'Observações',
          descricao: 'Anotações sobre o caixa, ocorrências ou pendências.',
          icone: 'bi bi-sticky',
          obrigatorio: false,
          exemplo: 'Troco reforçado para movimento esperado'
        }
      ],
      dicas: [
        'Sempre abra o caixa no início do dia',
        'Registre todas as movimentações em tempo real',
        'Faça o fechamento ao final do expediente',
        'Confira os valores antes de fechar'
      ],
      passos: [
        'Clique em "Abrir Caixa"',
        'Informe o valor inicial (troco)',
        'Confirme a abertura',
        'Registre todas as movimentações do dia',
        'Ao final, faça o fechamento',
        'Confira e confirme os valores'
      ]
    },
    'formas-pagamento-form': {
      titulo: 'Formas de Pagamento',
      descricao: 'Configure os métodos de pagamento aceitos e suas condições.',
      campos: [
        {
          nome: 'Nome',
          descricao: 'Nome da forma de pagamento.',
          icone: 'bi bi-credit-card',
          obrigatorio: true,
          exemplo: 'Cartão de Crédito Visa'
        },
        {
          nome: 'Tipo',
          descricao: 'Tipo: Dinheiro, Débito, Crédito, PIX, Boleto, Crediário.',
          icone: 'bi bi-list',
          obrigatorio: true,
          exemplo: 'Crédito'
        },
        {
          nome: 'Taxa',
          descricao: 'Taxa cobrada pela operadora (%). Afeta o valor líquido recebido.',
          icone: 'bi bi-percent',
          obrigatorio: false,
          exemplo: '2.5%'
        },
        {
          nome: 'Parcelas',
          descricao: 'Número máximo de parcelas permitidas.',
          icone: 'bi bi-123',
          obrigatorio: false,
          exemplo: '12x'
        },
        {
          nome: 'Dias para Recebimento',
          descricao: 'Quantos dias até o dinheiro entrar na conta.',
          icone: 'bi bi-calendar-check',
          obrigatorio: false,
          exemplo: '30 dias'
        },
        {
          nome: 'Ativa',
          descricao: 'Se a forma de pagamento está disponível para uso.',
          icone: 'bi bi-toggle-on',
          obrigatorio: true,
          exemplo: 'Sim'
        }
      ],
      dicas: [
        'Mantenha taxas atualizadas',
        'Configure corretamente os prazos',
        'Formas inativas não aparecem no PDV',
        'Use desconto para incentivar pagamentos à vista'
      ],
      passos: [
        'Preencha o nome da forma',
        'Selecione o tipo',
        'Configure taxas e parcelas',
        'Defina prazos de recebimento',
        'Ative a forma de pagamento',
        'Salve as configurações'
      ]
    },
    'relatorios': {
      titulo: 'Relatórios Gerenciais',
      descricao: 'Visualize e exporte relatórios para análise de desempenho do negócio.',
      campos: [
        {
          nome: 'Período',
          descricao: 'Selecione o intervalo de datas para o relatório.',
          icone: 'bi bi-calendar-range',
          obrigatorio: true,
          exemplo: '01/12/2025 a 31/12/2025'
        },
        {
          nome: 'Tipo de Relatório',
          descricao: 'Escolha: Vendas, Estoque, Financeiro, Clientes, Produtos.',
          icone: 'bi bi-file-bar-graph',
          obrigatorio: true,
          exemplo: 'Vendas'
        },
        {
          nome: 'Filtros',
          descricao: 'Aplique filtros específicos: produto, cliente, forma de pagamento, etc.',
          icone: 'bi bi-funnel',
          obrigatorio: false,
          exemplo: 'Apenas vendas em dinheiro'
        },
        {
          nome: 'Formato',
          descricao: 'Escolha o formato de exportação: PDF, Excel, impressão.',
          icone: 'bi bi-file-earmark',
          obrigatorio: true,
          exemplo: 'Excel'
        }
      ],
      dicas: [
        'Consulte relatórios regularmente',
        'Use filtros para análises específicas',
        'Compare períodos para identificar tendências',
        'Exporte para análises mais detalhadas'
      ],
      passos: [
        'Selecione o tipo de relatório',
        'Defina o período desejado',
        'Aplique filtros necessários',
        'Visualize os resultados',
        'Exporte se necessário'
      ]
    }
  };

  constructor() { }

  getHelp(key: string): HelpContent | null {
    return this.helpDatabase[key] || null;
  }

  getAllHelpKeys(): string[] {
    return Object.keys(this.helpDatabase);
  }
}
