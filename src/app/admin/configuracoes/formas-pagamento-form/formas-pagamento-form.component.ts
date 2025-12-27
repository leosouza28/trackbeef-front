import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

@Component({
  selector: 'app-formas-pagamento-form',
  templateUrl: './formas-pagamento-form.component.html',
  styleUrls: ['./formas-pagamento-form.component.scss']
})
export class FormasPagamentoFormComponent {

  form: FormGroup;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private endpointService: EndpointsService, private router: Router, private route: ActivatedRoute, private alert: AlertService) {
    this.form = this.fb.group({
      _id: this.fb.control(""),
      nome: this.fb.control("", [Validators.required]),
      avista: this.fb.control(false),
      disponivel_em: this.fb.control([], []),
      dias_intervalo: this.fb.control(1, [Validators.required]),
      status: this.fb.control('ATIVO', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.init();
    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        this.getItem(params['id']);
      }
    });
    // Detecta mudanças no campo 'avista' para ajustar 'dias_intervalo'
    this.form.get('avista')?.valueChanges.subscribe((avistaValue) => {
      if (avistaValue) {
        this.form.get('dias_intervalo')?.setValue(1);
      } else {
        this.form.get('dias_intervalo')?.enable();
        if (this.form.get('dias_intervalo')?.value === 0) {
          this.form.get('dias_intervalo')?.setValue(1);
        }
      }
    });

  }

  async init() {
    try {
    } catch (error: any) {
      this.alert.showDanger(error);
    }
  }

  async getItem(id: string) {
    if (this.loading) return;
    this.loading = true;
    try {
      let data: any = await this.endpointService.getFormaPagamentoById(id);
      this.form.patchValue({
        _id: data._id,
        nome: data.nome,
        avista: data.avista,
        dias_intervalo: data.dias_intervalo,
        status: data.status,
        disponivel_em: data.disponivel_em || [],
      });
    } catch (error: any) {
      this.alert.showDanger(error);
    }
    this.loading = false;
  }
  async onSubmit() {
    if (this.loading || this.form.invalid) return;
    this.loading = true;
    try {
      await this.endpointService.postFormaPagamento(this.form.getRawValue());
      this.alert.showSuccess('Operação realizada com sucesso!');
      this.back();
    } catch (error: any) {
      this.alert.showDanger(error);
    }
    this.loading = false;
  }

  back() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/admin/perfis']);
    }
  }

  isDisponivelEm(value: string): boolean {
    const disponivelEm = this.form.get('disponivel_em')?.value || [];
    return disponivelEm.includes(value);
  }

  toggleDisponivelEm(value: string): void {
    const disponivelEm = this.form.get('disponivel_em')?.value || [];
    const index = disponivelEm.indexOf(value);
    
    if (index > -1) {
      // Remove se já existe
      disponivelEm.splice(index, 1);
    } else {
      // Adiciona se não existe
      disponivelEm.push(value);
    }
    
    this.form.get('disponivel_em')?.setValue([...disponivelEm]);
  }

}
