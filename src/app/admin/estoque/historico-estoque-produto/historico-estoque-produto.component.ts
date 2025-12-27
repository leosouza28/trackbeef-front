import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

@Component({
  selector: 'app-historico-estoque-produto',
  templateUrl: './historico-estoque-produto.component.html',
  styleUrls: ['./historico-estoque-produto.component.scss']
})
export class HistoricoEstoqueProdutoComponent implements OnDestroy {

  form!: FormGroup;
  loading: boolean = false;
  data: any = null;

  interval: any = null;

  constructor(private endpointService: EndpointsService, private router: Router, private route: ActivatedRoute, private alert: AlertService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params['id']) {
        this.getItem(params['id'], params['almoxarifado']);
      }
    });
  }
  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async getItem(produto_id: string, almoxarifado_id: string, silent = false) {
    if (this.loading) return;
    if (!silent) this.loading = true;
    console.log("looping...");
    try {
      let data: any = await this.endpointService.getHistoricoProduto(produto_id, almoxarifado_id);
      this.data = data;
    } catch (error: any) {
      this.alert.showDanger(error);
    } finally {
      if (!silent) this.loading = false;
      if (!this.interval) {
        console.log("creating loop...");
        // Create loop
        this.interval = setInterval(() => {
          this.getItem(produto_id, almoxarifado_id, true);
        }, 5000);
      }
    }
  }


}
