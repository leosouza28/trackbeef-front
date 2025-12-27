import { Component, OnInit } from '@angular/core';

interface TutorialStep {
  id: number;
  titulo: string;
  descricao: string;
  icone: string;
  detalhes: string[];
  dicas?: string[];
  exemplo?: string;
}

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {

  currentStep = 0;
  
  steps: TutorialStep[] = [
    {
      id: 1,
      titulo: 'Bem-vindo ao TrackBeef',
      descricao: 'Sistema completo de gestão para frigoríficos e distribuidoras de carne',
      icone: 'bi-house-door',
      detalhes: [
        'O TrackBeef é um sistema integrado de gestão desenvolvido especificamente para o setor de carnes.',
        'Controle completo desde a entrada de mercadorias até a venda final.',
        'Gestão de estoque, financeiro, PDV e relatórios em um único lugar.'
      ],
      dicas: [
        'Navegue pelos passos usando as setas ou clicando nos indicadores',
        'Você pode retornar a este tutorial a qualquer momento pelo menu'
      ]
    },
    {
      id: 2,
      titulo: 'Entrada de Notas Fiscais',
      descricao: 'Primeiro passo: registrar a chegada de mercadorias',
      icone: 'bi-file-earmark-text',
      detalhes: [
        '1. Acesse Menu > Estoque > Entrada de Notas',
        '2. Você pode fazer upload da nota fiscal em PDF para extração automática (OCR)',
        '3. Ou preencher manualmente os dados da nota: número, data, fornecedor',
        '4. Adicione os produtos: código, descrição, quantidade de peças e pesos',
        '5. O sistema calcula automaticamente o peso médio de cada peça',
        '6. Configure as condições de pagamento: à vista ou parcelado'
      ],
      dicas: [
        'Use o OCR para acelerar o processo de entrada de notas',
        'Confira sempre os dados extraídos automaticamente',
        'Os pesos individuais são importantes para rastreabilidade'
      ],
      exemplo: 'Exemplo: Nota 12345, Fornecedor XYZ Carnes, 50 peças de Picanha com 1,5kg cada'
    },
    {
      id: 3,
      titulo: 'Gestão de Estoque',
      descricao: 'Acompanhe seu estoque em tempo real',
      icone: 'bi-box-seam',
      detalhes: [
        '1. Acesse Menu > Estoque > Listar Estoque',
        '2. Visualize todos os produtos disponíveis com suas quantidades',
        '3. Consulte o histórico de movimentações de cada produto',
        '4. Veja quando o produto entrou, por quanto e para onde foi',
        '5. Configure alertas de estoque mínimo'
      ],
      dicas: [
        'Use os filtros para encontrar produtos rapidamente',
        'Clique em um produto para ver seu histórico completo',
        'O estoque é atualizado automaticamente a cada venda'
      ]
    },
    {
      id: 4,
      titulo: 'Cadastro de Produtos',
      descricao: 'Organize seu catálogo de produtos',
      icone: 'bi-tag',
      detalhes: [
        '1. Acesse Menu > Produtos > Cadastrar',
        '2. Defina código, nome e descrição do produto',
        '3. Configure a unidade de medida (kg, unidade, etc)',
        '4. Defina preços de custo e venda',
        '5. Adicione informações nutricionais se necessário',
        '6. Vincule a categorias para facilitar a organização'
      ],
      dicas: [
        'Use códigos padronizados para facilitar a identificação',
        'Mantenha os preços sempre atualizados',
        'Produtos inativos não aparecem no PDV'
      ]
    },
    {
      id: 5,
      titulo: 'Cadastro de Pessoas',
      descricao: 'Gerencie clientes e fornecedores',
      icone: 'bi-people',
      detalhes: [
        '1. Acesse Menu > Pessoas',
        '2. Cadastre fornecedores com CNPJ, endereço e contatos',
        '3. Cadastre clientes com CPF/CNPJ para controle de vendas',
        '4. Registre informações de contato e preferências',
        '5. Configure limites de crédito para clientes'
      ],
      dicas: [
        'CPF/CNPJ válidos ajudam na emissão de notas',
        'Mantenha os contatos atualizados para comunicação',
        'Use o campo observações para informações importantes'
      ]
    },
    {
      id: 6,
      titulo: 'PDV - Ponto de Venda',
      descricao: 'Realize vendas de forma rápida e eficiente',
      icone: 'bi-cart-check',
      detalhes: [
        '1. Acesse Menu > Vendas > PDV',
        '2. Selecione o cliente ou informe CPF/CNPJ',
        '3. Adicione produtos digitando o código ou buscando',
        '4. Informe a quantidade (peças ou peso)',
        '5. O sistema calcula automaticamente o valor total',
        '6. Escolha a forma de pagamento: dinheiro, cartão, PIX, crediário',
        '7. Finalize a venda e imprima o cupom'
      ],
      dicas: [
        'Use o leitor de código de barras para agilizar',
        'Configure atalhos de teclado para produtos mais vendidos',
        'O estoque é baixado automaticamente após a venda'
      ],
      exemplo: 'Exemplo: Cliente João, 2kg de Picanha a R$ 65,00/kg = R$ 130,00'
    },
    {
      id: 7,
      titulo: 'Gestão Financeira',
      descricao: 'Controle completo do fluxo de caixa',
      icone: 'bi-cash-coin',
      detalhes: [
        '1. Acesse Menu > Financeiro',
        '2. Caixa: Gerencie aberturas e fechamentos diários',
        '3. Contas a Receber: Acompanhe vendas a prazo',
        '4. Contas a Pagar: Controle pagamentos a fornecedores',
        '5. Visualize relatórios de fluxo de caixa',
        '6. Emita cobranças e boletos para clientes'
      ],
      dicas: [
        'Sempre abra o caixa ao iniciar o dia',
        'Registre todas as movimentações em tempo real',
        'Faça o fechamento do caixa diariamente',
        'Configure lembretes para contas a vencer'
      ]
    },
    {
      id: 8,
      titulo: 'Formas de Pagamento',
      descricao: 'Configure as opções de pagamento',
      icone: 'bi-credit-card',
      detalhes: [
        '1. Acesse Menu > Configurações > Formas de Pagamento',
        '2. Configure: Dinheiro, Débito, Crédito, PIX, Crediário',
        '3. Defina taxas e descontos para cada forma',
        '4. Configure parcelas para crédito e crediário',
        '5. Integre com adquirentes (Stone, Cielo, etc)'
      ],
      dicas: [
        'Mantenha as taxas das maquininhas atualizadas',
        'Configure juros para pagamentos parcelados',
        'PIX pode ter desconto para incentivar uso'
      ]
    },
    {
      id: 9,
      titulo: 'Relatórios',
      descricao: 'Tome decisões baseadas em dados',
      icone: 'bi-graph-up',
      detalhes: [
        '1. Acesse Menu > Relatórios',
        '2. Vendas: Acompanhe performance diária, mensal e anual',
        '3. Estoque: Veja giro, produtos parados e rupturas',
        '4. Financeiro: Análise de receitas, despesas e lucro',
        '5. Clientes: Ranking dos melhores clientes',
        '6. Produtos: Itens mais vendidos e margem de lucro',
        '7. Exporte para Excel ou PDF'
      ],
      dicas: [
        'Consulte relatórios semanalmente para ajustes rápidos',
        'Use filtros de período para análises específicas',
        'Compare períodos para identificar tendências'
      ]
    },
    {
      id: 10,
      titulo: 'Usuários e Permissões',
      descricao: 'Controle de acesso ao sistema',
      icone: 'bi-shield-check',
      detalhes: [
        '1. Acesse Menu > Usuários',
        '2. Cadastre funcionários com login e senha',
        '3. Crie perfis de acesso (Admin, Caixa, Estoque, etc)',
        '4. Defina permissões específicas para cada perfil',
        '5. Acompanhe o log de ações dos usuários'
      ],
      dicas: [
        'Não compartilhe senhas entre usuários',
        'Use perfis para limitar acesso conforme função',
        'Revise permissões periodicamente',
        'Mantenha senhas fortes e seguras'
      ]
    },
    {
      id: 11,
      titulo: 'Fluxo Completo do Sistema',
      descricao: 'Entenda o ciclo operacional',
      icone: 'bi-diagram-3',
      detalhes: [
        '📥 1. ENTRADA: Receba mercadoria e registre a nota fiscal',
        '📦 2. ESTOQUE: Produtos ficam disponíveis no estoque',
        '🏷️ 3. PRECIFICAÇÃO: Configure preços de venda',
        '🛒 4. VENDA: Realize vendas pelo PDV',
        '💰 5. FINANCEIRO: Registre pagamentos e controle caixa',
        '📊 6. RELATÓRIOS: Analise resultados e tome decisões',
        '🔄 7. REPOSIÇÃO: Identifique necessidade de compra'
      ],
      exemplo: 'Ciclo: Compra → Estoque → Venda → Pagamento → Análise → Nova Compra'
    },
    {
      id: 12,
      titulo: 'Dicas de Boas Práticas',
      descricao: 'Maximize o uso do sistema',
      icone: 'bi-lightbulb',
      detalhes: [
        '✅ Faça backups regulares dos dados',
        '✅ Treine toda a equipe no uso do sistema',
        '✅ Mantenha cadastros sempre atualizados',
        '✅ Confira o fechamento de caixa diariamente',
        '✅ Revise o estoque semanalmente',
        '✅ Acompanhe contas a receber e a pagar',
        '✅ Analise relatórios para identificar oportunidades',
        '✅ Configure alertas de estoque mínimo',
        '✅ Use o sistema para todas as operações',
        '✅ Entre em contato com o suporte em caso de dúvidas'
      ],
      dicas: [
        'Um sistema só funciona bem se for usado corretamente',
        'Invista tempo no treinamento inicial',
        'Mantenha a disciplina operacional'
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(index: number): void {
    this.currentStep = index;
  }

  get currentStepData(): TutorialStep {
    return this.steps[this.currentStep];
  }

  get progressPercentage(): number {
    return ((this.currentStep + 1) / this.steps.length) * 100;
  }

}
