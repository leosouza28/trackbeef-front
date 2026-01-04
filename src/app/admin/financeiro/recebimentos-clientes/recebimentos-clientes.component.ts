import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';
import { ReportService } from 'src/app/services/report.service';
import dayjs from 'dayjs';

@Component({
  selector: 'app-recebimentos-clientes',
  templateUrl: './recebimentos-clientes.component.html',
  styleUrls: ['./recebimentos-clientes.component.scss']
})
export class RecebimentosClientesComponent {

  form!: FormGroup;
  loading: boolean = false;
  painelData: any = null;
  vendas: any[] = [];
  expandedGroups: Set<string> = new Set();
  formasPagamento: any[] = [];
  formLancamento!: FormGroup;
  salvandoLancamento: boolean = false;
  recebimentoParaExcluir: any = null;
  excluindoRecebimento: boolean = false;
  recebimentoSelecionado: any = null;
  processandoCompartilhamento: boolean = false;
  formatoCompartilhamento: string = '';

  constructor(
    private endpointService: EndpointsService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private router: Router,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private reportService: ReportService
  ) {
    this.createForm();
  }

  createForm() {
    this.formLancamento = this.fb.group({
      data_pagamento: [dayjs().format('YYYY-MM-DD'), Validators.required],
      forma_pagamento_id: ['', Validators.required],
      valor: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.getItem(params['id_cliente']);
    });
    this.getFormasPagamento();
  }

  async getItem(cliente_id: string) {
    this.loading = true;
    try {
      this.painelData = await this.endpointService.getPainelRecebimentosByCliente(cliente_id);
      this.processarVendas();
    } catch (error: any) {
      this.alertService.showDanger(error);
    } finally {
      this.loading = false;
    }
  }

  processarVendas() {
    // Os dados já vêm agrupados por data do backend
    if (this.painelData?.lista_produtos_por_data) {
      this.vendas = this.painelData.lista_produtos_por_data.map((grupo: any) => ({
        dataKey: grupo.data,
        data: grupo.venda_data,
        venda_id: grupo.venda_id,
        venda_codigo: grupo.venda_codigo,
        valor_total: grupo.valor_total,
        valor_em_aberto: grupo.valor_em_aberto,
        valor_em_atraso: grupo.valor_em_atraso,
        valor_recebido: grupo.valor_recebido,
        produtos: grupo.produtos,
        // Define status de quitação baseado nos valores
        status_quitacao: grupo.valor_em_aberto === 0 ? 'QUITADA' :
          grupo.valor_recebido > 0 ? 'PARCIAL' : 'PENDENTE'
      }));

      // Ordena por data
      this.vendas.sort((a, b) =>
        new Date(a.data).getTime() - new Date(b.data).getTime()
      );
    } else {
      this.vendas = [];
    }
  }

  verVenda(vendaId: string) {
    this.router.navigate(['/admin/vendas/visualizar'], { queryParams: { id: vendaId } });
  }

  voltarParaPainel() {
    this.router.navigate(['/admin/financeiro/recebimentos']);
  }

  agruparItensPorProduto(produtos: any[]): any[] {
    // Os produtos já vêm agrupados do backend, apenas formatamos para exibição
    return produtos.map((item: any) => {
      // Extrai os pesos das peças, se existirem
      const pesos = item.pecas && item.pecas.length > 0
        ? item.pecas.map((peca: any) => peca.peso.toFixed(2).replace('.', ','))
        : [];

      return {
        produto: item.produto,
        quantidade: item.quantidade,
        valor_total: item.valor_total,
        total_unitario: item.total_unitario,
        pesos: pesos
      };
    });
  }

  async getFormasPagamento() {
    const response: any = await this.endpointService.getFormasPagamentoNoAuth();
    this.formasPagamento = (response.lista || []).filter((fp: any) => fp.avista);
  }

  async abrirModalLancamento(content: any) {
    try {
      // Resetar form e definir valor máximo como saldo devedor
      this.formLancamento.reset({
        data_pagamento: dayjs().format('YYYY-MM-DD'),
        forma_pagamento_id: '',
        valor: this.painelData.saldo_devedor
      });

      // Definir validador de valor máximo
      this.formLancamento.get('valor')?.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(this.painelData.saldo_devedor)
      ]);
      this.formLancamento.get('valor')?.updateValueAndValidity();

