import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs';
import { AlertService } from 'src/app/services/alert.service';
import { PessoasModalService } from '../../pessoas/pessoas-modal.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

interface ItemPedido {
  produto: any;
  produto_estoque_id?: string;
  quantidade: number;
  preco_unitario: number;
  valor_total: number;
  tipo_saida: string;
  peca?: any; // Informações da peça quando tipo_saida = ESTOQUE PECA
  unidade_saida: string; // KG, UN, etc
  _removido?: boolean; // Marca se o item foi removido temporariamente (para edição)
}

interface Parcela {
  forma_pagamento: any;
  data_vencimento: string;
  valor: number;
  numero_parcela: number; // Número da parcela dentro do grupo (1, 2, 3...)
  total_parcelas: number; // Total de parcelas do grupo
  grupo_id: number; // ID do grupo de parcelas da mesma forma de pagamento
}

@Component({
  selector: 'app-vendas-pdv',
  templateUrl: './vendas-pdv.component.html',
  styleUrls: ['./vendas-pdv.component.scss']
})
export class VendasPdvComponent implements OnInit {

  formPedido: FormGroup;
  formItem: FormGroup;
  formEndereco: FormGroup;
  loading: boolean = false;
  loadingEstoque: boolean = false;

  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  clienteSelecionado: any = null;

  estoque: any[] = [];
  estoqueFiltrado: any[] = [];
  produtoSelecionado: any = null;

  // Controle de peças
  pecasDisponiveis: any[] = [];
  pecasFiltradas: any[] = [];
  pecasSelecionadas: any[] = [];
  loadingPecas: boolean = false;
  buscaPeca: string = '';
  almoxarifadoSelecionadoPecas: any = null;
  almoxarifados: any[] = [];
  almoxarifadoPrincipal: any = null;
  pecaFocadaIndex: number = 0; // Índice da peça focada para navegação por teclado

  itensPedido: ItemPedido[] = [];

  // Retorna opções de máscara para quantidade baseado na unidade
  getMascaraQuantidade() {
    if (this.produtoSelecionado?.unidade === 'UN') {
      return { precision: 0, allowNegative: false, thousands: '' };
    }
    return { precision: 2, allowNegative: false, decimal: ',' };
  }

  // Controle do modal de edição de item
  itemSendoEditado: ItemPedido | null = null;
  indexItemEditado: number = -1;
  formEditarItem: FormGroup;

  buscaCliente: string = '';
  buscaProduto: string = '';
  mostrarListaClientes: boolean = false;
  mostrarListaProdutos: boolean = false;

  subtotal: number = 0;
  totalDesconto: number = 0;
  totalPedido: number = 0;

  // Controle de formas de pagamento
  formasPagamento: any[] = [];
  formasPagamentoFiltradas: any[] = [];
  parcelas: Parcela[] = [];
  formFormaPagamento: FormGroup;
  formEditarParcela: FormGroup;
  parcelaEditando: Parcela | null = null;
  indexParcelaEditando: number = -1;
  buscaFormaPagamento: string = '';
  totalPago: number = 0;
  totalRestante: number = 0;
  proximoGrupoId: number = 1;
  grupoEditando: number | null = null;
  formObservacao: FormGroup;

  @ViewChild('valorPagamentoInput') valorPagamentoInput?: ElementRef;
  @ViewChild('modalFormaPagamento') modalFormaPagamento: any;
  @ViewChild('modalEditarParcela') modalEditarParcela: any;
  @ViewChild('modalEditarGrupo') modalEditarGrupo: any;
  @ViewChild('modalEditarItem') modalEditarItem: any;
  @ViewChild('modalPecas') modalPecas: any;
  @ViewChild('modalEndereco') modalEndereco: any;
  @ViewChild('modalObservacao') modalObservacao: any;

