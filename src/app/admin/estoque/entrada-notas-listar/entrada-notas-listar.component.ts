import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

@Component({
  selector: 'app-entrada-notas-listar',
  templateUrl: './entrada-notas-listar.component.html',
  styleUrls: ['./entrada-notas-listar.component.scss']
})
export class EntradaNotasListarComponent {

  data: any = { lista: [], total: 0 }
  form: FormGroup;
  loading: boolean = false;

  // Modal de detalhes
  notaSelecionada: any = null;
  loadingModal: boolean = false;
  
  // Modal de cancelamento
  motivoCancelamento: string = '';
  loadingCancelamento: boolean = false;
  cancelarCobrancas: boolean = false;
  removerEstoque: boolean = false;

  constructor(
    private endpointsService: EndpointsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      q: this.fb.control(""),
      page: this.fb.control("1"),
      perpage: this.fb.control("10"),
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(({ ...params }) => {
      if (Object.keys(params).length == 0) this.initializeRoute(true);
      else this.busca(params);
    })
  }

  initializeRoute(init = false) {
    let q = { ...this.form.getRawValue(), unix: Date.now() };
    if (q?.page) q.page = Number(q.page);
    if (q?.perpage) q.perpage = Number(q.perpage);
    if (init) this.router.navigate([window.location.pathname], { queryParams: q, replaceUrl: true })
    return q;
  }

  query() {
    this.router.navigate([window.location.pathname], {
      queryParams: { ...this.initializeRoute() }
    })
  }

  async busca(q: any) {
    if (this.loading) return;
    this.loading = true;
    try {
      for (let i in q) this.form.get(i)?.setValue(q[i]);
      let values = this.form.getRawValue();
      let data: any = await this.endpointsService.getEntradasNotas({ ...values });
      this.endpointsService.logDev(data);
      this.data = data;
    } catch (error) {
      console.log("Error", error);
    }
    this.loading = false;
  }

  async abrirDetalhes(nota: any, content: any) {
    this.loadingModal = true;
    this.notaSelecionada = null;

    this.modalService.open(content, {
      size: 'xl',
      scrollable: true,
      backdrop: 'static'
    });

    try {
      const detalhes: any = await this.endpointsService.getEntradaNotaById(nota._id);
      this.notaSelecionada = detalhes;
    } catch (error) {
      console.log('Error', error);
      this.modalService.dismissAll();
    }
    this.loadingModal = false;
  }

  fecharModal() {
    this.modalService.dismissAll();
    this.notaSelecionada = null;
  }

  editarNota() {
    if (this.notaSelecionada) {
      this.modalService.dismissAll();
      this.router.navigate(['/admin/notas-entradas/form'], {
        queryParams: { id: this.notaSelecionada._id }
      });
    }
  }

  async excluirNota(modalConfirm: any) {
    if (!this.notaSelecionada) return;

    // Abrir modal de confirmação
    this.modalService.open(modalConfirm, { centered: true }).result.then(
      async (result) => {
        if (result === 'confirm') {
          this.loadingModal = true;
          try {
            await this.endpointsService.deleteEntradaNota(this.notaSelecionada._id);
            this.alertService.showSuccess('Nota excluída com sucesso!');
            this.fecharModal();
            this.query();
          } catch (error: any) {
            this.alertService.showDanger(error);
          }
          this.loadingModal = false;
        }
      },
      () => { }
    );
  }

  abrirModalCancelarFechamento(modalCancelar: any) {
    this.motivoCancelamento = '';
    this.cancelarCobrancas = false;
    this.removerEstoque = false;
    this.modalService.open(modalCancelar, { 
      centered: true, 
      size: 'lg',
      backdrop: 'static'
    });
  }

  async confirmarCancelamento(modal: any) {
    if (!this.motivoCancelamento || this.motivoCancelamento.trim() === '') {
      this.alertService.showWarning('É obrigatório informar o motivo do cancelamento');
      return;
    }

    this.loadingCancelamento = true;
    try {
      await this.endpointsService.cancelarFechamentoNota(this.notaSelecionada._id, { 
        motivo: this.motivoCancelamento.trim(),
        cancelarCobrancas: this.cancelarCobrancas,
        removerEstoque: this.removerEstoque
      });
      
      let mensagem = 'Fechamento da nota cancelado com sucesso!';
      if (!this.cancelarCobrancas || !this.removerEstoque) {
        const pendencias = [];
        if (!this.cancelarCobrancas) pendencias.push('cobranças');
        if (!this.removerEstoque) pendencias.push('produtos do estoque');
        mensagem += ` Lembre-se de excluir manualmente: ${pendencias.join(' e ')}.`;
      }
      
      this.alertService.showSuccess(mensagem);
      modal.close();
      this.fecharModal();
      this.query();
    } catch (error: any) {
      this.alertService.showDanger(error);
    }
    this.loadingCancelamento = false;
  }

}
