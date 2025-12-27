import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

interface LancamentoProduto {
  peso: number;
  preco_custo_unitario: number;
  valor_total: number;
}

interface ProdutoLancamento {
  produto: any;
  preco_custo: number;
  lancamentos: LancamentoProduto[];
  total_peso: number;
  total_valor: number;
  rendimento_percentual?: number;
  expanded?: boolean;
}

interface Cobranca {
  numero_cobranca: string;
  data_vencimento: string;
  valor: number;
  numero_parcela: number; // Número da parcela dentro do grupo (1, 2, 3...)
  total_parcelas: number; // Total de parcelas do grupo
  grupo_id: number; // ID do grupo de cobranças
  forma_pagamento?: any; // Forma de pagamento selecionada
}

interface ProdutoOCR {
  codigo: string;
  nome: string;
  quantidade_pecas: number;
  peso_total_kg: number;
  peso_medio_kg: number;
  pesos_individuais: number[];
}

@Component({
  selector: 'app-entrada-notas',
  templateUrl: './entrada-notas.component.html',
  styleUrls: ['./entrada-notas.component.scss'],
})
export class EntradaNotasComponent implements OnInit {

  formNota: FormGroup;
  formLancamento: FormGroup;
  formCobranca: FormGroup;
  loading: boolean = false;
  loadingProdutos: boolean = false;

  almoxarifados: any[] = [];
  almoxarifadosFiltrados: any[] = [];

  fornecedores: any[] = [];
  fornecedoresFiltrados: any[] = [];
  produtos: any[] = [];
  produtosFiltrados: any[] = [];

  fornecedorSelecionado: any = null;
  almoxarifadoSelecionado: any = null;
  produtoSelecionado: ProdutoLancamento | null = null;
  produtosLancados: ProdutoLancamento[] = [];

  totalGeralPeso: number = 0;
  totalGeralValor: number = 0;

  // Rendimento
  pesoTotalProdutosRendimento: number = 0;
  percentualRendimento: number = 0;
  temDadosRendimento: boolean = false;

  buscaFornecedor: string = '';
  buscaAlmoxarifado: string = '';
  buscaProduto: string = '';
  buscaProdutoTroca: string = '';
  mostrarListaFornecedores: boolean = false;
  mostrarListaAlmoxarifados: boolean = false;
  mostrarListaProdutos: boolean = false;

  // Modais de edição
  modalCorrigirAberto: boolean = false;
  modalTrocarProdutoAberto: boolean = false;
  lancamentoEdicao: { produtoIndex: number, lancamentoIndex: number, peso: number, produto: any } | null = null;
  pesoCorrecao: number = 0;
  produtoTroca: any = null;
  produtosFiltradosTroca: any[] = [];

  // Cobranças
  cobrancas: Cobranca[] = [];
  mostrarFormCobranca: boolean = false;
  modoParcelado: boolean = false;
  cobrancaEmEdicao: number | null = null;
  recalcularDatasAposEdicao: boolean = false; // Flag para recalcular datas após edição
  proximoGrupoId: number = 1;
  grupoEditando: number | null = null;

  // Fechamento
  efetuarFechamento: boolean = false;

  // Edição
  notaId: string | null = null;
  modoEdicao: boolean = false;
  notaFechada: boolean = false;

  formasPagamento: any[] = [];

  // OCR da Nota
  imagemSelecionada: any = null;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  uploadingOcr: boolean = false;
  produtosOCR: ProdutoOCR[] = [];

  // Modal de seleção de peças
  modalListaProdutosOCRAberto: boolean = false;
  modalSelecaoPecasAberto: boolean = false;
  produtoOCRSelecionado: ProdutoOCR | null = null;
  pecasSelecionadas: boolean[] = [];

  @ViewChild('modalCobranca') modalCobranca: any;
  @ViewChild('modalEditarGrupoCobranca') modalEditarGrupoCobranca: any;
  @ViewChild('modalOcr') modalOcr: any;

  constructor(
    private fb: FormBuilder,
    private endpointService: EndpointsService,
    private alert: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.formNota = this.fb.group({
      _id: this.fb.control(''),
      data_nota: this.fb.control(dayjs().format("YYYY-MM-DD"), [Validators.required]),
      fornecedor: this.fb.control('', [Validators.required]),
      almoxarifado: this.fb.control('', [Validators.required]),
      qtd_animais: this.fb.control(''),
      peso_animais: this.fb.control(''),
      valor_pago_animais: this.fb.control(''),
      numero_nota: this.fb.control('', [Validators.required]),
      valor_frete: this.fb.control(0)
    });

    this.formLancamento = this.fb.group({
      produto_id: this.fb.control(''),
      preco_custo: this.fb.control(0, [Validators.required, Validators.min(0.01)]),
      peso: this.fb.control('')
    });

    this.formCobranca = this.fb.group({
      numero_cobranca: this.fb.control('', [Validators.required]),
      data_vencimento: this.fb.control('', [Validators.required]),
      valor: this.fb.control(0, [Validators.required, Validators.min(0.01)]),
      forma_pagamento_id: this.fb.control('', [Validators.required]),
      // Campos para parcelamento
      numero_parcelas: this.fb.control(1, [Validators.min(1), Validators.max(120)]),
      intervalo_dias: this.fb.control(30, [Validators.min(1)])
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.notaId = params['id'];
        this.modoEdicao = true;
        this.carregarNota(params['id']);
      } else {
        this.init();
      }
    });

    // Carregar dados OCR do localStorage
    this.carregarProdutosOCR();

