import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-vendas-visualizacao',
  templateUrl: './vendas-visualizacao.component.html',
  styleUrls: ['./vendas-visualizacao.component.scss']
})
export class VendasVisualizacaoComponent {

  loading: boolean = false;
  venda: any = null;
  gerandoPDF: boolean = false;
  isMobile: boolean = false;

  constructor(
    private endpointService: EndpointsService, 
    private router: Router, 
    private route: ActivatedRoute, 
    private alert: AlertService,
    private reportService: ReportService
  ) {
    this.isMobile = this.checkIfMobile();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        this.getItem(params['id']);
      }
    });
  }

  async getItem(id: string) {
    if (this.loading) return;
    this.loading = true;
    try {
      let data: any = await this.endpointService.getPedidoById(id, { detalhado: 1 });
      this.venda = data;
      console.log(JSON.stringify(data, null, 2));
    } catch (error: any) {
      this.alert.showDanger(error);
    }
    this.loading = false;
  }

  async gerarPDFA4() {
    if (this.gerandoPDF || !this.venda) return;
    
    this.gerandoPDF = true;
    try {
      const empresaData = this.venda.empresa || {
        nome: 'Meu Negócio'
      };
      
      await this.reportService.gerarRelatorioVendaA4(this.venda);
      this.alert.showSuccess('PDF gerado com sucesso!');
    } catch (error: any) {
      this.alert.showDanger('Erro ao gerar PDF: ' + error.message);
    }
    this.gerandoPDF = false;
  }

  async gerarPDFBobina80mm() {
    if (this.gerandoPDF || !this.venda) return;
    
    this.gerandoPDF = true;
    try {
      const empresaData = this.venda.empresa || {
        nome: 'Meu Negócio'
      };
      
      await this.reportService.gerarRelatorioVendaBobina80mm(this.venda);
      this.alert.showSuccess('PDF gerado com sucesso!');
    } catch (error: any) {
      this.alert.showDanger('Erro ao gerar PDF: ' + error.message);
    }
    this.gerandoPDF = false;
  }

  checkIfMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  }
  
  back() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/admin/vendas']);
    }
  }




}
