import { Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

@Component({
  selector: 'app-contaspagar-listar',
  templateUrl: './contaspagar-listar.component.html',
  styleUrls: ['./contaspagar-listar.component.scss']
})
export class ContaspagarListarComponent {

  data: any = { lista: [], total: 0 }
  form: FormGroup;
  loading: boolean = false;
  itemFocadoIndex: number = -1;
  isDesktop: boolean = false;
  navegacaoAtivaAntes: boolean = false;
  caixas: any[] = [];
  formas_pagamento: any[] = [];
  formasPagamentoOptions: any[] = [];

  // Opções para os filtros
  statusOptions = [
    { label: 'Pendente', value: 'PENDENTE' },
    { label: 'Paga', value: 'PAGA' },
    { label: 'Baixada', value: 'BAIXADA' }
  ];

  // Controle do modal
  cobrancaSelecionada: any = null;
  operacaoSelecionada: 'lancamento' | 'alterar' | 'excluir' | 'reverter-baixa' | null = null;
  formLancamento: FormGroup;
  formAlterar: FormGroup;
  loadingModal: boolean = false;
  lancamentosSelecionados: Set<string> = new Set();
  progressoExclusao: { atual: number, total: number } = { atual: 0, total: 0 };

  // Controle da baixa em lote
  cobrancasSelecionadasBaixa: Set<string> = new Set();
  loadingBaixa: boolean = false;
  progressoBaixa: { atual: number, total: number } = { atual: 0, total: 0 };

  @ViewChild('modalOperacoes') modalOperacoes: any;
  @ViewChild('modalConfirmacao') modalConfirmacao: any;
  @ViewChild('modalBaixa') modalBaixa: any;
  @ViewChild('modalConfirmacaoBaixa') modalConfirmacaoBaixa: any;


  constructor(
    private endpointsService: EndpointsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private alert: AlertService
  ) {
    this.form = this.fb.group({
      q: this.fb.control(""),
      page: this.fb.control("1"),
      perpage: this.fb.control("10"),
      status: this.fb.control([]),
      formas_pagamento: this.fb.control([]),
      data_inicial: this.fb.control(dayjs('2025-12-20').format("YYYY-MM-DD")),
      data_final: this.fb.control(dayjs().add(3, 'month').format("YYYY-MM-DD")),
      tipo_data: this.fb.control('vencimento')
    });

    // Formulário para lançamento de baixa
    this.formLancamento = this.fb.group({
      caixa_id: this.fb.control('', [Validators.required]),
      forma_pagamento_id: this.fb.control('', [Validators.required]),
      data_pagamento: this.fb.control('', [Validators.required]),
      valor_pago: this.fb.control('', [Validators.required, Validators.min(0.01)])
    });

    // Formulário para alterar cobrança
    this.formAlterar = this.fb.group({
      valor_juros: this.fb.control(0, [Validators.min(0)]),
      valor_desconto: this.fb.control(0, [Validators.min(0)])
    });
  }

  ngOnInit(): void {
    this.checkIfDesktop();
    this.getCaixas();

    this.getFormasPagamento().then(() => {
      this.activatedRoute.queryParams.subscribe(({ ...params }) => {
        if (Object.keys(params).length == 0) this.initializeRoute(true);
        else this.busca(params);
      })
    });
  }

  initializeRoute(init = false) {
    let q = { ...this.form.getRawValue(), unix: dayjs().unix() };
    if (q?.page) q.page = Number(q.page);
    if (q?.perpage) q.perpage = Number(q.perpage);

    if (q?.status && Array.isArray(q.status)) {
      q.status = q.status.length > 0 ? q.status.join(',') : undefined;
    }
    if (q?.formas_pagamento && Array.isArray(q.formas_pagamento)) {
      q.formas_pagamento = q.formas_pagamento.length > 0 ? q.formas_pagamento.join(',') : undefined;
    }

    if (init) this.router.navigate([window.location.pathname], { queryParams: q, replaceUrl: true })
    return q;
  }

  query() {
    this.router.navigate([window.location.pathname], {
      queryParams: { ...this.initializeRoute() }
    })
  }

  limparFiltros() {
    this.form.reset({
      q: "",
      page: "1",
      perpage: "10",
      status: [],
      formas_pagamento: []
    });
    this.query();
  }

  async getCaixas() {
    try {
      let data = await this.endpointsService.getCaixasNoAuth();
      this.endpointsService.logDev(data.lista);
      this.caixas = data.lista;
    } catch (error) {
      console.log(error);
    }
  }

  checkIfDesktop() {
    this.isDesktop = window.innerWidth >= 768;
  }

  getTotalPaginas(): number {
    const perpage = Number(this.form.value.perpage) || 10;
    return Math.ceil(Number(this.data.total) / perpage);
  }

  getPaginaAtual(): number {
    return Number(this.form.value.page) || 1;
  }

  irParaPagina(pagina: number) {
    const totalPaginas = this.getTotalPaginas();
    if (pagina < 1 || pagina > totalPaginas || this.loading) return;

    this.navegacaoAtivaAntes = this.itemFocadoIndex >= 0;

    this.router.navigate([window.location.pathname], {
      queryParams: { ...this.form.getRawValue(), page: pagina }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfDesktop();
  }

  counter_control: number = 0

  @HostListener('document:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    if (!this.isDesktop) return;

    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

    switch (event.key) {
      case 'ArrowDown':
        if (this.data.lista.length === 0) return;
        event.preventDefault();
        if (this.itemFocadoIndex < this.data.lista.length - 1) {
          this.itemFocadoIndex++;
          this.scrollToItem(this.itemFocadoIndex);
        }
        this.counter_control = 0;
        break;
      case 'ArrowUp':
        if (this.data.lista.length === 0) return;
        event.preventDefault();
        if (this.itemFocadoIndex > 0) {
          this.itemFocadoIndex--;
          this.scrollToItem(this.itemFocadoIndex);
        } else if (this.itemFocadoIndex === -1 && this.data.lista.length > 0) {
          this.itemFocadoIndex = this.data.lista.length - 1;
          this.scrollToItem(this.itemFocadoIndex);
        }
        if (this.itemFocadoIndex === 0) {
          this.counter_control++;
          if (this.counter_control >= 2) {
            this.itemFocadoIndex = -1;
            this.counter_control = 0;
            (document.getElementById('input-busca') as HTMLElement).focus();
          }
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        const proximaPagina = this.getPaginaAtual() + 1;
        if (proximaPagina <= this.getTotalPaginas()) {
          this.irParaPagina(proximaPagina);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        const paginaAnterior = this.getPaginaAtual() - 1;
        if (paginaAnterior >= 1) {
          this.irParaPagina(paginaAnterior);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (this.itemFocadoIndex >= 0 && this.itemFocadoIndex < this.data.lista.length) {
          const item = this.data.lista[this.itemFocadoIndex];
          this.abrirModalOperacoes(item);
        }
        break;
    }
  }

  scrollToItem(index: number) {
    setTimeout(() => {
      const element = document.querySelector(`[data-item-index="${index}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  }

  isItemFocado(index: number): boolean {
    return this.isDesktop && this.itemFocadoIndex === index;
  }

  getItemFocado() {
    if (this.itemFocadoIndex >= 0 && this.itemFocadoIndex < this.data.lista.length) {
      return this.data.lista[this.itemFocadoIndex];
    }
    return null;
  }

  focarPrimeiroItem() {
    if (this.data.lista.length === 0) return;
    this.itemFocadoIndex = 0;
    this.scrollToItem(0);
    (document.getElementById('input-busca') as HTMLElement).blur();
  }
  
  async busca(q: any) {
    if (this.loading) return;
    this.loading = true;
    try {
      const queryParams = { ...q };
      if (queryParams.status && typeof queryParams.status === 'string') {
        queryParams.status = queryParams.status.split(',');
      }
      if (queryParams.formas_pagamento && typeof queryParams.formas_pagamento === 'string') {
        queryParams.formas_pagamento = queryParams.formas_pagamento.split(',');
      }

      for (let i in queryParams) this.form.get(i)?.setValue(queryParams[i]);
      let values = this.form.getRawValue();

      const apiParams: any = {
        q: values.q,
        page: values.page,
        perpage: values.perpage
      };

      if (values.status && values.status.length > 0) {
        apiParams.status = values.status.join(',');
      }
      if (values.formas_pagamento && values.formas_pagamento.length > 0) {
        apiParams.formas_pagamento = values.formas_pagamento.join(',');
      }

      let data: any = await this.endpointsService.getContasPagar(apiParams);
      this.endpointsService.logDev(data);
      this.data = data;

      if (this.navegacaoAtivaAntes && this.data.lista.length > 0) {
        this.itemFocadoIndex = 0;
        setTimeout(() => this.scrollToItem(0), 100);
      } else {
        this.itemFocadoIndex = -1;
      }

      this.navegacaoAtivaAntes = false;
    } catch (error) {
      console.log("Error", error);
    }
    this.loading = false;
  }

  getValorJaPago(item: any): number {
    if (!item?.lancamentos || item.lancamentos.length === 0) {
      return 0;
    }
    return item.valor_pago || 0;
  }

  getValorRestante(item: any): number {
    const valorTotal = item?.valor_total || 0;
    const valorPago = this.getValorJaPago(item);
    return Math.max(0, valorTotal - valorPago);
  }

  async getFormasPagamento() {
    try {
      let data = await this.endpointsService.getFormasPagamentoNoAuth();
      this.formas_pagamento = data.lista;

      this.formasPagamentoOptions = this.formas_pagamento.map(fp => ({
        label: fp.nome,
        value: fp._id
      }));
    } catch (error) {
      console.log(error);
    }
  }

  abrirModalOperacoes(item: any) {
    this.cobrancaSelecionada = item;
    this.operacaoSelecionada = null;
    this.lancamentosSelecionados.clear();

    const caixaPrincipal = this.caixas.find(c => c.principal === true);
    console.log(this.formas_pagamento, item.parcela_ref);
    const formaPagamentoPadrao = this.formas_pagamento.find(fp => fp?._id == item?.parcela_ref?.forma_pagamento._id)?._id || '';
    const valorRestante = this.getValorRestante(item);

    this.formLancamento.reset({
      caixa_id: caixaPrincipal?._id || '',
      forma_pagamento_id: formaPagamentoPadrao,
      data_pagamento: dayjs().format('YYYY-MM-DD'),
      valor_pago: valorRestante
    });
    this.formAlterar.reset({ valor_juros: item?.valor_juros || 0, valor_desconto: item.valor_desconto || 0 });
    this.modalService.open(this.modalOperacoes, { size: 'lg', centered: true });
  }

  selecionarOperacao(operacao: 'lancamento' | 'alterar' | 'excluir' | 'reverter-baixa') {
    if (operacao === 'lancamento') {
      if (this.cobrancaSelecionada.status !== 'PENDENTE') {
        this.alert.showWarning('Apenas cobranças PENDENTE podem receber lançamentos');
        return;
      }
      if (this.getValorRestante(this.cobrancaSelecionada) <= 0) {
        this.alert.showWarning('Não há valor restante para lançamento');
        return;
      }
    }

    if (operacao === 'alterar') {
      if (this.cobrancaSelecionada.status !== 'PENDENTE') {
        this.alert.showWarning('Apenas cobranças PENDENTE podem ser alteradas');
        return;
      }
    }

    if (operacao === 'excluir') {
      if (!this.cobrancaSelecionada.lancamentos || this.cobrancaSelecionada.lancamentos.length === 0) {
        this.alert.showWarning('Não há lançamentos para excluir');
        return;
      }
    }

    this.operacaoSelecionada = operacao;

    setTimeout(() => {
      if (operacao === 'lancamento') {
        document.getElementById('input-valor-pago')?.focus();
      } else if (operacao === 'alterar') {
        document.getElementById('input-valor-juros')?.focus();
      }
    }, 100);
  }

  fecharModal() {
    this.modalService.dismissAll();
    this.cobrancaSelecionada = null;
    this.operacaoSelecionada = null;
  }

  async processarLancamento() {
    if (this.formLancamento.invalid) {
      this.alert.showWarning('Preencha o valor pago');
      return;
    }

    this.loadingModal = true;
    try {
      const dados = {
        caixa_id: this.formLancamento.value.caixa_id,
        forma_pagamento_id: this.formLancamento.value.forma_pagamento_id,
        data_pagamento: this.formLancamento.value.data_pagamento,
        valor_pago: this.formLancamento.value.valor_pago
      };

      await this.endpointsService.putLancamentoContasPagar(
        this.cobrancaSelecionada._id,
        dados
      );

      this.alert.showSuccess('Lançamento realizado com sucesso');
      this.fecharModal();
      this.query();
    } catch (error: any) {
      this.alert.showDanger('Erro ao processar lançamento: ' + (error.message || error));
    } finally {
      this.loadingModal = false;
    }
  }

  async processarAlteracao() {
    if (this.formAlterar.invalid) {
      this.alert.showWarning('Verifique os valores informados');
      return;
    }

    this.loadingModal = true;
    try {
      const dados = {
        valor_juros: this.formAlterar.value.valor_juros || 0,
        valor_desconto: this.formAlterar.value.valor_desconto || 0
      };

      await this.endpointsService.putAlterarContasPagar(
        this.cobrancaSelecionada._id,
        dados
      );

      this.alert.showSuccess('Cobrança alterada com sucesso');
      this.fecharModal();
      this.query();
    } catch (error: any) {
      this.alert.showDanger('Erro ao alterar cobrança: ' + (error.message || error));
    } finally {
      this.loadingModal = false;
    }
  }

  getValorTotalComAlteracoes(): number {
    if (!this.cobrancaSelecionada) return 0;

    const valorOriginal = this.cobrancaSelecionada.valor_bruto || 0;
    const juros = this.formAlterar.value.valor_juros || 0;
    const desconto = this.formAlterar.value.valor_desconto || 0;

    return valorOriginal + juros - desconto;
  }

  toggleLancamentoSelecionado(lancamentoId: string) {
    if (this.lancamentosSelecionados.has(lancamentoId)) {
      this.lancamentosSelecionados.delete(lancamentoId);
    } else {
      this.lancamentosSelecionados.add(lancamentoId);
    }
  }

  isLancamentoSelecionado(lancamentoId: string): boolean {
    return this.lancamentosSelecionados.has(lancamentoId);
  }

  selecionarTodosLancamentos() {
    const lancamentosDisponiveis = this.cobrancaSelecionada.lancamentos.filter((lanc: any) => !lanc.estornado);

    if (this.lancamentosSelecionados.size === lancamentosDisponiveis.length) {
      this.lancamentosSelecionados.clear();
    } else {
      this.lancamentosSelecionados.clear();
      lancamentosDisponiveis.forEach((lanc: any) => {
        this.lancamentosSelecionados.add(lanc._id);
      });
    }
  }

  async processarExclusaoLancamentos() {
    if (this.lancamentosSelecionados.size === 0) {
      this.alert.showWarning('Selecione ao menos um lançamento para excluir');
      return;
    }

    try {
      await this.modalService.open(this.modalConfirmacao, { centered: true }).result;
    } catch {
      return;
    }

    this.loadingModal = true;
    const lancamentosArray = Array.from(this.lancamentosSelecionados);
    this.progressoExclusao = { atual: 0, total: lancamentosArray.length };

    try {
      for (let i = 0; i < lancamentosArray.length; i++) {
        const lancamentoId = lancamentosArray[i];
        this.progressoExclusao.atual = i + 1;

        await this.endpointsService.estornaLancamentoContasPagar(
          this.cobrancaSelecionada._id,
          lancamentoId
        );
      }

      this.alert.showSuccess(`${lancamentosArray.length} lançamento(s) excluído(s) com sucesso`);
      this.fecharModal();
      this.query();
    } catch (error: any) {
      this.alert.showDanger('Erro ao excluir lançamentos: ' + (error.message || error));
    } finally {
      this.loadingModal = false;
      this.progressoExclusao = { atual: 0, total: 0 };
      this.lancamentosSelecionados.clear();
    }
  }

  async processarReversaoBaixa() {
    try {
      this.loadingModal = true;
      await this.endpointsService.reverterBaixaContasPagar(this.cobrancaSelecionada._id);
      this.alert.showSuccess('Baixa revertida com sucesso!');
      this.modalService.dismissAll();
      this.query();
    } catch (error: any) {
      this.alert.showDanger('Erro ao reverter baixa: ' + (error.message || error));
    } finally {
      this.loadingModal = false;
    }
  }

  getCobrancasPendentes(): any[] {
    return this.data.lista.filter((item: any) => item.status === 'PENDENTE');
  }

  abrirModalBaixa() {
    const pendentes = this.getCobrancasPendentes();
    if (pendentes.length === 0) {
      this.alert.showWarning('Não há cobranças pendentes na lista atual');
      return;
    }
    this.cobrancasSelecionadasBaixa.clear();
    this.modalService.open(this.modalBaixa, { size: 'xl', fullscreen: true, scrollable: true, backdrop: 'static' });
  }

  toggleCobrancaBaixa(cobrancaId: string) {
    if (this.cobrancasSelecionadasBaixa.has(cobrancaId)) {
      this.cobrancasSelecionadasBaixa.delete(cobrancaId);
    } else {
      this.cobrancasSelecionadasBaixa.add(cobrancaId);
    }
  }

  isCobrancaSelecionadaBaixa(cobrancaId: string): boolean {
    return this.cobrancasSelecionadasBaixa.has(cobrancaId);
  }

  selecionarTodasCobrancasBaixa() {
    const pendentes = this.getCobrancasPendentes();
    if (this.cobrancasSelecionadasBaixa.size === pendentes.length) {
      this.cobrancasSelecionadasBaixa.clear();
    } else {
      this.cobrancasSelecionadasBaixa.clear();
      pendentes.forEach((cob: any) => {
        this.cobrancasSelecionadasBaixa.add(cob._id);
      });
    }
  }

  getTotalValorBaixa(): number {
    const pendentes = this.getCobrancasPendentes();
    let total = 0;
    this.cobrancasSelecionadasBaixa.forEach(id => {
      const cob = pendentes.find((c: any) => c._id === id);
      if (cob) {
        total += this.getValorRestante(cob);
      }
    });
    return total;
  }

  async processarBaixaEmLote() {
    if (this.cobrancasSelecionadasBaixa.size === 0) {
      this.alert.showWarning('Selecione ao menos uma cobrança para dar baixa');
      return;
    }

    try {
      await this.modalService.open(this.modalConfirmacaoBaixa, { centered: true }).result;
    } catch {
      return;
    }

    this.loadingBaixa = true;
    const cobrancasArray = Array.from(this.cobrancasSelecionadasBaixa);
    this.progressoBaixa = { atual: 0, total: cobrancasArray.length };

    try {
      for (let i = 0; i < cobrancasArray.length; i++) {
        const cobrancaId = cobrancasArray[i];
        this.progressoBaixa.atual = i + 1;

        await this.endpointsService.darBaixaContasPagar(cobrancaId);
      }

      this.alert.showSuccess(`Baixa realizada em ${cobrancasArray.length} cobrança(s) com sucesso`);
      this.modalService.dismissAll();
      this.cobrancasSelecionadasBaixa.clear();
      this.query();
    } catch (error: any) {
      this.alert.showDanger('Erro ao processar baixa: ' + (error.message || error));
    } finally {
      this.loadingBaixa = false;
      this.progressoBaixa = { atual: 0, total: 0 };
    }
  }

}
