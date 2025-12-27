import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

@Component({
  selector: 'app-produtos-form',
  templateUrl: './produtos-form.component.html',
  styleUrls: ['./produtos-form.component.scss']
})
export class ProdutosFormComponent implements OnInit {

  @Input() modal: NgbActiveModal | null = null;
  @Input() produtoId: string = '';

  form: FormGroup;
  loading: boolean = false;
  isModal: boolean = false;

  categorias = [
    { value: 'CARNE BOVINA', label: 'Carne Bovina' },
    { value: 'VISCERAS BOVINA', label: 'Vísceras Bovina' },
  ];

  unidades = [
    { value: 'UN', label: 'Unidade' },
    { value: 'KG', label: 'Quilograma' },
  ];

  statusOptions = [
    { value: 'ATIVO', label: 'ATIVO' },
    { value: 'INATIVO', label: 'INATIVO' }
  ];

  produto_data: any = null;

  constructor(
    private fb: FormBuilder,
    private endpointService: EndpointsService,
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertService
  ) {
    this.form = this.fb.group({
      _id: this.fb.control(''),
      sku: this.fb.control(''),
      nome: this.fb.control('', [Validators.required]),
      sigla: this.fb.control('', []),
      categoria: this.fb.control('', [Validators.required]),
      tipo_saida: this.fb.control('ESTOQUE PECA', [Validators.required]),
      calcula_rendimento_entrada_nota: this.fb.control(false),
      unidade: this.fb.control('KG', [Validators.required]),
      status: this.fb.control('ATIVO', [Validators.required]),
      custo_medio: this.fb.control(0),
      preco_custo: this.fb.control(0, [Validators.required, Validators.min(0)]),
      preco_venda: this.fb.control(0, [Validators.required, Validators.min(0)]),
      
    });
  }

  ngOnInit(): void {
    this.isModal = !!this.modal;

    if (!this.isModal) {
      this.route.queryParams.subscribe((params) => {
        if (params['id']) {
          this.getItem(params['id']);
        }
      });
    } else if (this.produtoId) {
      this.getItem(this.produtoId);
    }
  }

  async getItem(produto_id: string) {
    if (this.loading) return;
    this.loading = true;
    try {
      let data: any = await this.endpointService.getProdutoById(produto_id);
      this.produto_data = data;
      this.form.patchValue(data);
    } catch (error: any) {
      this.alert.showDanger(error);
    }
    this.loading = false;
  }

  async onSubmit() {
    if (this.loading || this.form.invalid) return;
    this.loading = true;
    try {
      let result = await this.endpointService.postProduto(this.form.getRawValue());
      this.alert.showSuccess('Operação realizada com sucesso!');
      if (this.isModal && this.modal) {
        this.modal.close(result);
      } else {
        this.back();
      }
    } catch (error: any) {
      this.alert.showDanger(error);
    }
    this.loading = false;
  }

  back() {
    if (this.isModal && this.modal) {
      this.modal.dismiss();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/admin/produtos']);
    }
  }

}