    // Observar mudanças nos campos de animais para recalcular rendimento
    this.formNota.get('qtd_animais')?.valueChanges.subscribe(() => {
      this.calcularRendimento();
    });
    this.formNota.get('peso_animais')?.valueChanges.subscribe(() => {
      this.calcularRendimento();
    });
    this.formNota.get('valor_pago_animais')?.valueChanges.subscribe(() => {
      this.calcularRendimento();
    });
  }


  async init() {
    this.loadingProdutos = true;
    try {
      const [fornecedoresData, produtosData, almoxarifadosData, formasPagamentoData]: any = await Promise.all([
        this.endpointService.getFornecedoresNoAuth(),
        this.endpointService.getProdutosNoAuth(),
        this.endpointService.getAlmoxarifadosNoAuth(),
        this.endpointService.getFormasPagamentoNoAuth('CONTAS A PAGAR')
      ]);

      this.fornecedores = fornecedoresData.lista || fornecedoresData;
      this.almoxarifados = almoxarifadosData.lista || almoxarifadosData;
      this.produtos = (produtosData.lista || produtosData).filter((p: any) => p.status === 'ATIVO');
      this.fornecedoresFiltrados = this.fornecedores;
      this.almoxarifadosFiltrados = this.almoxarifados;
      this.produtosFiltrados = this.produtos;
      console.log(formasPagamentoData.lista);
      this.formasPagamento = formasPagamentoData.lista;
    } catch (error: any) {
      this.alert.showDanger(error);
    }
    this.loadingProdutos = false;
  }

  async carregarNota(id: string) {
    this.loading = true;
    try {
      // Carregar dados básicos primeiro
      await this.init();

      // Carregar nota
      const nota: any = await this.endpointService.getEntradaNotaById(id);

      // Verificar se está fechada
      if (nota.efetuar_fechamento) {
        this.notaFechada = true;
        this.alert.showWarning('Esta nota já foi fechada e não pode ser editada. Você será redirecionado para a listagem.');
        setTimeout(() => {
          this.router.navigate(['/admin/notas-entradas']);
        }, 3000);
        return;
      }

      // Preencher formulário
      this.formNota.patchValue({
        _id: nota._id,
        data_nota: nota?.data_nota ? nota.data_nota.split("T")[0] : '',
        fornecedor: nota.fornecedor._id,
        almoxarifado: nota.almoxarifado?._id || '',
        qtd_animais: nota.qtd_animais || '',
        peso_animais: nota.peso_animais || '',
        valor_pago_animais: nota.valor_pago_animais || '',
        numero_nota: nota.numero_nota,
        valor_frete: nota.valor_frete || 0
      });

      // Definir fornecedor e almoxarifado selecionados
      this.fornecedorSelecionado = nota.fornecedor;
      this.almoxarifadoSelecionado = nota.almoxarifado || null;

      // Carregar produtos e lançamentos
      this.produtosLancados = nota.produtos.map((prod: any) => {
        const produtoCompleto = this.produtos.find(p => p._id === prod.produto_id);
        return {
          produto: produtoCompleto || { _id: prod.produto_id, nome: prod.produto_nome },
          preco_custo: prod.preco_custo,
          lancamentos: prod.lancamentos || [],
          total_peso: prod.total_peso || 0,
          total_valor: prod.total_valor || 0
        };
      });

      // Carregar cobranças e atualizar controle de grupos
      this.cobrancas = nota.cobrancas || [];

      // Atualizar proximoGrupoId baseado nas cobranças existentes
      if (this.cobrancas.length > 0) {
        const maxGrupoId = Math.max(...this.cobrancas.map(c => c.grupo_id || 0));
        this.proximoGrupoId = maxGrupoId + 1;
      }

      // Carregar flag de fechamento
      this.efetuarFechamento = nota.efetuar_fechamento || false;

      // Calcular totais
      this.calcularTotais();

      this.alert.showSuccess('Nota carregada com sucesso!');
    } catch (error: any) {
      this.alert.showDanger(error);
      this.router.navigate(['/admin/notas-entradas']);
    }
    this.loading = false;
  }

  buscarFornecedor() {
    const termo = this.buscaFornecedor.toLowerCase();
    this.fornecedoresFiltrados = this.fornecedores.filter(f =>
      f.nome?.toLowerCase().includes(termo) ||
      f.documento?.includes(termo)
    );
  }

  buscarAlmoxarifado() {
    const termo = this.buscaAlmoxarifado.toLowerCase();
    this.almoxarifadosFiltrados = this.almoxarifados.filter(a =>
      a.nome?.toLowerCase().includes(termo)
    );
  }

  buscarProduto() {
    const termo = this.buscaProduto.toLowerCase();
    this.produtosFiltrados = this.produtos.filter(p =>
      p.nome?.toLowerCase().includes(termo) ||
      p.sku?.toLowerCase().includes(termo)
    );
  }

  selecionarFornecedor(fornecedor: any) {
    this.fornecedorSelecionado = fornecedor;
    this.formNota.patchValue({ fornecedor: fornecedor._id });
    this.mostrarListaFornecedores = false;
    this.buscaFornecedor = '';
    this.fornecedoresFiltrados = this.fornecedores;
  }

  selecionarAlmoxarifado(almoxarifado: any) {
    this.almoxarifadoSelecionado = almoxarifado;
    this.formNota.patchValue({ almoxarifado: almoxarifado._id });
    this.mostrarListaAlmoxarifados = false;
    this.buscaAlmoxarifado = '';
    this.almoxarifadosFiltrados = this.almoxarifados;
  }

  abrirListaFornecedores() {
    this.mostrarListaFornecedores = true;
    setTimeout(() => {
      document.getElementById('busca-fornecedor')?.focus();
    }, 100);
  }

  abrirListaAlmoxarifados() {
    this.mostrarListaAlmoxarifados = true;
    setTimeout(() => {
      document.getElementById('busca-almoxarifado')?.focus();
    }, 100);
  }

  abrirListaProdutos() {
    this.mostrarListaProdutos = true;
    setTimeout(() => {
      document.getElementById('busca-produto')?.focus();
    }, 100);
  }

  selecionarProduto(produto: any) {
    // Verificar se já existe um lançamento para este produto
    const lancamentoExistente = this.produtosLancados.find(p => p.produto._id === produto._id);

    if (lancamentoExistente) {
      this.produtoSelecionado = lancamentoExistente;
    } else {
      this.produtoSelecionado = {
        produto: produto,
        preco_custo: produto.preco_custo || 0,
        lancamentos: [],
        total_peso: 0,
        total_valor: 0
      };
    }

    this.formLancamento.patchValue({
      preco_custo: this.produtoSelecionado.preco_custo
    });

    this.mostrarListaProdutos = false;
    this.buscaProduto = '';
    this.produtosFiltrados = this.produtos;

    // Focar no campo de peso
    setTimeout(() => {
      document.getElementById('peso')?.focus();
    }, 100);
  }

  limparProdutoSelecionado() {
    this.produtoSelecionado = null;
    this.formLancamento.reset({
      produto_id: '',
      preco_custo: 0,
      peso: ''
    });
  }

  adicionarLancamento(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!this.produtoSelecionado) {
      this.alert.showWarning('Selecione um produto primeiro');
      return;
    }

    const pesoValue = this.formLancamento.get('peso')?.value;
    const peso = parseFloat(pesoValue);

    if (!pesoValue || isNaN(peso) || peso <= 0) {
      this.alert.showWarning('Informe um peso válido');
      return;
    }

    const preco_custo = parseFloat(this.formLancamento.get('preco_custo')?.value) || this.produtoSelecionado.preco_custo;
    const valor_total = peso * preco_custo;

    const lancamento: LancamentoProduto = {
      peso: peso,
      preco_custo_unitario: preco_custo,
      valor_total: valor_total
    };

    // Atualizar o preço de custo do produto selecionado com o valor do formulário
    this.produtoSelecionado.preco_custo = preco_custo;

    this.produtoSelecionado.lancamentos.push(lancamento);
    this.produtoSelecionado.total_peso = this.produtoSelecionado.lancamentos.reduce((sum, l) => sum + l.peso, 0);
    this.produtoSelecionado.total_valor = this.produtoSelecionado.lancamentos.reduce((sum, l) => sum + l.valor_total, 0);

    // Adicionar ou atualizar na lista de produtos lançados
    const index = this.produtosLancados.findIndex(p => p.produto._id === this.produtoSelecionado!.produto._id);
    if (index === -1) {
      this.produtosLancados.push(this.produtoSelecionado);
    }

    // Limpar campo de peso e focar novamente
    this.formLancamento.patchValue({ peso: '' });
    this.calcularTotais();

    // Focar no campo de peso para próximo lançamento
    setTimeout(() => {
      const pesoMobile = document.getElementById('peso-mobile');
      const pesoDesktop = document.getElementById('peso');
      if (pesoMobile && window.innerWidth < 768) {
        pesoMobile.focus();
      } else if (pesoDesktop) {
        pesoDesktop.focus();
      }
    }, 50);
  }

  removerLancamento(produtoIndex: number, lancamentoIndex: number) {
    const produto = this.produtosLancados[produtoIndex];
    produto.lancamentos.splice(lancamentoIndex, 1);

    produto.total_peso = produto.lancamentos.reduce((sum, l) => sum + l.peso, 0);
    produto.total_valor = produto.lancamentos.reduce((sum, l) => sum + l.valor_total, 0);

    // Se não houver mais lançamentos, remover o produto da lista
    if (produto.lancamentos.length === 0) {
      this.produtosLancados.splice(produtoIndex, 1);

      // Se era o produto selecionado, limpar
      if (this.produtoSelecionado?.produto._id === produto.produto._id) {
        this.produtoSelecionado = null;
        this.formLancamento.patchValue({ produto_id: '', preco_custo: 0 });
      }
    }

    this.calcularTotais();
  }

  abrirModalCorrigir(produtoIndex: number, lancamentoIndex: number) {
    const produto = this.produtosLancados[produtoIndex];
    const lancamento = produto.lancamentos[lancamentoIndex];

    this.lancamentoEdicao = {
      produtoIndex,
      lancamentoIndex,
      peso: lancamento.peso,
      produto: produto.produto
    };

    this.pesoCorrecao = lancamento.peso;
    this.modalCorrigirAberto = true;

    setTimeout(() => {
      document.getElementById('peso-correcao')?.focus();
    }, 100);
  }

  salvarCorrecao() {
    if (!this.lancamentoEdicao || this.pesoCorrecao <= 0) {
      this.alert.showWarning('Informe um peso válido');
      return;
    }

    const produto = this.produtosLancados[this.lancamentoEdicao.produtoIndex];
    const lancamento = produto.lancamentos[this.lancamentoEdicao.lancamentoIndex];

    lancamento.peso = this.pesoCorrecao;
    lancamento.valor_total = this.pesoCorrecao * lancamento.preco_custo_unitario;

    produto.total_peso = produto.lancamentos.reduce((sum, l) => sum + l.peso, 0);
    produto.total_valor = produto.lancamentos.reduce((sum, l) => sum + l.valor_total, 0);

    this.calcularTotais();
    this.fecharModalCorrigir();
    this.alert.showSuccess('Lançamento corrigido com sucesso!');
  }

  fecharModalCorrigir() {
    this.modalCorrigirAberto = false;
    this.lancamentoEdicao = null;
    this.pesoCorrecao = 0;
  }

  abrirModalTrocarProduto(produtoIndex: number, lancamentoIndex: number) {
    const produto = this.produtosLancados[produtoIndex];
    const lancamento = produto.lancamentos[lancamentoIndex];

    this.lancamentoEdicao = {
      produtoIndex,
      lancamentoIndex,
      peso: lancamento.peso,
      produto: produto.produto
    };

    this.produtoTroca = null;
    this.buscaProdutoTroca = '';
    this.produtosFiltradosTroca = this.produtos;
    this.modalTrocarProdutoAberto = true;

    setTimeout(() => {
      document.getElementById('busca-produto-troca')?.focus();
    }, 100);
  }

  buscarProdutoTroca() {
    const termo = this.buscaProdutoTroca.toLowerCase();
    this.produtosFiltradosTroca = this.produtos.filter(p =>
      p.nome?.toLowerCase().includes(termo) ||
      p.sku?.toLowerCase().includes(termo)
    );
  }

  selecionarProdutoTroca(produto: any) {
    this.produtoTroca = produto;
  }

  salvarTrocaProduto() {
    if (!this.lancamentoEdicao || !this.produtoTroca) {
      this.alert.showWarning('Selecione um produto');
      return;
    }

    const produtoAntigo = this.produtosLancados[this.lancamentoEdicao.produtoIndex];
    const lancamento = produtoAntigo.lancamentos[this.lancamentoEdicao.lancamentoIndex];

    // Remover lançamento do produto antigo
    produtoAntigo.lancamentos.splice(this.lancamentoEdicao.lancamentoIndex, 1);
    produtoAntigo.total_peso = produtoAntigo.lancamentos.reduce((sum, l) => sum + l.peso, 0);
    produtoAntigo.total_valor = produtoAntigo.lancamentos.reduce((sum, l) => sum + l.valor_total, 0);

    // Se não houver mais lançamentos, remover produto da lista
    if (produtoAntigo.lancamentos.length === 0) {
      this.produtosLancados.splice(this.lancamentoEdicao.produtoIndex, 1);
    }

    // Verificar se já existe o novo produto na lista
    let produtoNovo = this.produtosLancados.find(p => p.produto._id === this.produtoTroca!._id);

    if (!produtoNovo) {
      produtoNovo = {
        produto: this.produtoTroca,
        preco_custo: this.produtoTroca.preco_custo || 0,
        lancamentos: [],
        total_peso: 0,
        total_valor: 0
      };
      this.produtosLancados.push(produtoNovo);
    }

    // Adicionar lançamento ao novo produto com novo preço
    const novoLancamento: LancamentoProduto = {
      peso: lancamento.peso,
      preco_custo_unitario: produtoNovo.preco_custo,
      valor_total: lancamento.peso * produtoNovo.preco_custo
    };

    produtoNovo.lancamentos.push(novoLancamento);
    produtoNovo.total_peso = produtoNovo.lancamentos.reduce((sum, l) => sum + l.peso, 0);
    produtoNovo.total_valor = produtoNovo.lancamentos.reduce((sum, l) => sum + l.valor_total, 0);

    this.calcularTotais();
    this.fecharModalTrocarProduto();
    this.alert.showSuccess('Produto trocado com sucesso!');
  }

  fecharModalTrocarProduto() {
    this.modalTrocarProdutoAberto = false;
    this.lancamentoEdicao = null;
    this.produtoTroca = null;
    this.buscaProdutoTroca = '';
    this.produtosFiltradosTroca = [];
  }

  calcularTotais() {
    this.totalGeralPeso = this.produtosLancados.reduce((sum, p) => sum + p.total_peso, 0);
    this.totalGeralValor = this.produtosLancados.reduce((sum, p) => sum + p.total_valor, 0);

    // Calcular rendimento
    this.calcularRendimento();
  }

  calcularRendimento() {
    const qtdAnimais = this.formNota.get('qtd_animais')?.value;
    const pesoAnimais = parseFloat(this.formNota.get('peso_animais')?.value);
    const valorPagoAnimais = this.formNota.get('valor_pago_animais')?.value;

    // Verificar se tem dados suficientes para calcular rendimento
    this.temDadosRendimento = qtdAnimais && pesoAnimais > 0 && valorPagoAnimais;

    if (!this.temDadosRendimento) {
      this.pesoTotalProdutosRendimento = 0;
      this.percentualRendimento = 0;
      // Limpar rendimento individual dos produtos
      this.produtosLancados.forEach(p => p.rendimento_percentual = undefined);
      return;
    }

    // Somar apenas produtos que devem entrar no cálculo de rendimento
    this.pesoTotalProdutosRendimento = 0;
    for (let produtoLancamento of this.produtosLancados) {
      // Se a propriedade não existir ou for true, calcula rendimento
      const calculaRendimento = produtoLancamento.produto.calcula_rendimento_entrada_nota !== false;
      
      if (calculaRendimento) {
        this.pesoTotalProdutosRendimento += produtoLancamento.total_peso;
        
        // Calcular rendimento individual do produto
        if (pesoAnimais > 0) {
          produtoLancamento.rendimento_percentual = (produtoLancamento.total_peso / pesoAnimais) * 100;
        } else {
          produtoLancamento.rendimento_percentual = 0;
        }
      } else {
        // Produtos que não entram no cálculo não têm rendimento
        produtoLancamento.rendimento_percentual = undefined;
      }
    }

    // Calcular percentual de rendimento total
    if (pesoAnimais > 0) {
      this.percentualRendimento = (this.pesoTotalProdutosRendimento / pesoAnimais) * 100;
    } else {
      this.percentualRendimento = 0;
    }
  }

  toggleFormCobranca() {
    this.formCobranca.reset({
      numero_cobranca: '',
      data_vencimento: '',
      valor: 0,
      forma_pagamento_id: '',
      numero_parcelas: 1,
      intervalo_dias: 30
    });
    this.modoParcelado = false;
    this.cobrancaEmEdicao = null;

    this.modalService.open(this.modalCobranca, { size: 'lg', scrollable: true });

    setTimeout(() => {
      document.getElementById('forma-pagamento-cobranca')?.focus();
    }, 150);
  }

  fecharModalCobranca() {
    this.modalService.dismissAll();
    this.formCobranca.reset();
    this.modoParcelado = false;
    this.cobrancaEmEdicao = null;
  }

  toggleModoParcelado() {
    this.modoParcelado = !this.modoParcelado;
    if (this.modoParcelado) {
      // Verificar se existe forma de pagamento selecionada
      const forma_pagamento_id = this.formCobranca.get('forma_pagamento_id')?.value;
      let intervaloDias = 30; // Padrão

      if (forma_pagamento_id) {
        const forma_pagamento = this.formasPagamento.find(fp => fp._id === forma_pagamento_id);
        if (forma_pagamento && forma_pagamento.dias_intervalo) {
          intervaloDias = forma_pagamento.dias_intervalo;
        }
      }

      this.formCobranca.patchValue({
        numero_parcelas: 1,
        intervalo_dias: intervaloDias
      });
    }
  }

  onFormaPagamentoChange() {
    const forma_pagamento_id = this.formCobranca.get('forma_pagamento_id')?.value;
    if (forma_pagamento_id) {
      const forma_pagamento = this.formasPagamento.find(fp => fp._id === forma_pagamento_id);
      if (forma_pagamento && forma_pagamento.dias_intervalo) {
        this.formCobranca.patchValue({
          intervalo_dias: forma_pagamento.dias_intervalo
        });
      }
    }
  }

  adicionarCobranca() {
    if (this.formCobranca.invalid) {
      this.alert.showWarning('Preencha todos os campos da cobrança');
      return;
    }

    if (this.modoParcelado) {
      this.adicionarCobrancasParceladas();
    } else {
      this.adicionarCobrancaUnica();
    }
  }

  adicionarCobrancaUnica() {
    const forma_pagamento_id = this.formCobranca.get('forma_pagamento_id')?.value;
    const forma_pagamento = this.formasPagamento.find(fp => fp._id === forma_pagamento_id);

    const cobranca: Cobranca = {
      numero_cobranca: this.formCobranca.get('numero_cobranca')?.value,
      data_vencimento: this.formCobranca.get('data_vencimento')?.value,
      valor: this.formCobranca.get('valor')?.value,
      numero_parcela: 1,
      total_parcelas: 1,
      grupo_id: this.proximoGrupoId,
      forma_pagamento: forma_pagamento
    };

    if (this.cobrancaEmEdicao !== null) {
      // Modo edição de cobrança individual
      const cobrancaOriginal = this.cobrancas[this.cobrancaEmEdicao];
      cobranca.numero_parcela = cobrancaOriginal.numero_parcela;
      cobranca.total_parcelas = cobrancaOriginal.total_parcelas;
      cobranca.grupo_id = cobrancaOriginal.grupo_id;

      // Verificar se deve recalcular as datas das próximas parcelas
      if (this.recalcularDatasAposEdicao && cobrancaOriginal.numero_parcela === 1) {
        const grupoId = cobrancaOriginal.grupo_id;
        const cobrancasDoGrupo = this.cobrancas.filter(c => c.grupo_id === grupoId).sort((a, b) => a.numero_parcela - b.numero_parcela);

        if (cobrancasDoGrupo.length > 1) {
          // Calcular intervalo baseado nas datas antigas
          const dataPrimeira = new Date(cobrancasDoGrupo[0].data_vencimento);
          const dataSegunda = new Date(cobrancasDoGrupo[1].data_vencimento);
          const intervaloDias = Math.round((dataSegunda.getTime() - dataPrimeira.getTime()) / (1000 * 60 * 60 * 24));

          // Atualizar primeira cobrança
          this.cobrancas[this.cobrancaEmEdicao] = cobranca;

          // Recalcular datas das próximas parcelas
          const novaDataInicial = new Date(cobranca.data_vencimento);
          cobrancasDoGrupo.slice(1).forEach((c, i) => {
            const indexCobranca = this.cobrancas.findIndex(cob => cob.grupo_id === grupoId && cob.numero_parcela === c.numero_parcela);
            if (indexCobranca !== -1) {
              const novaData = new Date(novaDataInicial);
              novaData.setDate(novaData.getDate() + ((i + 1) * intervaloDias));
              this.cobrancas[indexCobranca].data_vencimento = novaData.toISOString().split('T')[0];
            }
          });

          this.alert.showSuccess('Cobrança e datas subsequentes atualizadas!');
        } else {
          this.cobrancas[this.cobrancaEmEdicao] = cobranca;
          this.alert.showSuccess('Cobrança atualizada!');
        }
      } else {
        this.cobrancas[this.cobrancaEmEdicao] = cobranca;
        this.alert.showSuccess('Cobrança atualizada!');
      }

      this.cobrancaEmEdicao = null;
      this.recalcularDatasAposEdicao = false;
    } else {
      // Modo adição
      this.proximoGrupoId++;
      this.cobrancas.push(cobranca);
      this.alert.showSuccess('Cobrança adicionada!');
    }
    this.resetFormCobranca();
  }

  adicionarCobrancasParceladas() {
    const numeroBase = this.formCobranca.get('numero_cobranca')?.value;
    const dataInicial = new Date(this.formCobranca.get('data_vencimento')?.value);
    const valorTotal = this.formCobranca.get('valor')?.value;
    const numeroParcelas = this.formCobranca.get('numero_parcelas')?.value || 1;
    const intervaloDias = this.formCobranca.get('intervalo_dias')?.value || 30;
    const forma_pagamento_id = this.formCobranca.get('forma_pagamento_id')?.value;
    const forma_pagamento = this.formasPagamento.find(fp => fp._id === forma_pagamento_id);

    const grupoId = this.proximoGrupoId++;

    // Calcular valor de cada parcela
    const valorParcela = valorTotal / numeroParcelas;
    const valorArredondado = Math.floor(valorParcela * 100) / 100; // Arredondar para baixo
    let diferenca = valorTotal - (valorArredondado * numeroParcelas);

    // Gerar cobranças
    for (let i = 0; i < numeroParcelas; i++) {
      const dataVencimento = new Date(dataInicial);
      dataVencimento.setDate(dataVencimento.getDate() + (i * intervaloDias));

      // Ajustar última parcela com a diferença de centavos
      let valorFinal = valorArredondado;
      if (i === numeroParcelas - 1) {
        valorFinal = valorArredondado + diferenca;
      }

      const cobranca: Cobranca = {
        numero_cobranca: `${numeroBase}/${i + 1}`,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        valor: Math.round(valorFinal * 100) / 100,
        numero_parcela: i + 1,
        total_parcelas: numeroParcelas,
        grupo_id: grupoId,
        forma_pagamento: forma_pagamento
      };

      this.cobrancas.push(cobranca);
    }

    this.resetFormCobranca();
    this.alert.showSuccess(`${numeroParcelas} cobrança(s) adicionada(s)!`);
  }

  resetFormCobranca() {
    this.formCobranca.reset({
      numero_cobranca: '',
      data_vencimento: '',
      valor: 0,
      forma_pagamento_id: '',
      numero_parcelas: 1,
      intervalo_dias: 30
    });
    this.fecharModalCobranca();
    this.modoParcelado = false;
    this.cobrancaEmEdicao = null;
    this.recalcularDatasAposEdicao = false;
  }

  removerCobranca(index: number) {
    const cobrancaRemovida = this.cobrancas[index];
    const grupoId = cobrancaRemovida.grupo_id;
    const numeroBase = cobrancaRemovida.numero_cobranca.split('/')[0];

    this.cobrancas.splice(index, 1);

    // Renumerar apenas as cobranças do mesmo grupo
    const cobrancasDoGrupo = this.cobrancas.filter(c => c.grupo_id === grupoId);
    cobrancasDoGrupo.forEach((c, i) => {
      c.numero_parcela = i + 1;
      c.total_parcelas = cobrancasDoGrupo.length;
      // Atualizar o número da cobrança com a nova numeração
      c.numero_cobranca = `${numeroBase}/${i + 1}`;
    });

    this.alert.showSuccess('Cobrança removida!');
    this.fecharModalCobranca();
  }

  editarCobranca(index: number) {
    const cobranca = this.cobrancas[index];
    this.cobrancaEmEdicao = index;
    this.recalcularDatasAposEdicao = false;
    this.formCobranca.patchValue({
      numero_cobranca: cobranca.numero_cobranca,
      data_vencimento: cobranca.data_vencimento,
      valor: cobranca.valor,
      numero_parcelas: 1,
      intervalo_dias: 30
    });
    this.modoParcelado = false;
    this.modalService.open(this.modalCobranca, { size: 'lg', scrollable: true });
  }

  cancelarEdicaoCobranca() {
    this.cobrancaEmEdicao = null;
    this.resetFormCobranca();
  }

  // Funções de Grupos de Cobranças
  getGruposCobrancas() {
    const grupos = new Map<number, Cobranca[]>();
    this.cobrancas.forEach(cobranca => {
      if (!grupos.has(cobranca.grupo_id)) {
        grupos.set(cobranca.grupo_id, []);
      }
      grupos.get(cobranca.grupo_id)!.push(cobranca);
    });
    return Array.from(grupos.entries()).map(([grupoId, cobrancas]) => ({
      grupoId,
      cobrancas: cobrancas.sort((a, b) => a.numero_parcela - b.numero_parcela)
    }));
  }

  abrirModalEditarGrupoCobranca(grupoId: number) {
    this.grupoEditando = grupoId;
    const cobrancasDoGrupo = this.cobrancas.filter(c => c.grupo_id === grupoId);

    if (cobrancasDoGrupo.length > 0) {
      const primeiraCobranca = cobrancasDoGrupo[0];

      // Calcular intervalo médio entre parcelas
      let intervaloDias = 30;
      if (cobrancasDoGrupo.length > 1) {
        const dataPrimeira = new Date(cobrancasDoGrupo[0].data_vencimento);
        const dataSegunda = new Date(cobrancasDoGrupo[1].data_vencimento);
        intervaloDias = Math.round((dataSegunda.getTime() - dataPrimeira.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Calcular valor total do grupo
      const valorTotal = cobrancasDoGrupo.reduce((sum, c) => sum + c.valor, 0);

      this.formCobranca.patchValue({
        numero_cobranca: primeiraCobranca.numero_cobranca.split('/')[0],
        data_vencimento: primeiraCobranca.data_vencimento,
        forma_pagamento_id: primeiraCobranca.forma_pagamento?._id || '',
        valor: valorTotal,
        numero_parcelas: cobrancasDoGrupo.length,
        intervalo_dias: intervaloDias
      });
    }

    this.modoParcelado = true;
    this.modalService.open(this.modalEditarGrupoCobranca, { size: 'lg', scrollable: true });
  }

  fecharModalEditarGrupoCobranca() {
    this.grupoEditando = null;
    this.modalService.dismissAll();
    this.formCobranca.reset();
    this.modoParcelado = false;
  }

  salvarEdicaoGrupoCobranca() {
    if (this.grupoEditando === null) return;

    const novaQuantidadeParcelas = parseInt(this.formCobranca.get('numero_parcelas')?.value);
    const novaDataInicial = this.formCobranca.get('data_vencimento')?.value;
    const novoIntervaloDias = parseInt(this.formCobranca.get('intervalo_dias')?.value || '30');
    const valorTotalGrupo = parseFloat(this.formCobranca.get('valor')?.value || '0');
    const numeroBase = this.formCobranca.get('numero_cobranca')?.value;

    if (novaQuantidadeParcelas <= 0) {
      this.alert.showWarning('Informe um número válido de parcelas');
      return;
    }

    if (!novaDataInicial) {
      this.alert.showWarning('Informe a data do primeiro vencimento');
      return;
    }

    if (valorTotalGrupo <= 0) {
      this.alert.showWarning('Informe um valor total válido');
      return;
    }

    if (!numeroBase || numeroBase.trim() === '') {
      this.alert.showWarning('Informe o número base da cobrança');
      return;
    }

    const dataInicial = new Date(novaDataInicial);
    const intervaloDias = novoIntervaloDias;
    const forma_pagamento_id = this.formCobranca.get('forma_pagamento_id')?.value;
    const forma_pagamento = this.formasPagamento.find(fp => fp._id === forma_pagamento_id);

    // Remover cobranças antigas do grupo
    this.cobrancas = this.cobrancas.filter(c => c.grupo_id !== this.grupoEditando);

    // Calcular valor de cada nova parcela
    const valorParcela = valorTotalGrupo / novaQuantidadeParcelas;
    const valorArredondado = Math.floor(valorParcela * 100) / 100;
    let diferenca = valorTotalGrupo - (valorArredondado * novaQuantidadeParcelas);

    // Gerar novas cobranças
    for (let i = 0; i < novaQuantidadeParcelas; i++) {
      const dataVencimento = new Date(dataInicial);
      dataVencimento.setDate(dataVencimento.getDate() + (i * intervaloDias));

      let valorFinal = valorArredondado;
      if (i === novaQuantidadeParcelas - 1) {
        valorFinal += diferenca;
      }

      const cobranca: Cobranca = {
        numero_cobranca: `${numeroBase}/${i + 1}`,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        valor: Math.round(valorFinal * 100) / 100,
        numero_parcela: i + 1,
        total_parcelas: novaQuantidadeParcelas,
        grupo_id: this.grupoEditando,
        forma_pagamento: forma_pagamento
      };

      this.cobrancas.push(cobranca);
    }

    this.alert.showSuccess('Grupo de cobranças atualizado!');
    this.fecharModalEditarGrupoCobranca();
  }

  removerGrupoCobranca(grupoId: number) {
    this.cobrancas = this.cobrancas.filter(c => c.grupo_id !== grupoId);
    this.alert.showSuccess('Grupo de cobranças removido!');
  }

  removerGrupoCobrancaModal() {
    if (this.grupoEditando !== null) {
      this.removerGrupoCobranca(this.grupoEditando);
      this.fecharModalEditarGrupoCobranca();
    }
  }

  calcularTotalCobrancas(): number {
    return this.cobrancas.reduce((sum, c) => sum + c.valor, 0);
  }

  calcularSubtotalGrupo(cobrancas: Cobranca[]): number {
    return cobrancas.reduce((sum, c) => sum + c.valor, 0);
  }

  async finalizarNota() {
    if (this.formNota.invalid) {
      this.alert.showWarning('Preencha todos os campos obrigatórios da nota');
      return;
    }

    if (this.produtosLancados.length === 0) {
      this.alert.showWarning('Adicione ao menos um produto');
      return;
    }

    if (this.notaFechada) {
      this.alert.showWarning('Esta nota já foi fechada e não pode ser editada');
      return;
    }

    this.loading = true;
    try {
      const payload = {
        ...this.formNota.value,
        produtos: this.produtosLancados.map(p => ({
          produto_id: p.produto._id,
          produto_nome: p.produto.nome,
          preco_custo: p.preco_custo,
          lancamentos: p.lancamentos,
          total_peso: p.total_peso,
          total_valor: p.total_valor
        })),
        cobrancas: this.cobrancas,
        total_geral_peso: this.totalGeralPeso,
        total_geral_valor: this.totalGeralValor,
        valor_total_nota: this.totalGeralValor + (this.formNota.get('valor_frete')?.value || 0),
        efetuar_fechamento: this.efetuarFechamento
      };

      await this.endpointService.postEntradaNota(payload);
      this.alert.showSuccess('Operação concluida com sucesso!');

      this.router.navigate(['/admin/notas-entradas/listar']);
    } catch (error: any) {
      this.alert.showDanger(error);
    } finally {
      this.loading = false;
    }
  }

  // Métodos de OCR
  abrirModalOcr() {
    this.imagemSelecionada = null;
    this.imageChangedEvent = '';
    this.croppedImage = '';
    this.modalService.open(this.modalOcr, { size: 'xl', fullscreen: true });
  }

  fecharModalOcr() {
    this.imagemSelecionada = null;
    this.imageChangedEvent = '';
    this.croppedImage = '';
    this.modalService.dismissAll();
  }

  onFileSelected(event: any) {
    this.imageChangedEvent = event;
  }

  imageCropped(event: any) {
    console.log('Evento imageCropped:', event);
    // O evento tem blob, base64, objectUrl, etc
    this.croppedImage = event.blob || event.base64 || event.objectUrl;
  }

  imageLoaded() {
    // Imagem carregada com sucesso
    console.log('Imagem carregada');
  }

  cropperReady() {
    // Cropper está pronto
    console.log('Cropper pronto');
  }

  loadImageFailed() {
    this.alert.showDanger('Erro ao carregar a imagem');
  }

  async processarOcr() {
    if (!this.croppedImage) {
      this.alert.showWarning('Selecione e recorte uma imagem primeiro');
      return;
    }

    this.uploadingOcr = true;
    try {
      // Criar FormData com o blob
      const formData = new FormData();
      formData.append('image', this.croppedImage, 'nota.jpg');

      // Fazer upload
      const response: any = await this.endpointService.uploadImageOcr(formData);

      console.log('Resposta OCR:', response);

      // Salvar produtos OCR
      if (response && Array.isArray(response)) {
        this.produtosOCR = response;
        this.salvarProdutosOCR();
        this.alert.showSuccess(`${response.length} produto(s) extraído(s) da nota!`);
      } else {
        this.alert.showSuccess('Imagem processada com sucesso!');
      }

      this.fecharModalOcr();

    } catch (error: any) {
      console.error('Erro ao processar OCR:', error);
      this.alert.showDanger('Erro ao processar a imagem: ' + (error.message || error));
    } finally {
      this.uploadingOcr = false;
    }
  }

  // Métodos de gerenciamento de produtos OCR
  salvarProdutosOCR() {
    localStorage.setItem('entrada-notas-ocr', JSON.stringify(this.produtosOCR));
  }

  carregarProdutosOCR() {
    const dados = localStorage.getItem('entrada-notas-ocr');
    if (dados) {
      try {
        this.produtosOCR = JSON.parse(dados);
      } catch (error) {
        console.error('Erro ao carregar dados OCR:', error);
        this.produtosOCR = [];
      }
    }
  }

  limparProdutosOCR() {
    this.produtosOCR = [];
    localStorage.removeItem('entrada-notas-ocr');
    this.alert.showSuccess('Dados OCR limpos!');
  }

  temProdutosOCR(): boolean {
    return this.produtosOCR.length > 0;
  }

  // Visualizar produtos OCR (sem necessidade de produto selecionado)
  visualizarProdutosOCR() {
    if (!this.temProdutosOCR()) {
      this.alert.showWarning('Nenhum dado OCR disponível');
      return;
    }

    this.modalListaProdutosOCRAberto = true;
  }

  // Abrir lista de produtos OCR para escolher
  abrirListaProdutosOCR() {
    if (!this.produtoSelecionado) {
      this.alert.showWarning('Selecione um produto primeiro');
      return;
    }

    if (!this.temProdutosOCR()) {
      this.alert.showWarning('Nenhum dado OCR disponível');
      return;
    }

    this.modalListaProdutosOCRAberto = true;
  }

  fecharListaProdutosOCR() {
    this.modalListaProdutosOCRAberto = false;
  }

  // Modal de seleção de peças
  abrirModalSelecaoPecas(produtoOCR: ProdutoOCR) {
    // Verificar se tem produto selecionado
    if (!this.produtoSelecionado) {
      this.alert.showWarning('Selecione um produto no formulário primeiro');
      return;
    }

    this.fecharListaProdutosOCR();
    this.produtoOCRSelecionado = produtoOCR;
    this.pecasSelecionadas = new Array(produtoOCR.pesos_individuais.length).fill(false);
    this.modalSelecaoPecasAberto = true;
  }

  fecharModalSelecaoPecas() {
    this.modalSelecaoPecasAberto = false;
    this.produtoOCRSelecionado = null;
    this.pecasSelecionadas = [];
  }

  toggleTodasPecas(selecionar: boolean) {
    this.pecasSelecionadas = this.pecasSelecionadas.map(() => selecionar);
  }

  togglePeca(index: number) {
    this.pecasSelecionadas[index] = !this.pecasSelecionadas[index];
  }

  getPecasSelecionadasCount(): number {
    return this.pecasSelecionadas.filter(p => p).length;
  }

  adicionarPecasSelecionadas() {
    if (!this.produtoOCRSelecionado || !this.produtoSelecionado) {
      return;
    }

    const pecasParaAdicionar = this.produtoOCRSelecionado.pesos_individuais
      .map((peso, index) => ({ peso, index }))
      .filter(item => this.pecasSelecionadas[item.index]);

    if (pecasParaAdicionar.length === 0) {
      this.alert.showWarning('Selecione ao menos uma peça');
      return;
    }

    const preco_custo = parseFloat(this.formLancamento.get('preco_custo')?.value) || this.produtoSelecionado.preco_custo;

    // Adicionar cada peça como um lançamento
    pecasParaAdicionar.forEach(item => {
      const peso = item.peso;
      const valor_total = peso * preco_custo;

      const lancamento: LancamentoProduto = {
        peso: peso,
        preco_custo_unitario: preco_custo,
        valor_total: valor_total
      };

      this.produtoSelecionado!.lancamentos.push(lancamento);
    });

    // Atualizar totais
    this.produtoSelecionado.total_peso = this.produtoSelecionado.lancamentos.reduce((sum, l) => sum + l.peso, 0);
    this.produtoSelecionado.total_valor = this.produtoSelecionado.lancamentos.reduce((sum, l) => sum + l.valor_total, 0);

    // Adicionar ou atualizar na lista de produtos lançados
    const index = this.produtosLancados.findIndex(p => p.produto._id === this.produtoSelecionado!.produto._id);
    if (index === -1) {
      this.produtosLancados.push(this.produtoSelecionado);
    }

    this.calcularTotais();
    this.alert.showSuccess(`${pecasParaAdicionar.length} peça(s) adicionada(s)!`);
    this.fecharModalSelecaoPecas();
  }

  base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  limparFormulario() {
    this.formNota.reset({
      data_nota: '',
      fornecedor: '',
      almoxarifado: '',
      qtd_animais: '',
      peso_animais: '',
      valor_pago_animais: '',
      numero_nota: '',
      valor_frete: 0
    });
    this.formLancamento.reset({
      produto_id: '',
      preco_custo: 0,
      peso: ''
    });
    this.formCobranca.reset({
      tipo: 'BOLETO',
      numero_cobranca: '',
      data_vencimento: '',
      valor: 0,
      forma_pagamento_id: '',
      numero_parcelas: 1,
      intervalo_dias: 30
    });
    this.fornecedorSelecionado = null;
    this.almoxarifadoSelecionado = null;
    this.produtoSelecionado = null;
    this.produtosLancados = [];
    this.cobrancas = [];
    this.totalGeralPeso = 0;
    this.totalGeralValor = 0;
    this.mostrarFormCobranca = false;
    this.modoParcelado = false;
    this.efetuarFechamento = false;
    this.proximoGrupoId = 1;
  }

}
