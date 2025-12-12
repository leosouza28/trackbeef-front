import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { EndpointsService } from 'src/app/services/endpoints.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-monitorar-pixes',
  templateUrl: './monitorar-pixes.component.html',
  styleUrls: ['./monitorar-pixes.component.scss']
})
export class MonitorarPixesComponent {
  data: any = { lista: [], total: 0 }
  form: FormGroup;
  loading: boolean = false;
  perpageOptions = [10, 20, 50, 100, 1000];
  selectedPix: any = null;
  savingStep: boolean = false;
  stepsForm!: FormGroup;

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
      perpage: this.fb.control("100"),
      busca: this.fb.control(""),
      data: this.fb.control(dayjs().format('YYYY-MM-DD')),
      tipo_data: this.fb.control("pix"), // 'pix' ou 'caixa'
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(({ ...params }) => {
      if (Object.keys(params).length == 0) this.initializeRoute(true);
      else this.busca(params);
    })
  }

  initializeRoute(init = false) {
    let q = { ...this.form.getRawValue(), unix: dayjs().unix() };
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
      let values: any = this.form.getRawValue();
      let data: any = await this.endpointsService.getRecebimentos({ ...values });
      console.log(data);
      this.data = data;
    } catch (error) {
      console.log("Error", error);
    }
    this.loading = false;
  }

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  formatarData(data: string): string {
    return dayjs(data).format('DD/MM/YYYY HH:mm:ss');
  }

  formatarDocumento(pix: any): string {
    if (pix.pagador?.cpf) {
      const cpf = pix.pagador.cpf;
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (pix.pagador?.cnpj) {
      const cnpj = pix.pagador.cnpj;
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return 'N/A';
  }

  getTipoDocumento(pix: any): string {
    return pix.pagador?.cpf ? 'CPF' : 'CNPJ';
  }

  openPixModal(content: any, pix: any) {
    this.selectedPix = pix;
    this.initStepsForm();
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  initStepsForm() {
    this.stepsForm = this.fb.group({
      classificacao: this.fb.control(this.selectedPix?.classificacao || ''),
      data_caixa: this.fb.control(this.selectedPix?.data_caixa ?  this.selectedPix.data_caixa.split("T")[0] : dayjs().format('YYYY-MM-DD')),
      cupom_fiscal_emitido: this.fb.control(this.selectedPix?.cupom_fiscal_emitido || false),
      nota_fiscal_emitida: this.fb.control(this.selectedPix?.nota_fiscal_emitida || false),
      nota_baixada_sistema: this.fb.control(this.selectedPix?.nota_baixada_sistema || false),
    });
  }

  getTotalPages(): number {
    const perpage = Number(this.form.get('perpage')?.value);
    return Math.ceil(this.data.total / perpage);
  }

  getCurrentPage(): number {
    return Number(this.form.get('page')?.value) || 1;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.getTotalPages()) return;
    this.form.get('page')?.setValue(page.toString());
    this.query();
  }

  changePerPage() {
    this.form.get('page')?.setValue('1');
    this.query();
  }

  async saveSteps() {
    if (!this.selectedPix || this.savingStep || !this.stepsForm.valid) return;

    this.savingStep = true;
    try {
      const formData = this.stepsForm.getRawValue();

      // Aqui você vai chamar o endpoint para salvar
      await this.endpointsService.setRecebimentos({...formData, _id: this.selectedPix._id});
      console.log('Salvando dados:', formData);

      // Atualizar toda a lista
      this.busca(this.initializeRoute());

      // Fechar o modal
      this.modalService.dismissAll();
      this.alert.showSuccess('Dados salvos com sucesso!');

    } catch (error: any) {
      this.alert.showDanger(error);
    }
    this.savingStep = false;
  }

  getStepsProgress(): number {
    if (!this.selectedPix) return 0;

    let completed = 0;
    let total = 4;

    if (this.selectedPix.classificacao) completed++;
    if (this.selectedPix.data_caixa) completed++;
    if (this.selectedPix.cupom_fiscal_emitido || this.selectedPix.nota_fiscal_emitida) completed++;
    if (this.selectedPix.nota_baixada_sistema) completed++;

    return Math.round((completed / total) * 100);
  }

  getPixStepsStatus(pix: any): { completed: number, total: number } {
    let completed = 0;
    const total = 4;

    if (pix.classificacao) completed++;
    if (pix.data_caixa) completed++;
    if (pix.cupom_fiscal_emitido || pix.nota_fiscal_emitida) completed++;
    if (pix.nota_baixada_sistema) completed++;

    return { completed, total };
  }

  onTipoDocumentoChange(tipo: 'cupom' | 'nota') {
    const cupomValue = this.stepsForm.get('cupom_fiscal_emitido')?.value;
    const notaValue = this.stepsForm.get('nota_fiscal_emitida')?.value;

    if (tipo === 'cupom') {
      // Se já está marcado, desmarca. Senão marca e desmarca nota
      this.stepsForm.patchValue({
        cupom_fiscal_emitido: !cupomValue,
        nota_fiscal_emitida: false
      });
    } else {
      // Se já está marcado, desmarca. Senão marca e desmarca cupom
      this.stepsForm.patchValue({
        cupom_fiscal_emitido: false,
        nota_fiscal_emitida: !notaValue
      });
    }
  }

  onClassificacaoChange(value: string) {
    const currentValue = this.stepsForm.get('classificacao')?.value;
    // Se clicar no mesmo valor, desmarca
    if (currentValue === value) {
      this.stepsForm.patchValue({ classificacao: '' });
    } else {
      this.stepsForm.patchValue({ classificacao: value });
    }
  }

}