      this.modalService.open(content, { size: 'md', centered: true });
    } catch (error: any) {
      this.alertService.showDanger(error);
    }
  }

  async salvarLancamento() {
    if (this.formLancamento.invalid) {
      this.alertService.showWarning('Preencha todos os campos corretamente');
      return;
    }

    this.salvandoLancamento = true;
    try {
      const data = {
        cliente_id: this.painelData.pessoa._id,
        data_pagamento: this.formLancamento.value.data_pagamento,
        forma_pagamento_id: this.formLancamento.value.forma_pagamento_id,
        valor: this.formLancamento.value.valor
      };

      await this.endpointService.postLancamentoRecebimento(data);
      this.alertService.showSuccess('Recebimento lançado com sucesso!');
      this.modalService.dismissAll();

      // Recarregar dados
      await this.getItem(this.painelData.pessoa._id);
    } catch (error: any) {
      this.alertService.showDanger(error);
    } finally {
      this.salvandoLancamento = false;
    }
  }

  toggleGroup(dataKey: string) {
    if (this.expandedGroups.has(dataKey)) {
      this.expandedGroups.delete(dataKey);
    } else {
      this.expandedGroups.add(dataKey);
    }
  }

  isGroupExpanded(dataKey: string): boolean {
    return this.expandedGroups.has(dataKey);
  }

  abrirModalExclusao(recebimento: any, content: any) {
    this.recebimentoParaExcluir = recebimento;
    this.modalService.open(content, { size: 'sm', centered: true });
  }

  abrirDetalhesRecebimento(recebimento: any, content: any) {
    this.recebimentoSelecionado = recebimento;
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  async confirmarExclusao() {
    if (!this.recebimentoParaExcluir) return;

    this.excluindoRecebimento = true;
    try {
      await this.endpointService.putEstornarLancamentoRecebimento(this.recebimentoParaExcluir._id);
      this.alertService.showSuccess('Recebimento excluído com sucesso!');
      this.modalService.dismissAll();
      this.recebimentoParaExcluir = null;

      // Recarregar dados
      await this.getItem(this.painelData.pessoa._id);
    } catch (error: any) {
      this.alertService.showDanger(error);
    } finally {
      this.excluindoRecebimento = false;
    }
  }
  async gerarPDFConta() {
    try {
      this.loading = true;

      // Buscar dados da empresa
      const empresa = await this.endpointService.getConfiguracoesEmpresa();

      // Preparar dados para o PDF
      const dadosConta = {
        cliente: this.painelData.pessoa,
        vendas: this.vendas,
        saldo_devedor: this.painelData.saldo_devedor,
        valor_total: this.painelData.valor_total,
        valor_recebido: this.painelData.valor_recebido,
        valor_total_em_aberto: this.painelData.valor_total_em_aberto,
        valor_total_em_atraso: this.painelData.valor_total_em_atraso
      };

      await this.reportService.gerarRelatorioConta(dadosConta);
      this.alertService.showSuccess('PDF gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      this.alertService.showDanger('Erro ao gerar PDF da conta');
    } finally {
      this.loading = false;
    }
  }

  abrirModalCompartilhar(content: any) {
    this.modalService.open(content, { size: 'sm', centered: true });
  }

  async compartilharConta(formato: 'pdf' | 'imagem' | 'link',) {
    // Verificar se é dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (formato === 'link') {

      let link = this.painelData.link;
      if (isMobile) {
        // Tentar compartilhar nativamente
        try {
          await navigator.share({
            title: `Conta - ${this.painelData.pessoa.nome}`,
            text: `Acompanhe a cobrança de ${this.painelData.pessoa.nome} pelo link abaixo:`,
            url: link
          });
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            console.error('Erro ao compartilhar link:', error);
            this.alertService.showDanger('Erro ao compartilhar o link da conta');
          }
          // Usuário cancelou o compartilhamento - não é erro
        }
      } else {
        // Copiar para área de transferência
        try {
          await navigator.clipboard.writeText(link);
          this.alertService.showSuccess('Link da conta copiado para a área de transferência!');
        } catch (error) {
          console.error('Erro ao copiar link:', error);
          this.alertService.showDanger('Erro ao copiar o link da conta');
        }
      }
    } else {

      this.processandoCompartilhamento = true;
      this.formatoCompartilhamento = formato === 'pdf' ? 'PDF' : 'imagem';

      try {
        // Buscar dados da empresa
        const empresa = await this.endpointService.getConfiguracoesEmpresa();

        // Preparar dados para o relatório
        const dadosConta = {
          cliente: this.painelData.pessoa,
          vendas: this.vendas,
          saldo_devedor: this.painelData.saldo_devedor,
          valor_total: this.painelData.valor_total,
          valor_recebido: this.painelData.valor_recebido,
          valor_total_em_aberto: this.painelData.valor_total_em_aberto,
          valor_total_em_atraso: this.painelData.valor_total_em_atraso
        };

        if (formato === 'pdf') {
          if (isMobile && typeof navigator.share === 'function') {
            // Gerar PDF como blob e compartilhar nativamente
            const pdfBlob = await this.reportService.gerarRelatorioContaBlob(dadosConta, 'pdf');
            await this.compartilharNativo(pdfBlob, 'conta.pdf', 'application/pdf');
          } else {
            // Download tradicional
            await this.reportService.gerarRelatorioConta(dadosConta);
          }
          this.alertService.showSuccess('PDF gerado com sucesso!');
        } else {
          // Gerar imagem
          if (isMobile && typeof navigator.share === 'function') {
            const imageBlob = await this.reportService.gerarRelatorioContaBlob(dadosConta, 'image');
            await this.compartilharNativo(imageBlob, 'conta.png', 'image/png');
          } else {
            // Download tradicional
            await this.reportService.gerarRelatorioContaImagem(dadosConta);
          }
          this.alertService.showSuccess('Imagem gerada com sucesso!');
        }

        this.modalService.dismissAll();
      } catch (error: any) {
        console.error('Erro ao gerar arquivo:', error);
        this.alertService.showDanger('Erro ao gerar arquivo para compartilhamento');
      } finally {
        this.processandoCompartilhamento = false;
        this.formatoCompartilhamento = '';
      }
    }
  }

  async compartilharNativo(blob: Blob, filename: string, mimeType: string) {
    try {
      const file = new File([blob], filename, { type: mimeType });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Conta - ${this.painelData.pessoa.nome}`,
          text: `Conta de ${this.painelData.pessoa.nome}`
        });
      } else {
        // Fallback: fazer download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
        throw error;
      }
      // Usuário cancelou o compartilhamento - não é erro
    }
  }


}