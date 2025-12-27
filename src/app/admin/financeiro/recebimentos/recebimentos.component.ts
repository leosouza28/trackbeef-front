import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

@Component({
  selector: 'app-recebimentos',
  templateUrl: './recebimentos.component.html',
  styleUrls: ['./recebimentos.component.scss']
})
export class RecebimentosComponent implements OnInit {

  form!: FormGroup;
  loading: boolean = false;
  painelData: any = null;

  constructor(
    private endpointService: EndpointsService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private router: Router,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.init();
  }

  async init() {
    this.loading = true;
    try {
      this.painelData = await this.endpointService.getPainelRecebimentos();
    } catch (error: any) {
      this.alertService.showDanger(error);
    } finally {
      this.loading = false;
    }
  }

  verDetalhesCliente(clienteId: string) {
    this.router.navigate(['/admin/financeiro/recebimentos', clienteId, 'listar']);
  }

}
