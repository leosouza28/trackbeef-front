import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

@Component({
  selector: 'app-almoxarifado-form',
  templateUrl: './almoxarifado-form.component.html',
  styleUrls: ['./almoxarifado-form.component.scss']
})
export class AlmoxarifadoFormComponent {

  form: FormGroup;
  loading: boolean = false;

  almoxarifado_data: any = null;

  constructor(
    private fb: FormBuilder,
    private endpointService: EndpointsService,
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertService
  ) {
    this.form = this.fb.group({
      _id: this.fb.control(''),
      nome: this.fb.control('', [Validators.required]),
      principal: this.fb.control(false),
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        this.getItem(params['id']);
      }
    });
  }

  async getItem(produto_id: string) {
    if (this.loading) return;
    this.loading = true;
    try {
      let data: any = await this.endpointService.getAlmoxarifadoById(produto_id);
      this.almoxarifado_data = data;
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
      let result = await this.endpointService.postAlmoxarifado(this.form.getRawValue());
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
      this.router.navigate(['/admin/almoxarifado']);
    }
  }


}
