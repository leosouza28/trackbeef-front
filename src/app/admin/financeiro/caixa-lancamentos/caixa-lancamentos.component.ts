import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

@Component({
  selector: 'app-caixa-lancamentos',
  templateUrl: './caixa-lancamentos.component.html',
  styleUrls: ['./caixa-lancamentos.component.scss']
})
export class CaixaLancamentosComponent implements OnInit {

  data: any = { lista: [], total: 0 };
  form: FormGroup;
  loading: boolean = false;
  caixaId: string = '';
  caixa: any = null;

  // Filtros
  tipoLancamentoOptions = [
    { label: 'Entrada', value: 'ENTRADA' },
    { label: 'Saída', value: 'SAIDA' },
    { label: 'Transferência', value: 'TRANSFERENCIA' }
  ];

  constructor(
    private endpointsService: EndpointsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alert: AlertService
  ) {
    this.form = this.fb.group({
      busca: this.fb.control(''),
      page: this.fb.control('1'),
      perpage: this.fb.control('20'),
      data_inicial: this.fb.control(dayjs().subtract(1, 'month').format('YYYY-MM-DD')),
      data_final: this.fb.control(dayjs().format('YYYY-MM-DD')),
      tipo: this.fb.control([])
    });
  }

  ngOnInit(): void {
    // Pegar o ID do caixa da rota
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.caixaId = params['id'];
        this.getCaixaInfo();
        
        // Verificar query params
        this.activatedRoute.queryParams.subscribe(queryParams => {
          if (Object.keys(queryParams).length === 0) {
            this.initializeRoute(true);
          } else {
            this.busca(queryParams);
          }
        });
      } else {
        this.alert.showDanger('ID do caixa não informado');
        this.router.navigate(['/admin/financeiro/caixa/listar']);
      }
    });
  }

  async getCaixaInfo() {
    try {
      this.caixa = await this.endpointsService.getCaixaById(this.caixaId);
    } catch (error: any) {
      this.alert.showDanger('Erro ao carregar informações do caixa: ' + (error.message || error));
    }
  }

  initializeRoute(init = false) {
    const queryParams = { ...this.form.getRawValue(), unix: dayjs().unix() };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  async busca(params: any) {
    this.loading = true;
    
    // Atualizar o form com os params
    this.form.patchValue(params, { emitEvent: false });

    try {
      const filtros = {
        perpage: params.perpage || 20,
        page: params.page || 1,
        busca: params.busca || '',
        data_inicial: params.data_inicial,
        data_final: params.data_final,
        tipo: params.tipo
      };

      this.data = await this.endpointsService.getCaixasLancamentosById(this.caixaId, filtros);
    } catch (error: any) {
      this.alert.showDanger('Erro ao buscar lançamentos: ' + (error.message || error));
      this.data = { lista: [], total: 0 };
    } finally {
      this.loading = false;
    }
  }

  query() {
    const queryParams = { ...this.form.getRawValue(), page: '1', unix: dayjs().unix() };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  limparFiltros() {
    this.form.patchValue({
      busca: '',
      page: '1',
      perpage: '20',
      data_inicial: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
      data_final: dayjs().format('YYYY-MM-DD'),
      tipo: []
    });
    this.query();
  }

  voltar() {
    this.router.navigate(['/admin/financeiro/caixa/listar']);
  }

  // Agrupar lançamentos por data
  getLancamentosPorData(): any[] {
    if (!this.data.lista || this.data.lista.length === 0) return [];

    const grupos: any = {};

    this.data.lista.forEach((lancamento: any) => {
      const data = lancamento.data.split('T')[0]; // Pega só a parte da data
      if (!grupos[data]) {
        grupos[data] = {
          data: data,
          dataFormatada: dayjs(data).format('DD/MM/YYYY'),
          diaSemana: this.getDiaSemana(lancamento.data),
          lancamentos: [],
          totalEntradas: 0,
          totalSaidas: 0,
          totalGeral: 0
        };
      }
      grupos[data].lancamentos.push(lancamento);

      // Calcular totais
      const valor = lancamento.valor || 0;
      if (lancamento.tipo_operacao === 'ENTRADA') {
        grupos[data].totalEntradas += valor;
      } else if (lancamento.tipo_operacao === 'SAIDA') {
        grupos[data].totalSaidas += Math.abs(valor);
      }
      grupos[data].totalGeral += valor;
    });

    // Converter para array e ordenar por data decrescente
    return Object.values(grupos).sort((a: any, b: any) => {
      return dayjs(b.data).valueOf() - dayjs(a.data).valueOf();
    });
  }

  getDiaSemana(data: string): string {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[dayjs(data).day()];
  }

  getConsolidadoOperacao(): any[] {
    return this.data.consolidado_operacao || [];
  }

  getConsolidadoDescricao(): any[] {
    return this.data.consolidado_descricao || [];
  }

  getTotalConsolidado(consolidado: any[]): number {
    return consolidado.reduce((total, item) => total + (item.valor || 0), 0);
  }

}
