import { EndpointsService } from 'src/app/services/endpoints.service';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { SessaoService } from 'src/app/services/sessao.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import dayjs from 'dayjs';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {
  empty: boolean = false;
  loading: boolean = false;
  dashboard: any = null;

  form!: FormGroup;

  // Chart config
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  public lineChartType: ChartType = 'line';

  constructor(public sessao: SessaoService, private endpointService: EndpointsService, private fb: FormBuilder) {
    this.form = this.fb.group({
      data_inicial: this.fb.control(dayjs().startOf('month').format('YYYY-MM-DD')),
      data_final: this.fb.control(dayjs().endOf('month').format('YYYY-MM-DD')),
    })
  }

  ngOnInit(): void {
    this.getDashboardAdmin();
  }

  async getDashboardAdmin() {
    this.loading = true;
    try {
      let data: any = await this.endpointService.getDashboardAdmin({ ...this.form.getRawValue() });
      this.dashboard = data.dashboard_admin;
      this.prepareChart();
    } catch (error) {
      console.log(error);
    }
    this.loading = false;
  }

  prepareChart() {
    if (!this.dashboard?.pagamentos_diario) return;

    const labels = this.dashboard.pagamentos_diario.map((item: any) => 
      dayjs(item.data).format('DD/MM')
    );
    const valores = this.dashboard.pagamentos_diario.map((item: any) => item.total_valor);
    const transacoes = this.dashboard.pagamentos_diario.map((item: any) => item.total_pixs);

    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          data: valores,
          label: 'Valor (R$)',
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          data: transacoes,
          label: 'Quantidade',
          borderColor: '#198754',
          backgroundColor: 'rgba(25, 135, 84, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        }
      ]
    };

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor (R$)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Quantidade'
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      }
    };
  }

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  formatarDocumento(documento: string): string {
    if (documento.length === 11) {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (documento.length === 14) {
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return documento;
  }

  getTipoDocumento(documento: string): string {
    return documento.length === 11 ? 'CPF' : 'CNPJ';
  }

  query() {
    this.getDashboardAdmin();
  }

}
