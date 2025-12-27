import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

@Component({
  selector: 'app-vendas-listar',
  templateUrl: './vendas-listar.component.html',
  styleUrls: ['./vendas-listar.component.scss']
})
export class VendasListarComponent {

  data: any = { lista: [], total: 0 }
  form: FormGroup;
  loading: boolean = false;
  vendaSelecionada: any = null;

  @ViewChild('modalConfirmacaoVoltar') modalConfirmacaoVoltar: any;
  @ViewChild('modalConfirmacaoCancelar') modalConfirmacaoCancelar: any;

  constructor(
    private endpointsService: EndpointsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private router: Router,
    private modalService: NgbModal
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
    let q = { ...this.form.getRawValue() };
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
      let data: any = await this.endpointsService.getPedidos({ ...values });
      this.endpointsService.logDev(data)
      this.data = data;
    } catch (error) {
      console.log("Error", error);
    }
    this.loading = false;
  }

  async voltarVenda(item: any) {
    this.vendaSelecionada = item;
    try {
      await this.modalService.open(this.modalConfirmacaoVoltar, { centered: true }).result;
    } catch {
      return;
    }

    this.loading = true;
    try {
      // Aqui você pode implementar a chamada para o endpoint de cancelamento
      await this.endpointsService.desfazerProcessamentoPedido(item._id);
      this.alertService.showSuccess('Venda voltada com sucesso!');
      // Após cancelar, recarrega a lista
    } catch (error: any) {
      this.alertService.showDanger(error);
    } finally {
      this.loading = false;
      this.vendaSelecionada = null;
      this.busca(this.form.getRawValue());
    }
  }

  async cancelarVenda(item: any) {
    this.vendaSelecionada = item;
    try {
      await this.modalService.open(this.modalConfirmacaoCancelar, { centered: true }).result;
    } catch {
      return;
    }

    try {
      this.loading = true;
      // Aqui você pode implementar a chamada para o endpoint de cancelamento
      await this.endpointsService.cancelarPedido(item._id);
      this.alertService.showSuccess('Venda cancelada com sucesso!');
      // Após cancelar, recarrega a lista
    } catch (error: any) {
      this.alertService.showDanger(error);
    } finally {
      this.loading = false;
      this.vendaSelecionada = null;
      this.busca(this.form.getRawValue());
    }
  }

}