  constructor(
    private fb: FormBuilder,
    private endpointService: EndpointsService,
    private alert: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private pessoasModalService: PessoasModalService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) this.getVendaById(params['id']);
    })
    this.formPedido = this.fb.group({
      _id: this.fb.control(''),
      nova_venda: this.fb.control(true),
      codigo: this.fb.control(''),
      data: this.fb.control(dayjs().format("YYYY-MM-DD"), [Validators.required]),
      cliente: this.fb.control(''),
      desconto: this.fb.control(0),
      fechar_venda: this.fb.control(true),
      venda_na_conta: this.fb.control(true),
      observacao: this.fb.control(''),
      endereco_entrega: this.fb.group({
        cep: this.fb.control(''),
        logradouro: this.fb.control(''),
        numero: this.fb.control(''),
        complemento: this.fb.control(''),
        bairro: this.fb.control(''),
        cidade: this.fb.control(''),
        estado: this.fb.control('')
      })
    });

    this.formItem = this.fb.group({
      quantidade: this.fb.control('', [Validators.required, Validators.min(0.01)]),
      preco_unitario: this.fb.control('', [Validators.required, Validators.min(0.01)])
    });

    this.formEditarItem = this.fb.group({
      quantidade: this.fb.control('', [Validators.required, Validators.min(0.01)]),
      preco_unitario: this.fb.control(null, [Validators.required, Validators.min(0.01)])
    });

    this.formFormaPagamento = this.fb.group({
      forma_pagamento: this.fb.control(null, [Validators.required]),
      quantidade_parcelas: this.fb.control(1, [Validators.required, Validators.min(1)]),
      valor_pagamento: this.fb.control('', [Validators.required, Validators.min(0.01)])
    });

    this.formEditarParcela = this.fb.group({
      data_vencimento: this.fb.control('', [Validators.required]),
      valor: this.fb.control('', [Validators.required, Validators.min(0.01)])
    });

    this.formEndereco = this.fb.group({
      cep: this.fb.control(''),
      logradouro: this.fb.control(''),
      numero: this.fb.control(''),
      complemento: this.fb.control(''),
      bairro: this.fb.control(''),
      cidade: this.fb.control(''),
      estado: this.fb.control('')
    });

    this.formObservacao = this.fb.group({
      observacao: this.fb.control('')
    });
  }

  ngOnInit(): void {
    this.carregarClientes();
    this.carregarEstoque();
    this.carregarAlmoxarifados();
    this.carregarFormasPagamento();

    // Observar mudanças no desconto
    this.formPedido.get('desconto')?.valueChanges.subscribe(() => {
      this.calcularTotais();
    });

    // Observar mudanças no switch "Venda na Conta"
    this.formPedido.get('venda_na_conta')?.valueChanges.subscribe((vendaNaConta) => {
      if (vendaNaConta) {
        // Verificar se há parcelas cadastradas
        if (this.parcelas.length > 0) {
          this.alert.showWarning('Não é possível marcar "Venda na Conta" quando já existem formas de pagamento. Remova as formas de pagamento primeiro.');
          // Desmarcar o checkbox
          this.formPedido.patchValue({ venda_na_conta: false }, { emitEvent: false });
          return;
        }
        // Se ativou "Venda na Conta", limpar parcelas
        this.parcelas = [];
        this.calcularTotaisPagamento();
      }
    });

    setTimeout(() => {
      document.getElementById('data_pedido')?.focus();
    }, 250);
  }

  async getVendaById(id: string) {
    this.loading = true;
    try {
      const response = await this.endpointService.getPedidoById(id);
      const venda = response;

      // Verificar se a venda está em status ABERTA
      if (venda.status !== 'ABERTA') {
        this.alert.showWarning('Esta venda já está fechada e não pode ser editada');
        this.router.navigate(['/admin/vendas/listar']);
        return;
      }

      // Popular dados da venda
      this.formPedido.patchValue({
        _id: venda._id,
        nova_venda: false,
        codigo: venda.codigo,
        data: venda.data.split("T")[0],
        desconto: venda.valor_desconto || 0,
        observacao: venda.observacao || ''
      });

      // Popular cliente
      if (venda.cliente) {
        this.clienteSelecionado = venda.cliente;
        this.formPedido.patchValue({ cliente: venda.cliente._id });
      }
      // Popular endereço de entrega
      if (venda?.endereco?.logradouro) {
        this.formEndereco.patchValue({
          cep: venda.endereco.cep || '',
          logradouro: venda.endereco.logradouro || '',
          numero: venda.endereco.numero || '',
          complemento: venda.endereco.complemento || '',
          bairro: venda.endereco.bairro || '',
          cidade: venda.endereco.cidade || '',
          estado: venda.endereco.estado || ''
        });
      }

      // Popular itens da venda
      this.itensPedido = venda.itens.map((item: any) => ({
        produto: item.produto,
        produto_estoque_id: item.produto._id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        valor_total: item.valor_total,
        tipo_saida: item.tipo_saida,
        peca: item.peca || null,
        unidade_saida: item.unidade_saida
      }));

      // Popular parcelas
      this.parcelas = venda.parcelas.map((parcela: any, index: number) => ({
        forma_pagamento: parcela.forma_pagamento,
        data_vencimento: dayjs(parcela.data_vencimento).format('YYYY-MM-DD'),
        valor: parcela.valor,
        numero_parcela: parcela.numero_parcela,
        total_parcelas: parcela.total_parcelas || 1, // Compatibilidade com vendas antigas
        grupo_id: parcela.grupo_id
      }));

      // Atualizar próximo grupo ID
      if (this.parcelas.length > 0) {
        this.proximoGrupoId = Math.max(...this.parcelas.map(p => p.grupo_id)) + 1;
      }

      // Recalcular totais
      this.calcularTotais();

      this.alert.showSuccess('Venda carregada para edição');
    } catch (error: any) {
      this.alert.showDanger('Erro ao carregar venda: ' + error.message);
      this.router.navigate(['/admin/vendas']);
    } finally {
      this.loading = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    // Verificar se está digitando em um input, textarea ou select
    const target = event.target as HTMLElement;
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

    // Tecla P para abrir seleção de produto (apenas se não estiver digitando e nenhum produto selecionado)
    if (event.key.toLowerCase() === 'p' && !isTyping && !this.produtoSelecionado && !this.mostrarListaProdutos) {
      event.preventDefault();
      this.abrirListaProdutos();
    }

    // Tecla F para abrir modal de forma de pagamento (apenas se não estiver digitando)
    if (event.key.toLowerCase() === 'f' && !isTyping && this.itensPedido.length > 0) {
      event.preventDefault();
      this.abrirModalFormaPagamento();
    }
  }

  async carregarClientes() {
    try {
      this.loading = true;
      let data = await this.endpointService.getClientesNoAuth()
      this.clientes = data.lista || [];
      this.clientesFiltrados = [...this.clientes];
    } catch (error: any) {
      this.alert.showDanger(error);
    } finally {
      this.loading = false;
    }
  }

  async carregarEstoque() {
    try {
      this.loadingEstoque = true;
      let data = await this.endpointService.getProdutosPDV({ busca: '' })
      this.estoque = data.lista || [];
      this.estoqueFiltrado = [...this.estoque];
    } catch (error: any) {
      this.alert.showDanger(error);
    } finally {
      this.loadingEstoque = false;
    }
  }

  async carregarAlmoxarifados() {
    try {
      let data = await this.endpointService.getAlmoxarifadosNoAuth();
      this.almoxarifados = data.lista || [];
      // Identificar almoxarifado principal
      this.almoxarifadoPrincipal = this.almoxarifados.find(a => a.principal === true) || this.almoxarifados[0];
      if (this.almoxarifadoPrincipal) {
        this.almoxarifadoSelecionadoPecas = this.almoxarifadoPrincipal;
      }
    } catch (error: any) {
      this.alert.showDanger(error);
    }
  }

  // Funções de Cliente
  abrirListaClientes() {
    this.mostrarListaClientes = true;
    this.buscaCliente = '';
    this.clientesFiltrados = [...this.clientes];
  }

  fecharListaClientes() {
    this.mostrarListaClientes = false;
  }

  filtrarClientes() {
    const busca = this.buscaCliente.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c =>
      c.nome.toLowerCase().includes(busca) ||
      c.documento?.toLowerCase().includes(busca)
    );
  }

  selecionarCliente(cliente: any) {
    this.clienteSelecionado = cliente;
    this.formPedido.patchValue({ cliente: cliente._id });

    // Preencher endereço se existir
    if (cliente.endereco) {
      this.formPedido.patchValue({
        endereco_entrega: {
          cep: cliente.endereco.cep || '',
          logradouro: cliente.endereco.logradouro || '',
          numero: cliente.endereco.numero || '',
          complemento: cliente.endereco.complemento || '',
          bairro: cliente.endereco.bairro || '',
          cidade: cliente.endereco.cidade || '',
          estado: cliente.endereco.estado || ''
        }
      });
    }

    this.fecharListaClientes();

    setTimeout(() => {
      this.abrirListaProdutos();
    }, 500);
  }

  limparCliente() {
    this.clienteSelecionado = null;
    this.formPedido.patchValue({
      cliente: '',
      endereco_entrega: {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
      }
    });
  }

  async criarNovoCliente() {
    try {
      // Fechar o modal de seleção de clientes
      this.fecharListaClientes();
      
      // Abrir o modal de criação de pessoa
      const novoCliente = await this.pessoasModalService.openPessoaModal();
      
      // Se o cliente foi criado com sucesso
      if (novoCliente) {
        // Recarregar a lista de clientes
        await this.carregarClientes();
        
        // Selecionar o cliente recém criado
        const clienteCriado = this.clientes.find(c => c._id === novoCliente._id);
        if (clienteCriado) {
          this.selecionarCliente(clienteCriado);
          this.alert.showSuccess('Cliente criado e selecionado com sucesso!');
        }
      }
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
    }
  }

  // Funções de Produto
  abrirListaProdutos() {
    this.mostrarListaProdutos = true;
    this.buscaProduto = '';
    this.estoqueFiltrado = [...this.estoque];
    setTimeout(() => {
      document?.getElementById('busca-produto-input')?.focus();
    }, 150);
  }

  fecharListaProdutos() {
    this.mostrarListaProdutos = false;
  }

  filtrarProdutos() {
    const busca = this.buscaProduto.toLowerCase();
    console.log(this.estoque, busca);
    this.estoqueFiltrado = this.estoque.filter(e =>
      e?.nome?.toLowerCase().includes(busca) ||
      e?.sku?.toLowerCase().includes(busca)
    );
  }

  selecionarProduto(estoque: any) {
    // Para produtos ESTOQUE PADRAO, verificar se já está no pedido e abrir modal de edição
    if (estoque.tipo_saida === 'ESTOQUE PADRAO') {
      const indexProdutoExistente = this.itensPedido.findIndex(item =>
        item.produto._id === estoque._id || item.produto._id === estoque.produto?._id
      );

      if (indexProdutoExistente !== -1) {
        // Produto já existe no pedido, abrir modal de edição
        this.fecharListaProdutos();
        this.abrirModalEditarItem(this.itensPedido[indexProdutoExistente], indexProdutoExistente);
        return;
      }
    }

    // Para ESTOQUE PECA, sempre permitir adicionar mais peças
    this.produtoSelecionado = estoque;
    this.formItem.patchValue({
      preco_unitario: estoque.preco_venda || 0
    });
    this.fecharListaProdutos();

    // Se for ESTOQUE PECA, abrir modal de seleção de peças
    if (estoque.tipo_saida === 'ESTOQUE PECA') {
      this.abrirModalSelecaoPecas();
    } else {
      this.formItem.patchValue({
        quantidade: null
      })
      setTimeout(() => {
        document.getElementById('quantidade-item-input')?.focus();
      }, 150);
    }
  }

  limparProdutoSelecionado() {
    this.produtoSelecionado = null;
    this.pecasSelecionadas = [];
    this.pecasDisponiveis = [];
    this.almoxarifadoSelecionadoPecas = this.almoxarifadoPrincipal;
    this.formItem.reset();
  }

  // Funções de Peças
  abrirModalSelecaoPecas() {
    if (!this.almoxarifadoPrincipal) {
      this.alert.showDanger('Nenhum almoxarifado principal configurado');
      return;
    }
    // Sempre usar o almoxarifado principal
    this.almoxarifadoSelecionadoPecas = this.almoxarifadoPrincipal;
    this.pecaFocadaIndex = 0; // Reset do índice focado
    this.carregarPecas();
    this.modalService.open(this.modalPecas, { size: 'xl', scrollable: true });

    // Focar no modal após abrir
    setTimeout(() => {
      const modalBody = document.querySelector('.modal-body[tabindex="0"]') as HTMLElement;
      if (modalBody) {
        modalBody.focus();
      }
    }, 100);
  }

  fecharModalPecas() {
    this.modalService.dismissAll();
    this.buscaPeca = '';
  }

  async carregarPecas() {
    if (!this.produtoSelecionado || !this.almoxarifadoSelecionadoPecas) {
      return;
    }

    try {
      this.loadingPecas = true;
      const data = await this.endpointService.getPecasProdutoAlmoxarifado(
        this.produtoSelecionado._id,
        this.almoxarifadoSelecionadoPecas._id,
        'EM ESTOQUE'
      );

      // Peças que estão ativas no pedido (não removidas)
      const pecasAtivasNoPedido = this.itensPedido
        .filter(item => item.tipo_saida === 'ESTOQUE PECA' && item.peca && !item._removido)
        .map(item => item.peca._id);

      // Peças que foram removidas temporariamente (podem ser reativadas)
      const pecasRemovidasTemp = this.itensPedido
        .filter(item => item.tipo_saida === 'ESTOQUE PECA' && item.peca && item._removido)
        .map(item => item.peca);

      // Filtrar apenas as peças que não estão ativas
      this.pecasDisponiveis = (data.lista || []).filter((peca: any) =>
        !pecasAtivasNoPedido.includes(peca._id)
      );

      // Adicionar peças removidas temporariamente à lista (com flag especial)
      pecasRemovidasTemp.forEach(peca => {
        this.pecasDisponiveis.push({
          ...peca,
          _removidoTemp: true // Flag para identificar que está removida temporariamente
        });
      });

      // Ordenar por peso decrescente (maior para menor)
      this.pecasDisponiveis.sort((a: any, b: any) => (b.peso || 0) - (a.peso || 0));

      this.pecasFiltradas = [...this.pecasDisponiveis];
    } catch (error: any) {
      this.alert.showDanger(error);
    } finally {
      this.loadingPecas = false;
    }
  }

  filtrarPecas() {
    const busca = this.buscaPeca.toLowerCase();
    this.pecasFiltradas = this.pecasDisponiveis.filter(p =>
      p.nota?.numero_nota?.toLowerCase().includes(busca) ||
      p.nota?.fornecedor?.nome?.toLowerCase().includes(busca)
    );
    
    // Ordenar por peso decrescente (maior para menor)
    this.pecasFiltradas.sort((a: any, b: any) => (b.peso || 0) - (a.peso || 0));
  }

  selecionarPeca(peca: any) {
    const index = this.pecasSelecionadas.findIndex(p => p._id === peca._id);
    if (index > -1) {
      this.pecasSelecionadas.splice(index, 1);
    } else {
      this.pecasSelecionadas.push(peca);
    }
  }

  isPecaSelecionada(peca: any): boolean {
    return this.pecasSelecionadas.some(p => p._id === peca._id);
  }

  // Navegação por teclado no modal de peças
  onPecasKeyDown(event: KeyboardEvent) {
    if (this.pecasFiltradas.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.pecaFocadaIndex = Math.min(this.pecaFocadaIndex + 1, this.pecasFiltradas.length - 1);
        this.scrollToPeca(this.pecaFocadaIndex);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.pecaFocadaIndex = Math.max(this.pecaFocadaIndex - 1, 0);
        this.scrollToPeca(this.pecaFocadaIndex);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.pecasFiltradas[this.pecaFocadaIndex]) {
          this.selecionarPeca(this.pecasFiltradas[this.pecaFocadaIndex]);
        }
        break;
      case 'c':
      case 'C':
      case 'f':
      case 'F':
        event.preventDefault();
        if (this.pecasSelecionadas.length > 0) {
          this.confirmarSelecaoPecas();
        }
        break;
    }
  }

  scrollToPeca(index: number) {
    setTimeout(() => {
      const element = document.querySelector(`[data-peca-index="${index}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  }

  isPecaFocada(index: number): boolean {
    return this.pecaFocadaIndex === index;
  }

  confirmarSelecaoPecas() {
    if (this.pecasSelecionadas.length === 0) {
      this.alert.showWarning('Selecione pelo menos uma peça');
      return;
    }

    // Adicionar ou reativar cada peça
    const preco_unitario = parseFloat(this.formItem.value.preco_unitario) || this.produtoSelecionado.preco_venda;

    this.pecasSelecionadas.forEach(peca => {
      // Verificar se é uma peça que foi removida temporariamente
      if (peca._removidoTemp) {
        // Reativar a peça existente
        const itemRemovido = this.itensPedido.find(
          item => item.tipo_saida === 'ESTOQUE PECA' &&
            item.peca?._id === peca._id &&
            item._removido === true
        );

        if (itemRemovido) {
          itemRemovido._removido = false;
          itemRemovido.preco_unitario = preco_unitario;
          itemRemovido.valor_total = itemRemovido.quantidade * preco_unitario;
        }
      } else {
        // Adicionar nova peça
        const item: ItemPedido = {
          produto: this.produtoSelecionado,
          quantidade: peca.peso,
          preco_unitario: preco_unitario,
          valor_total: peca.peso * preco_unitario,
          tipo_saida: 'ESTOQUE PECA',
          peca: peca,
          unidade_saida: peca.unidade || this.produtoSelecionado.unidade,
          _removido: false
        };

        this.itensPedido.push(item);
      }
    });

    this.calcularTotais();
    this.alert.showSuccess(`${this.pecasSelecionadas.length} peça(s) processada(s)`);
    this.limparProdutoSelecionado();
    this.fecharModalPecas();
  }

  adicionarItem() {
    if (!this.produtoSelecionado) {
      this.alert.showWarning('Selecione um produto');
      return;
    }

    // Se for ESTOQUE PECA, usar o fluxo de peças
    if (this.produtoSelecionado.tipo_saida === 'ESTOQUE PECA') {
      this.abrirModalSelecaoPecas();
      return;
    }

    // Fluxo normal para ESTOQUE PADRAO
    if (this.formItem.invalid) {
      this.alert.showWarning('Preencha todos os campos do item');
      return;
    }

    const quantidade = parseFloat(this.formItem.value.quantidade);
    const preco_unitario = parseFloat(this.formItem.value.preco_unitario);

    // Verificar disponibilidade em estoque
    if (quantidade > this.produtoSelecionado.saldo_estoque) {
      this.alert.showDanger(`Quantidade indisponível. Disponível: ${this.produtoSelecionado.saldo_estoque}`);
      return;
    }

    const item: ItemPedido = {
      produto: this.produtoSelecionado,
      produto_estoque_id: this.produtoSelecionado._id,
      quantidade: quantidade,
      preco_unitario: preco_unitario,
      valor_total: quantidade * preco_unitario,
      tipo_saida: 'ESTOQUE PADRAO',
      unidade_saida: this.produtoSelecionado.unidade
    };

    this.itensPedido.push(item);
    this.calcularTotais();
    this.limparProdutoSelecionado();
    this.alert.showSuccess('Item adicionado à venda');
  }

  openCliente() {
    this.abrirListaClientes();
    setTimeout(() => {
      document.getElementById('input-busca-cliente')?.focus();
    }, 250);
  }

  removerItem(index: number) {
    const item = this.itensPedido[index];

    // Se for uma venda em edição e for uma peça, apenas marcar como removida
    if (!this.formPedido.value.nova_venda && item.tipo_saida === 'ESTOQUE PECA') {
      item._removido = true;
      this.alert.showSuccess('Peça marcada como removida (você pode reativá-la depois)');
    } else {
      // Para novos itens ou estoque padrão, remover completamente
      this.itensPedido.splice(index, 1);
      this.alert.showSuccess('Item removido');
    }

    this.calcularTotais();
  }

  selecionarPrimeiroCliente() {
    if (this.clientesFiltrados.length > 0) {
      this.selecionarCliente(this.clientesFiltrados[0]);
    }
  }

  selecionarPrimeiroProduto() {
    console.log(this.estoqueFiltrado)
    if (this.estoqueFiltrado.length > 0) {
      this.selecionarProduto(this.estoqueFiltrado[0]);
    }
  }

  // Funções de Edição de Item
  abrirModalEditarItem(item: ItemPedido, index: number) {
    this.itemSendoEditado = { ...item };
    this.indexItemEditado = index;
    this.formEditarItem.patchValue({
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario
    });
    this.modalService.open(this.modalEditarItem, { centered: true });
    // focar na quantidade
    setTimeout(() => {
      document.getElementById('edit_quantidade')?.focus();
    }, 150);
  }

  fecharModalEditarItem() {
    this.modalService.dismissAll();
    this.itemSendoEditado = null;
    this.indexItemEditado = -1;
    this.formEditarItem.reset();
  }

  salvarEdicaoItem() {
    if (!this.itemSendoEditado || this.indexItemEditado === -1) return;

    const novaQuantidade = parseFloat(this.formEditarItem.value.quantidade);
    const novoPrecoUnitario = parseFloat(this.formEditarItem.value.preco_unitario);

    // Para ESTOQUE PADRAO, verificar disponibilidade
    if (this.itemSendoEditado.tipo_saida === 'ESTOQUE PADRAO') {
      const quantidadeAtual = this.itensPedido[this.indexItemEditado].quantidade;
      const produto = this.itemSendoEditado.produto;
      const quantidadeDisponivel = produto.saldo_estoque + quantidadeAtual;

      if (novaQuantidade > quantidadeDisponivel) {
        this.alert.showDanger(`Quantidade indisponível. Disponível: ${quantidadeDisponivel}`);
        return;
      }
    }

    // Para ESTOQUE PECA, apenas permitir mudança de preço
    if (this.itemSendoEditado.tipo_saida === 'ESTOQUE PECA') {
      this.itensPedido[this.indexItemEditado].preco_unitario = novoPrecoUnitario;
      this.itensPedido[this.indexItemEditado].valor_total =
        this.itensPedido[this.indexItemEditado].quantidade * novoPrecoUnitario;
    } else {
      // ESTOQUE PADRAO - pode mudar quantidade e preço
      this.itensPedido[this.indexItemEditado].quantidade = novaQuantidade;
      this.itensPedido[this.indexItemEditado].preco_unitario = novoPrecoUnitario;
      this.itensPedido[this.indexItemEditado].valor_total = novaQuantidade * novoPrecoUnitario;
    }

    this.calcularTotais();
    this.alert.showSuccess('Item atualizado');
    this.fecharModalEditarItem();
  }

  removerItemModal() {
    if (this.indexItemEditado === -1) return;

    const item = this.itensPedido[this.indexItemEditado];

    // Se for uma venda em edição e for uma peça, apenas marcar como removida
    if (!this.formPedido.value.nova_venda && item.tipo_saida === 'ESTOQUE PECA') {
      item._removido = true;
      this.calcularTotais();
      this.alert.showSuccess('Peça marcada como removida (você pode reativá-la depois)');
    } else {
      // Para novos itens ou estoque padrão, remover completamente
      this.itensPedido.splice(this.indexItemEditado, 1);
      this.calcularTotais();
      this.alert.showSuccess('Item removido');
    }

    this.fecharModalEditarItem();
  }

  calcularTotais() {
    // Somar apenas itens não removidos
    this.subtotal = this.itensPedido
      .filter(item => !item._removido)
      .reduce((sum, item) => sum + item.valor_total, 0);

    this.totalDesconto = parseFloat(this.formPedido.get('desconto')?.value) || 0;
    this.totalPedido = this.subtotal - this.totalDesconto;
    // Recalcular totais de pagamento sempre que o total do pedido mudar
    this.calcularTotaisPagamento();
  }

  calcularTotaisPagamento() {
    this.totalPago = this.parcelas.reduce((sum, p) => sum + parseFloat(p.valor.toString()), 0);
    this.totalRestante = Math.max(0, this.totalPedido - this.totalPago);
  }

  // Funções de Formas de Pagamento
  async carregarFormasPagamento() {
    try {
      const data = await this.endpointService.getFormasPagamentoNoAuth();
      this.formasPagamento = data.lista || [];
      this.formasPagamentoFiltradas = [...this.formasPagamento];
    } catch (error: any) {
      this.alert.showDanger(error);
    }
  }

  abrirModalFormaPagamento() {
    const dataVenda = this.formPedido.value.data;
    if (!dataVenda) {
      this.alert.showWarning('Informe a data da venda antes de adicionar forma de pagamento');
      return;
    }

    if (this.totalPedido <= 0) {
      this.alert.showWarning('Adicione itens à venda antes de definir a forma de pagamento');
      return;
    }

    // Verificar se "Venda na Conta" está marcado
    if (this.formPedido.value.venda_na_conta) {
      this.alert.showWarning('Não é possível adicionar formas de pagamento quando "Venda na Conta" está marcado. Desmarque "Venda na Conta" primeiro.');
      return;
    }

    this.buscaFormaPagamento = '';
    this.formasPagamentoFiltradas = [...this.formasPagamento];
    this.formFormaPagamento.reset({
      quantidade_parcelas: 1,
      valor_pagamento: this.totalRestante
    });

    this.modalService.open(this.modalFormaPagamento, { size: 'lg', scrollable: true });

    // Focar campo de busca após abrir modal
    setTimeout(() => {
      document.getElementById('busca-forma-pagamento-input')?.focus();
    }, 150);
  }

  fecharModalFormaPagamento() {
    this.modalService.dismissAll();
    this.formFormaPagamento.reset();
  }

  filtrarFormasPagamento() {
    const busca = this.buscaFormaPagamento.toLowerCase();
    this.formasPagamentoFiltradas = this.formasPagamento.filter(fp =>
      fp.nome.toLowerCase().includes(busca)
    );
  }

  selecionarFormaPagamento(forma: any) {
    this.formFormaPagamento.patchValue({
      forma_pagamento: forma,
      valor_pagamento: this.totalRestante
    });

    // Focar campo de valor após selecionar forma
    setTimeout(() => {
      document.getElementById('valor-pagamento-input')?.focus();
    }, 150);
  }

  selecionarPrimeiraFormaPagamento() {
    if (this.formasPagamentoFiltradas.length > 0) {
      this.selecionarFormaPagamento(this.formasPagamentoFiltradas[0]);
    }
  }

  limparValorPagamento() {
    this.formFormaPagamento.patchValue({ valor_pagamento: null });
    setTimeout(() => {
      document.getElementById('valor-pagamento-input')?.focus();
    }, 100);
  }

  gerarParcelas() {
    if (this.formFormaPagamento.invalid) {
      this.alert.showWarning('Preencha todos os campos');
      return;
    }

    const forma = this.formFormaPagamento.value.forma_pagamento;
    const quantidadeParcelas = parseInt(this.formFormaPagamento.value.quantidade_parcelas);
    const valorPagamento = parseFloat(this.formFormaPagamento.value.valor_pagamento);
    const dataVenda = dayjs(this.formPedido.value.data);

    if (valorPagamento <= 0) {
      this.alert.showWarning('Informe um valor válido');
      return;
    }

    const grupoId = this.proximoGrupoId++;

    // Calcular valor de cada parcela (arredondado para 2 decimais)
    const valorParcela = Math.round((valorPagamento / quantidadeParcelas) * 100) / 100;
    let somaCalculada = valorParcela * quantidadeParcelas;

    // Ajustar última parcela para compensar arredondamento
    const diferenca = Math.round((valorPagamento - somaCalculada) * 100) / 100;

    for (let i = 0; i < quantidadeParcelas; i++) {
      const diasVencimento = forma.dias_intervalo * i;
      const dataVencimento = dataVenda.add(diasVencimento, 'day').format('YYYY-MM-DD');

      let valorFinal = valorParcela;
      // Adicionar diferença na última parcela
      if (i === quantidadeParcelas - 1) {
        valorFinal = Math.round((valorFinal + diferenca) * 100) / 100;
      }

      const parcela: Parcela = {
        forma_pagamento: forma,
        data_vencimento: dataVencimento,
        valor: valorFinal,
        numero_parcela: i + 1, // Numeração dentro do grupo (1, 2, 3...)
        total_parcelas: quantidadeParcelas, // Total de parcelas do grupo
        grupo_id: grupoId
      };

      this.parcelas.push(parcela);
    }

    this.calcularTotaisPagamento();
    this.alert.showSuccess(`${quantidadeParcelas} parcela(s) adicionada(s)`);
    this.fecharModalFormaPagamento();
  }

  abrirModalEditarParcela(parcela: Parcela, index: number) {
    this.parcelaEditando = { ...parcela };
    this.indexParcelaEditando = index;
    this.formEditarParcela.patchValue({
      data_vencimento: parcela.data_vencimento,
      valor: parcela.valor
    });
    this.modalService.open(this.modalEditarParcela, { centered: true });
  }

  fecharModalEditarParcela() {
    this.modalService.dismissAll();
    this.parcelaEditando = null;
    this.indexParcelaEditando = -1;
    this.formEditarParcela.reset();
  }

  salvarEdicaoParcela() {
    if (this.formEditarParcela.invalid || this.indexParcelaEditando === -1) return;

    const novaDataVencimento = this.formEditarParcela.value.data_vencimento;
    const novoValor = parseFloat(this.formEditarParcela.value.valor);

    this.parcelas[this.indexParcelaEditando].data_vencimento = novaDataVencimento;
    this.parcelas[this.indexParcelaEditando].valor = novoValor;

    this.calcularTotaisPagamento();
    this.alert.showSuccess('Parcela atualizada');
    this.fecharModalEditarParcela();
  }

  removerParcela(index: number) {
    const parcelaRemovida = this.parcelas[index];
    const grupoId = parcelaRemovida.grupo_id;

    this.parcelas.splice(index, 1);

    // Renumerar apenas as parcelas do mesmo grupo
    const parcelasDoGrupo = this.parcelas.filter(p => p.grupo_id === grupoId);
    parcelasDoGrupo.forEach((p, i) => {
      p.numero_parcela = i + 1;
      p.total_parcelas = parcelasDoGrupo.length;
    });

    this.calcularTotaisPagamento();
    this.alert.showSuccess('Parcela removida');
  }

  removerParcelaModal() {
    if (this.indexParcelaEditando === -1) return;
    this.removerParcela(this.indexParcelaEditando);
    this.fecharModalEditarParcela();
  }

  // Funções de Grupos de Parcelas
  getGruposParcelas() {
    const grupos = new Map<number, Parcela[]>();
    this.parcelas.forEach(parcela => {
      if (!grupos.has(parcela.grupo_id)) {
        grupos.set(parcela.grupo_id, []);
      }
      grupos.get(parcela.grupo_id)!.push(parcela);
    });
    return Array.from(grupos.entries()).map(([grupo_id, parcelas]) => ({
      grupo_id,
      parcelas,
      forma_pagamento: parcelas[0].forma_pagamento,
      total: parcelas.reduce((sum, p) => sum + p.valor, 0)
    }));
  }

  abrirModalEditarGrupo(grupoId: number) {
    this.grupoEditando = grupoId;
    const parcelasGrupo = this.parcelas.filter(p => p.grupo_id === grupoId);

    if (parcelasGrupo.length === 0) return;

    // Pegar a primeira data do grupo como base
    this.formEditarParcela.patchValue({
      data_vencimento: parcelasGrupo[0].data_vencimento,
      valor: 0 // não usado para grupo
    });

    this.modalService.open(this.modalEditarGrupo, { centered: true });
  }

  fecharModalEditarGrupo() {
    this.modalService.dismissAll();
    this.grupoEditando = null;
    this.formEditarParcela.reset();
  }

  salvarEdicaoGrupo() {
    if (!this.grupoEditando) return;

    const novaDataBase = this.formEditarParcela.value.data_vencimento;
    const parcelasGrupo = this.parcelas.filter(p => p.grupo_id === this.grupoEditando);

    if (parcelasGrupo.length === 0) return;

    const forma = parcelasGrupo[0].forma_pagamento;
    const dataBase = dayjs(novaDataBase);

    parcelasGrupo.forEach((parcela, index) => {
      const parcelaIndex = this.parcelas.findIndex(p => p === parcela);
      const diasVencimento = forma.dias_intervalo * index;
      this.parcelas[parcelaIndex].data_vencimento = dataBase.add(diasVencimento, 'day').format('YYYY-MM-DD');
    });

    this.alert.showSuccess('Vencimentos do grupo atualizados');
    this.fecharModalEditarGrupo();
  }

  removerGrupo(grupoId: number) {
    this.parcelas = this.parcelas.filter(p => p.grupo_id !== grupoId);
    this.calcularTotaisPagamento();
    this.alert.showSuccess('Grupo removido');
  }

  removerGrupoModal() {
    if (this.grupoEditando === null) return;
    this.removerGrupo(this.grupoEditando);
    this.fecharModalEditarGrupo();
  }

  // Funções de Endereço de Entrega
  temEndereco(): boolean {
    const endereco = this.formPedido.value.endereco_entrega;
    return !!(endereco && (endereco.logradouro || endereco.cep || endereco.cidade));
  }

  abrirModalEndereco() {
    // Carregar dados atuais do formPedido para o formEndereco
    const enderecoAtual = this.formPedido.value.endereco_entrega;
    this.formEndereco.patchValue(enderecoAtual || {});
    this.modalService.open(this.modalEndereco, { size: 'lg', centered: true });
  }

  salvarEndereco() {
    const endereco = this.formEndereco.value;
    this.formPedido.patchValue({ endereco_entrega: endereco });
    this.modalService.dismissAll();
    this.alert.showSuccess('Endereço atualizado');
  }

  limparEndereco() {
    this.formPedido.patchValue({
      endereco_entrega: {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
      }
    });
    this.alert.showSuccess('Endereço removido');
  }

  // Funções de Observação
  temObservacao(): boolean {
    const obs = this.formPedido.value.observacao;
    return !!(obs && obs.trim().length > 0);
  }

  abrirModalObservacao() {
    const obsAtual = this.formPedido.value.observacao || '';
    this.formObservacao.patchValue({ observacao: obsAtual });
    this.modalService.open(this.modalObservacao, { size: 'lg', centered: true });
    setTimeout(() => {
      document.getElementById('observacao-textarea')?.focus();
    }, 150);
  }

  salvarObservacao() {
    const obs = this.formObservacao.value.observacao;
    this.formPedido.patchValue({ observacao: obs });
    this.modalService.dismissAll();
    if (obs && obs.trim().length > 0) {
      this.alert.showSuccess('Observação salva');
    } else {
      this.alert.showSuccess('Observação removida');
    }
  }

  limparObservacao() {
    this.formPedido.patchValue({ observacao: '' });
    this.alert.showSuccess('Observação removida');
  }

  async salvarPedido() {
    if (this.formPedido.invalid) {
      this.alert.showWarning('Preencha todos os campos obrigatórios');
      return;
    }

    // Filtrar apenas itens ativos (não removidos)
    const itensAtivos = this.itensPedido.filter(item => !item._removido);

    if (itensAtivos.length === 0) {
      this.alert.showWarning('Adicione pelo menos um item à venda');
      return;
    }

    // Validação: Se não for "Venda na Conta", precisa ter parcelas
    if (!this.formPedido.value.venda_na_conta && this.parcelas.length === 0) {
      this.alert.showWarning('Adicione pelo menos uma forma de pagamento ou marque "Venda na Conta"');
      return;
    }

    // Validação: Se não for "Venda na Conta", valores precisam bater
    if (!this.formPedido.value.venda_na_conta && this.totalPago !== this.totalPedido) {
      this.alert.showWarning('O valor das cobranças deve ser igual ao total da venda');
      return;
    }

    const pedido = {
      ...this.formPedido.value,
      itens: itensAtivos,
      parcelas: this.parcelas,
      subtotal: this.subtotal,
      total_desconto: this.totalDesconto,
      total: this.totalPedido
    };
    this.loading = true;
    try {
      let data = await this.endpointService.postPedido(pedido);
      const mensagem = pedido.fechar_venda
        ? 'Venda salva e fechada com sucesso!'
        : 'Venda salva com sucesso!';
      this.alert.showSuccess(mensagem);
      this.router.navigate(['/admin/vendas/listar']);
    } catch (error: any) {
      this.alert.showDanger(error);
    } finally {
      this.loading = false;
    }
  }


  cancelar() {
    this.router.navigate(['/admin/vendas/listar']);
  }
}
