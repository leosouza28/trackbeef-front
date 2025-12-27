import { Injectable } from '@angular/core';
import html2pdf from 'html2pdf.js';

@Injectable({
    providedIn: 'root'
})
export class ReportService {

    constructor() { }

    /**
     * Gera PDF a partir de um elemento HTML
     * @param element Elemento HTML ou string do seletor
     * @param filename Nome do arquivo PDF
     * @param options Opções customizadas do html2pdf
     */
    async generatePDF(element: HTMLElement | string, filename: string, options?: any) {
        const defaultOptions = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            await html2pdf().set(finalOptions).from(element).save();
            return true;
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw error;
        }
    }

    /**
     * Gera PDF de uma venda no formato A4
     * @param vendaData Dados da venda
     * @param empresaData Dados da empresa
     */
    async gerarRelatorioVendaA4(vendaData: any, empresaData: any) {
        // Converte a logo para base64 se existir
        if (empresaData?.logo) {
            try {
                empresaData.logoBase64 = await this.imageUrlToBase64(empresaData.logo);
            } catch (error) {
                console.error('Erro ao converter logo para base64:', error);
                empresaData.logoBase64 = null;
            }
        }

        // Cria um elemento temporário com o template
        const element = this.criarTemplateVendaA4(vendaData, empresaData);
        document.body.appendChild(element);

        const options: any = {
            margin: [8, 8, 8, 8],
            filename: `venda_${vendaData.codigo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                windowHeight: element.scrollHeight,
                height: element.scrollHeight
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: 'avoid-all' }
        };

        try {
            await html2pdf().set(options).from(element).save();
            document.body.removeChild(element);
            return true;
        } catch (error) {
            document.body.removeChild(element);
            console.error('Erro ao gerar relatório de venda:', error);
            throw error;
        }
    }

    /**
     * Gera PDF de uma venda no formato Bobina 80mm
     * @param vendaData Dados da venda
     * @param empresaData Dados da empresa
     */
    async gerarRelatorioVendaBobina80mm(vendaData: any, empresaData: any) {
        // Cria um elemento temporário com o template
        const element = this.criarTemplateVendaBobina80mm(vendaData, empresaData);
        document.body.appendChild(element);

        const options: any = {
            margin: [2, 2, 2, 2],
            filename: `venda_${vendaData.codigo}_80mm.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: [76, 297], orientation: 'portrait' }
        };

        try {
            await html2pdf().set(options).from(element).save();
            document.body.removeChild(element);
            return true;
        } catch (error) {
            document.body.removeChild(element);
            console.error('Erro ao gerar relatório de venda (bobina):', error);
            throw error;
        }
    }

    /**
     * Gera PDF da conta do cliente
     * @param contaData Dados da conta (vendas, saldos, cliente)
     * @param empresaData Dados da empresa
     */
    async gerarRelatorioConta(contaData: any, empresaData: any) {
        // Converte a logo para base64 se existir
        if (empresaData?.logo) {
            try {
                empresaData.logoBase64 = await this.imageUrlToBase64(empresaData.logo);
            } catch (error) {
                console.error('Erro ao converter logo para base64:', error);
                empresaData.logoBase64 = null;
            }
        }

        // Cria um elemento temporário com o template
        const element = this.criarTemplateContaCliente(contaData, empresaData);
        document.body.appendChild(element);

        const nomeCliente = contaData.cliente?.nome?.replace(/[^a-zA-Z0-9]/g, '_') || 'cliente';
        const dataAtual = new Date().toISOString().split('T')[0];

        const options: any = {
            margin: [8, 8, 8, 8],
            filename: `conta_${nomeCliente}_${dataAtual}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                windowHeight: element.scrollHeight,
                height: element.scrollHeight
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: 'avoid-all' }
        };

        try {
            await html2pdf().set(options).from(element).save();
            document.body.removeChild(element);
            return true;
        } catch (error) {
            document.body.removeChild(element);
            console.error('Erro ao gerar relatório de conta:', error);
            throw error;
        }
    }

    /**
     * Gera relatório da conta como Blob para compartilhamento
     * @param contaData Dados da conta
     * @param empresaData Dados da empresa
     * @param tipo Tipo de saída: 'pdf' ou 'image'
     */
    async gerarRelatorioContaBlob(contaData: any, empresaData: any, tipo: 'pdf' | 'image'): Promise<Blob> {
        // Converte a logo para base64 se existir
        if (empresaData?.logo) {
            try {
                empresaData.logoBase64 = await this.imageUrlToBase64(empresaData.logo);
            } catch (error) {
                console.error('Erro ao converter logo para base64:', error);
                empresaData.logoBase64 = null;
            }
        }

        // Cria um elemento temporário com o template apropriado
        const element = tipo === 'image' 
            ? this.criarTemplateContaClienteMobile(contaData, empresaData)
            : this.criarTemplateContaCliente(contaData, empresaData);
        document.body.appendChild(element);

        try {
            if (tipo === 'pdf') {
                const options: any = {
                    margin: [8, 8, 8, 8],
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2, 
                        useCORS: true,
                        windowHeight: element.scrollHeight,
                        height: element.scrollHeight
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'portrait',
                        compress: true
                    },
                    pagebreak: { mode: 'avoid-all' }
                };

                const pdf = await html2pdf().set(options).from(element).output('blob');
                document.body.removeChild(element);
                return pdf;
            } else {
                // Gerar como imagem (mobile-friendly)
                const html2canvas = (await import('html2canvas')).default;
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    width: 375,
                    windowWidth: 375,
                    windowHeight: element.scrollHeight,
                    height: element.scrollHeight
                });
                
                document.body.removeChild(element);
                
                return new Promise((resolve) => {
                    canvas.toBlob((blob) => {
                        resolve(blob!);
                    }, 'image/png', 1.0);
                });
            }
        } catch (error) {
            document.body.removeChild(element);
            console.error('Erro ao gerar blob:', error);
            throw error;
        }
    }

    /**
     * Gera relatório da conta como imagem PNG
     * @param contaData Dados da conta
     * @param empresaData Dados da empresa
     */
    async gerarRelatorioContaImagem(contaData: any, empresaData: any) {
        // Converte a logo para base64 se existir
        if (empresaData?.logo) {
            try {
                empresaData.logoBase64 = await this.imageUrlToBase64(empresaData.logo);
            } catch (error) {
                console.error('Erro ao converter logo para base64:', error);
                empresaData.logoBase64 = null;
            }
        }

        // Cria um elemento temporário com o template mobile
        const element = this.criarTemplateContaClienteMobile(contaData, empresaData);
        document.body.appendChild(element);

        const nomeCliente = contaData.cliente?.nome?.replace(/[^a-zA-Z0-9]/g, '_') || 'cliente';
        const dataAtual = new Date().toISOString().split('T')[0];

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                width: 375,
                windowWidth: 375,
                windowHeight: element.scrollHeight,
                height: element.scrollHeight
            });
            
            document.body.removeChild(element);
            
            // Converter canvas para blob e fazer download
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `conta_${nomeCliente}_${dataAtual}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            }, 'image/png', 1.0);

            return true;
        } catch (error) {
            document.body.removeChild(element);
            console.error('Erro ao gerar imagem:', error);
            throw error;
        }
    }

    /**
     * Cria o template HTML para o relatório de venda A4
     */
    private criarTemplateVendaA4(venda: any, empresa: any): HTMLElement {
        const div = document.createElement('div');
        div.style.width = '194mm'; // 210mm - 2x8mm de margem
        div.style.maxWidth = '194mm';
        div.style.padding = '0';
        div.style.backgroundColor = 'white';
        div.style.fontFamily = 'Arial, sans-serif';
        div.style.fontSize = '11px';
        div.style.color = '#333';
        div.style.boxSizing = 'border-box';
        div.style.overflow = 'hidden';

        const dataVenda = new Date(venda.data).toLocaleDateString('pt-BR');
        const dataHoraEmissao = new Date().toLocaleString('pt-BR');

        // Calcula totais
        const totalPeso = venda.itens.reduce((acc: number, item: any) =>
            acc + (item.peca?.peso || 0), 0);

        // Agrupa itens por produto quando for ESTOQUE_PECA
        const itensAgrupados = this.agruparItensPorProduto(venda.itens);
        
        // Conta total de unidades/peças (cada item da venda original é uma unidade)
        const totalUnidades = venda.itens.length;

        div.innerHTML = `
      <style>
        .report-container * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .report-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border-bottom: 2px solid #333;
          padding-bottom: 5px;
          margin-bottom: 6px;
        }
        .logo-placeholder {
          width: 120px;
          height: 80px;
          border: 2px dashed #bdc3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: #95a5a6;
          text-align: center;
          flex-shrink: 0;
        }
        .logo-img {
          width: 120px;
          height: 80px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .empresa-info {
          flex: 1;
        }
        .empresa-info h1 {
          font-size: 14px;
          color: #2c3e50;
          margin-bottom: 1px;
        }
        .empresa-info .empresa-subtitle {
          font-size: 8px;
          color: #7f8c8d;
          margin-bottom: 0.5px;
          line-height: 1.2;
        }
        .report-title {
          text-align: right;
          flex-shrink: 0;
        }
        .report-title h2 {
          font-size: 13px;
          color: #2c3e50;
          font-weight: bold;
        }
        .info-section {
          margin-bottom: 5px;
        }
        .info-section h2 {
          font-size: 10px;
          color: #2c3e50;
          border-bottom: 1px solid #bdc3c7;
          padding-bottom: 2px;
          margin-bottom: 3px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 3px;
          margin-bottom: 3px;
        }
        .info-item {
          padding: 2px;
          background-color: #f8f9fa;
          border-radius: 2px;
        }
        .info-item label {
          font-weight: bold;
          font-size: 7px;
          color: #7f8c8d;
          display: block;
          margin-bottom: 0.5px;
        }
        .info-item span {
          font-size: 8px;
          color: #2c3e50;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        .items-table th {
          background-color: #34495e;
          color: white;
          padding: 4px;
          text-align: left;
          font-size: 8px;
          font-weight: bold;
        }
        .items-table td {
          padding: 3px;
          border-bottom: 1px solid #ecf0f1;
          font-size: 8px;
        }
        .items-table tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .items-table .text-right {
          text-align: right;
        }
        .items-table .text-center {
          text-align: center;
        }
        .totals-section {
          margin-top: 8px;
          padding: 6px;
          background-color: #ecf0f1;
          border-radius: 4px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
          font-size: 10px;
        }
        .total-row.final {
          font-size: 13px;
          font-weight: bold;
          color: #27ae60;
          border-top: 2px solid #27ae60;
          padding-top: 4px;
          margin-top: 4px;
        }
        .footer {
          margin-top: 8px;
          text-align: center;
          font-size: 7px;
          color: #7f8c8d;
          border-top: 1px solid #bdc3c7;
          padding-top: 4px;
        }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 8px;
          font-weight: bold;
        }
        .badge-success {
          background-color: #27ae60;
          color: white;
        }
        .badge-info {
          background-color: #3498db;
          color: white;
        }
        .badge-warning {
          background-color: #f39c12;
          color: white;
        }
        .badge-secondary {
          background-color: #95a5a6;
          color: white;
        }
      </style>

      <div class="report-container">
        <!-- Cabeçalho -->
        <div class="report-header">
          ${empresa?.logoBase64 ? `
            <img src="${empresa.logoBase64}" alt="Logo" class="logo-img">
          ` : `
            <div class="logo-placeholder">
              LOGO<br>120x80px
            </div>
          `}
          <div class="empresa-info">
            <h1>${empresa?.nome || 'Meu Negócio'}</h1>
            ${empresa?.razao_social ? `<div class="empresa-subtitle">${empresa.razao_social}</div>` : ''}
            ${empresa?.documento ? `<div class="empresa-subtitle">Documento: ${this.formatarDocumento(empresa.documento)}</div>` : ''}
            ${empresa?.telefones && empresa.telefones.length > 0 ? `<div class="empresa-subtitle">Contato: ${empresa.telefones.map((tel: string) => this.formatarTelefone(tel)).join(' | ')}</div>` : ''}
            ${empresa?.email ? `<div class="empresa-subtitle">Email: ${empresa.email}</div>` : ''}
            ${empresa?.endereco ? `<div class="empresa-subtitle">${empresa.endereco.logradouro}${empresa.endereco.numero ? ', ' + empresa.endereco.numero : ''}${empresa.endereco.bairro ? ' - ' + empresa.endereco.bairro : ''} - ${empresa.endereco.cidade}/${empresa.endereco.estado}</div>` : ''}
          </div>
          <div class="report-title">
            <h2>VENDA</h2>
          </div>
        </div>

        <!-- Informações da Venda -->
        <div class="info-section">
          <h2>Informações da Venda</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Código da Venda:</label>
              <span>#${venda.codigo}</span>
            </div>
            <div class="info-item">
              <label>Data da Venda:</label>
              <span>${dataVenda}</span>
            </div>
            <div class="info-item">
              <label>Status:</label>
              <span class="badge badge-success">${venda.status}</span>
            </div>
            <div class="info-item">
              <label>Tipo de Venda:</label>
              <span class="badge ${venda.venda_na_conta ? 'badge-info' : 'badge-success'}">
                ${venda.venda_na_conta ? 'Na Conta' : 'À Vista'}
              </span>
            </div>
          </div>
        </div>

        <!-- Informações do Cliente -->
        <div class="info-section">
          <h2>Cliente</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Nome:</label>
              <span>${venda.cliente?.nome || '-'}</span>
            </div>
            <div class="info-item">
              <label>Documento:</label>
              <span>${venda.cliente?.documento || '-'}</span>
            </div>
          </div>
          ${venda.endereco ? `
            <div style="margin-top: 6px;">
              <label style="font-weight: bold; font-size: 9px; color: #7f8c8d;">Endereço de Entrega:</label>
              <div style="padding: 4px; background-color: #f8f9fa; border-radius: 2px; margin-top: 2px; font-size: 8px;">
                ${venda.endereco.logradouro}, ${venda.endereco.numero}
                ${venda.endereco.complemento ? ` - ${venda.endereco.complemento}` : ''}<br>
                ${venda.endereco.bairro} - ${venda.endereco.cidade}/${venda.endereco.estado} - CEP: ${venda.endereco.cep}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Itens da Venda -->
        <div class="info-section">
          <h2>Itens da Venda</h2>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40%;">Produto</th>
                <th style="width: 10%;">SKU</th>
                <th style="width: 15%;" class="text-center">Qtd/Peso</th>
                <th style="width: 15%;" class="text-right">Preço Unit.</th>
                <th style="width: 20%;" class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itensAgrupados.map((item: any) => `
                <tr>
                  <td>
                    <strong>${item.produto?.nome || '-'}</strong>
                    ${item.pesos && item.pesos.length > 0 ? `<br><div style="margin-top: 2px; font-size: 7px; color: #555;">${item.pesos.length} peça${item.pesos.length > 1 ? 's' : ''}: ${item.pesos.join(' ')}</div>` : ''}
                  </td>
                  <td>${item.produto?.sku || '-'}</td>
                  <td class="text-center">
                    <strong>${item.quantidade.toFixed(2).replace('.', ',')}</strong> ${item.unidade_saida}
                  </td>
                  <td class="text-right">
                    R$ ${this.formatarValor(item.preco_unitario)}
                  </td>
                  <td class="text-right">
                    <strong>R$ ${this.formatarValor(item.valor_total)}</strong>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Totais -->
        <div class="totals-section">
          <div class="total-row">
            <span>Quantidade de Itens:</span>
            <strong>${totalUnidades}</strong>
          </div>
          ${totalPeso > 0 ? `
            <div class="total-row">
              <span>Peso Total:</span>
              <strong>${totalPeso.toFixed(2).replace('.', ',')} kg</strong>
            </div>
          ` : ''}
          <div class="total-row">
            <span>Valor Bruto:</span>
            <strong>R$ ${this.formatarValor(venda.valor_bruto)}</strong>
          </div>
          ${venda.valor_desconto > 0 ? `
            <div class="total-row" style="color: #e74c3c;">
              <span>Desconto:</span>
              <strong>- R$ ${this.formatarValor(venda.valor_desconto)}</strong>
            </div>
          ` : ''}
          <div class="total-row final">
            <span>VALOR TOTAL:</span>
            <span>R$ ${this.formatarValor(venda.valor_liquido)}</span>
          </div>
        </div>

        ${venda.observacao ? `
          <div class="info-section">
            <h2>Observações</h2>
            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px; font-size: 11px;">
              ${venda.observacao}
            </div>
          </div>
        ` : ''}

        <!-- Rodapé -->
        <div class="footer">
          <p>Documento emitido em: ${dataHoraEmissao}</p>
          <p>TrackBeef - Sistema de Gestão de Vendas</p>
          <p>Emitido por: ${venda.criado_por?.usuario?.nome || '-'}</p>
        </div>
      </div>
    `;

        return div;
    }

    /**
     * Cria o template HTML para o relatório de venda em Bobina 80mm
     */
    private criarTemplateVendaBobina80mm(venda: any, empresa: any): HTMLElement {
        const div = document.createElement('div');
        div.style.width = '76mm';
        div.style.padding = '2mm';
        div.style.backgroundColor = 'white';
        div.style.fontFamily = 'Courier, monospace';
        div.style.fontSize = '9px';
        div.style.color = '#000';

        const dataVenda = new Date(venda.data).toLocaleDateString('pt-BR');
        const dataHoraEmissao = new Date().toLocaleString('pt-BR');

        // Agrupa itens por produto quando for ESTOQUE_PECA
        const itensAgrupados = this.agruparItensPorProduto(venda.itens);
        
        // Conta total de unidades/peças (cada item da venda original é uma unidade)
        const totalUnidades = venda.itens.length;

        div.innerHTML = `
      <style>
        .bobina-container {
          width: 100%;
        }
        .bobina-container * {
          margin: 0;
          padding: 0;
        }
        .bobina-header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 4px;
          margin-bottom: 4px;
        }
        .bobina-header h1 {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 1px;
        }
        .bobina-header .subtitle {
          font-size: 9px;
          margin-bottom: 1px;
        }
        .bobina-section {
          margin-bottom: 4px;
          padding-bottom: 4px;
          border-bottom: 1px dashed #000;
        }
        .bobina-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
          font-size: 9px;
        }
        .bobina-item {
          margin-bottom: 4px;
          padding-bottom: 3px;
          border-bottom: 1px dotted #999;
        }
        .bobina-item:last-child {
          border-bottom: none;
        }
        .bobina-total {
          font-size: 11px;
          font-weight: bold;
          text-align: right;
          margin-top: 3px;
        }
        .bobina-footer {
          text-align: center;
          font-size: 7px;
          margin-top: 5px;
          padding-top: 4px;
          border-top: 1px dashed #000;
        }
      </style>

      <div class="bobina-container">
        <!-- Cabeçalho -->
        <div class="bobina-header">
          <h1>TrackBeef</h1>
          <div class="subtitle">${empresa?.nome || 'Meu Negócio'}</div>
          <div class="subtitle" style="margin-top: 5px; font-weight: bold;">VENDA</div>
        </div>

        <!-- Informações da Venda -->
        <div class="bobina-section">
          <div class="bobina-row">
            <span>Código:</span>
            <strong>#${venda.codigo}</strong>
          </div>
          <div class="bobina-row">
            <span>Data:</span>
            <span>${dataVenda}</span>
          </div>
          <div class="bobina-row">
            <span>Status:</span>
            <span>${venda.status}</span>
          </div>
        </div>

        <!-- Cliente -->
        <div class="bobina-section">
          <div style="font-weight: bold; margin-bottom: 3px;">CLIENTE</div>
          <div style="font-size: 9px;">${venda.cliente?.nome || '-'}</div>
          <div style="font-size: 9px;">Doc: ${venda.cliente?.documento || '-'}</div>
        </div>

        <!-- Itens -->
        <div class="bobina-section">
          <div style="font-weight: bold; margin-bottom: 5px;">ITENS</div>
          ${itensAgrupados.map((item: any, index: number) => `
            <div class="bobina-item">
              <div style="font-weight: bold; font-size: 9px;">${index + 1}. ${item.produto?.nome || '-'}</div>
              <div class="bobina-row" style="font-size: 9px;">
                <span>${item.quantidade.toFixed(2)} ${item.unidade_saida} x R$ ${this.formatarValor(item.preco_unitario)}</span>
                <strong>R$ ${this.formatarValor(item.valor_total)}</strong>
              </div>
              ${item.pesos && item.pesos.length > 0 ? `<div style="font-size: 7px; color: #666; margin-top: 2px;">${item.pesos.length} peça${item.pesos.length > 1 ? 's' : ''}: ${item.pesos.join(' ')}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Totais -->
        <div class="bobina-section">
          <div class="bobina-row">
            <span>Qtd Itens:</span>
            <strong>${totalUnidades}</strong>
          </div>
          <div class="bobina-row">
            <span>Subtotal:</span>
            <span>R$ ${this.formatarValor(venda.valor_bruto)}</span>
          </div>
          ${venda.valor_desconto > 0 ? `
            <div class="bobina-row">
              <span>Desconto:</span>
              <span>- R$ ${this.formatarValor(venda.valor_desconto)}</span>
            </div>
          ` : ''}
          <div class="bobina-total">
            TOTAL: R$ ${this.formatarValor(venda.valor_liquido)}
          </div>
        </div>

        ${venda.observacao ? `
          <div class="bobina-section">
            <div style="font-weight: bold; margin-bottom: 3px;">OBS:</div>
            <div style="font-size: 8px;">${venda.observacao}</div>
          </div>
        ` : ''}

        <!-- Rodapé -->
        <div class="bobina-footer">
          <div>${dataHoraEmissao}</div>
          <div>TrackBeef - Sistema de Gestão</div>
        </div>
      </div>
    `;

        return div;
    }

    /**
     * Agrupa itens por produto quando forem do tipo ESTOQUE_PECA
     * @param itens Lista de itens da venda
     * @returns Lista de itens agrupados
     */
    private agruparItensPorProduto(itens: any[]): any[] {
        const grupos: { [key: string]: any } = {};

        itens.forEach((item: any) => {
            const produtoId = item.produto?._id;
            
            if (!produtoId) return;

            // Se for ESTOQUE_PECA, agrupa por produto
            if (item.tipo_saida === 'ESTOQUE PECA' && item.peca) {
                if (!grupos[produtoId]) {
                    grupos[produtoId] = {
                        produto: item.produto,
                        unidade_saida: item.unidade_saida,
                        preco_unitario: item.preco_unitario,
                        quantidade: 0,
                        valor_total: 0,
                        pesos: [],
                        tipo_saida: item.tipo_saida
                    };
                }
                
                grupos[produtoId].quantidade += item.quantidade;
                grupos[produtoId].valor_total += item.valor_total;
                grupos[produtoId].pesos.push(item.peca.peso.toFixed(2).replace('.', ','));
            } else {
                // Se não for ESTOQUE_PECA, adiciona como item individual
                const itemKey = `${produtoId}_${Date.now()}_${Math.random()}`;
                grupos[itemKey] = {
                    produto: item.produto,
                    unidade_saida: item.unidade_saida,
                    preco_unitario: item.preco_unitario,
                    quantidade: item.quantidade,
                    valor_total: item.valor_total,
                    pesos: [],
                    tipo_saida: item.tipo_saida
                };
            }
        });

        return Object.values(grupos);
    }

    /**
     * Cria o template HTML para o relatório de conta do cliente
     */
    private criarTemplateContaCliente(conta: any, empresa: any): HTMLElement {
        const div = document.createElement('div');
        div.style.width = '194mm';
        div.style.maxWidth = '194mm';
        div.style.padding = '0';
        div.style.backgroundColor = 'white';
        div.style.fontFamily = 'Arial, sans-serif';
        div.style.fontSize = '11px';
        div.style.color = '#333';
        div.style.boxSizing = 'border-box';
        div.style.overflow = 'hidden';

        const dataEmissao = new Date().toLocaleString('pt-BR');

        div.innerHTML = `
      <style>
        .conta-container * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .conta-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border-bottom: 2px solid #333;
          padding-bottom: 5px;
          margin-bottom: 6px;
        }
        .logo-placeholder {
          width: 120px;
          height: 80px;
          border: 2px dashed #bdc3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: #95a5a6;
          text-align: center;
          flex-shrink: 0;
        }
        .logo-img {
          width: 120px;
          height: 80px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .empresa-info {
          flex: 1;
        }
        .empresa-info h1 {
          font-size: 14px;
          color: #2c3e50;
          margin-bottom: 1px;
        }
        .empresa-info .empresa-subtitle {
          font-size: 8px;
          color: #7f8c8d;
          margin-bottom: 0.5px;
          line-height: 1.2;
        }
        .report-title {
          text-align: right;
          flex-shrink: 0;
        }
        .report-title h2 {
          font-size: 13px;
          color: #2c3e50;
          font-weight: bold;
        }
        .info-section {
          margin-bottom: 5px;
        }
        .info-section h2 {
          font-size: 10px;
          color: #2c3e50;
          border-bottom: 1px solid #bdc3c7;
          padding-bottom: 2px;
          margin-bottom: 3px;
        }
        .cliente-box {
          background-color: #f8f9fa;
          padding: 6px;
          border-radius: 4px;
          margin-bottom: 3px;
        }
        .cliente-box .nome {
          font-size: 12px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 2px;
        }
        .cliente-box .info {
          font-size: 8px;
          color: #7f8c8d;
        }
        .saldo-box {
          background-color: ${conta.saldo_devedor > 0 ? '#fee' : '#efe'};
          padding: 8px;
          border-radius: 4px;
          text-align: center;
          margin-bottom: 5px;
        }
        .saldo-box .label {
          font-size: 8px;
          color: #7f8c8d;
          margin-bottom: 2px;
        }
        .saldo-box .valor {
          font-size: 16px;
          font-weight: bold;
          color: ${conta.saldo_devedor > 0 ? '#e74c3c' : '#27ae60'};
        }
        .resumo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 3px;
          margin-bottom: 5px;
        }
        .resumo-item {
          background-color: #f8f9fa;
          padding: 4px;
          border-radius: 3px;
          text-align: center;
        }
        .resumo-item .label {
          font-size: 7px;
          color: #7f8c8d;
          margin-bottom: 1px;
        }
        .resumo-item .valor {
          font-size: 9px;
          font-weight: bold;
          color: #2c3e50;
        }
        .data-group {
          margin-bottom: 6px;
          border: 1px solid #ecf0f1;
          border-radius: 4px;
          overflow: hidden;
        }
        .data-header {
          background-color: #34495e;
          color: white;
          padding: 4px 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .data-header .data {
          font-size: 9px;
          font-weight: bold;
        }
        .data-header .total {
          font-size: 9px;
        }
        .produtos-lista {
          padding: 4px 6px;
          background-color: #f8f9fa;
        }
        .produto-item {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
          font-size: 8px;
          border-bottom: 1px dotted #ddd;
        }
        .produto-item:last-child {
          border-bottom: none;
        }
        .produto-nome {
          flex: 1;
          color: #2c3e50;
        }
        .produto-qtd {
          width: 80px;
          text-align: right;
          color: #7f8c8d;
        }
        .produto-valor {
          width: 80px;
          text-align: right;
          font-weight: bold;
          color: #2c3e50;
        }
        .footer {
          margin-top: 8px;
          text-align: center;
          font-size: 7px;
          color: #7f8c8d;
          border-top: 1px solid #bdc3c7;
          padding-top: 4px;
        }
      </style>

      <div class="conta-container">
        <!-- Cabeçalho -->
        <div class="conta-header">
          ${empresa?.logoBase64 ? `
            <img src="${empresa.logoBase64}" alt="Logo" class="logo-img">
          ` : `
            <div class="logo-placeholder">
              LOGO<br>120x80px
            </div>
          `}
          <div class="empresa-info">
            <h1>${empresa?.nome || 'Meu Negócio'}</h1>
            ${empresa?.razao_social ? `<div class="empresa-subtitle">${empresa.razao_social}</div>` : ''}
            ${empresa?.documento ? `<div class="empresa-subtitle">Documento: ${this.formatarDocumento(empresa.documento)}</div>` : ''}
            ${empresa?.telefones && empresa.telefones.length > 0 ? `<div class="empresa-subtitle">Contato: ${empresa.telefones.map((tel: string) => this.formatarTelefone(tel)).join(' | ')}</div>` : ''}
            ${empresa?.email ? `<div class="empresa-subtitle">Email: ${empresa.email}</div>` : ''}
          </div>
          <div class="report-title">
            <h2>EXTRATO DE CONTA</h2>
            <div style="font-size: 8px; margin-top: 2px;">TrackBeef</div>
          </div>
        </div>

        <!-- Informações do Cliente -->
        <div class="info-section">
          <h2>Cliente</h2>
          <div class="cliente-box">
            <div class="nome">${conta.cliente?.nome || '-'}</div>
            <div class="info">
              Documento: ${conta.cliente?.documento ? this.formatarDocumento(conta.cliente.documento) : '-'}
              ${conta.cliente?.telefone_principal?.valor ? ` | Tel: ${this.formatarTelefone(conta.cliente.telefone_principal.valor)}` : ''}
            </div>
          </div>
        </div>

        <!-- Saldo Devedor -->
        <div class="saldo-box">
          <div class="label">SALDO DEVEDOR</div>
          <div class="valor">R$ ${this.formatarValor(conta.saldo_devedor)}</div>
        </div>

        <!-- Resumo -->
        <div class="resumo-grid">
          <div class="resumo-item">
            <div class="label">Total Geral</div>
            <div class="valor">R$ ${this.formatarValor(conta.valor_total)}</div>
          </div>
          <div class="resumo-item">
            <div class="label">Recebido</div>
            <div class="valor" style="color: #27ae60;">R$ ${this.formatarValor(conta.valor_recebido)}</div>
          </div>
          <div class="resumo-item">
            <div class="label">Em Aberto</div>
            <div class="valor" style="color: #f39c12;">R$ ${this.formatarValor(conta.valor_total_em_aberto)}</div>
          </div>
        </div>

        <!-- Histórico de Vendas -->
        <div class="info-section">
          <h2>Histórico de Vendas</h2>
          ${conta.vendas.map((venda: any) => `
            <div class="data-group">
              <div class="data-header">
                <span class="data">${new Date(venda.data).toLocaleDateString('pt-BR')}</span>
                <span class="total">Total: R$ ${this.formatarValor(venda.valor_total)} ${venda.valor_em_aberto > 0 ? `| Aberto: R$ ${this.formatarValor(venda.valor_em_aberto)}` : '| ✓ Quitado'}</span>
              </div>
              <div class="produtos-lista">
                ${this.agruparProdutosParaPDF(venda.produtos).map((item: any) => `
                  <div class="produto-item">
                    <div style="flex: 1;">
                      <span class="produto-nome">${item.produto?.nome || '-'}${item.pesos && item.pesos.length > 0 ? ` (${item.pesos.length})` : ''}</span>
                      ${item.pesos && item.pesos.length > 0 ? `<div style="font-size: 7px; color: #666; margin-top: 2px;">${item.pesos.join('  ')}</div>` : ''}
                    </div>
                    <span class="produto-qtd">${item.quantidade.toFixed(2).replace('.', ',')} ${item.produto?.unidade || 'un'}</span>
                    <span class="produto-valor">R$ ${this.formatarValor(item.valor_total)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Rodapé -->
        <div class="footer">
          <p>Documento emitido em: ${dataEmissao}</p>
          <p>TrackBeef - Sistema de Gestão</p>
        </div>
      </div>
    `;

        return div;
    }

    /**
     * Cria template compacto para visualização mobile (imagem)
     */
    private criarTemplateContaClienteMobile(conta: any, empresa: any): HTMLElement {
        const div = document.createElement('div');
        div.style.width = '375px';
        div.style.maxWidth = '375px';
        div.style.padding = '8px';
        div.style.backgroundColor = 'white';
        div.style.fontFamily = 'Arial, sans-serif';
        div.style.fontSize = '11px';
        div.style.color = '#333';
        div.style.boxSizing = 'border-box';

        const dataEmissao = new Date().toLocaleString('pt-BR');

        div.innerHTML = `
      <style>
        .conta-mobile * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .conta-mobile {
          background: white;
          padding: 8px;
        }
        .header-mobile {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          border-bottom: 2px solid #333;
          padding-bottom: 6px;
          margin-bottom: 8px;
        }
        .header-mobile .logo {
          width: 60px;
          height: 40px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .header-mobile .empresa-info {
          flex: 1;
        }
        .header-mobile .empresa-info h1 {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .header-mobile .empresa-info .subtitle {
          font-size: 8px;
          color: #666;
          line-height: 1.3;
        }
        .header-mobile .title {
          text-align: right;
          font-size: 11px;
          font-weight: bold;
          color: #2c3e50;
          flex-shrink: 0;
        }
        .section {
          margin-bottom: 6px;
        }
        .section h2 {
          font-size: 9px;
          color: #2c3e50;
          border-bottom: 1px solid #bdc3c7;
          padding-bottom: 2px;
          margin-bottom: 4px;
          font-weight: bold;
        }
        .cliente-box {
          background: #f8f9fa;
          padding: 6px;
          border-radius: 4px;
          margin-bottom: 4px;
        }
        .cliente-box .nome {
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .cliente-box .info {
          font-size: 8px;
          color: #666;
        }
        .saldo-box {
          background: ${conta.saldo_devedor > 0 ? '#fee' : '#efe'};
          padding: 8px;
          border-radius: 4px;
          text-align: center;
          margin-bottom: 6px;
        }
        .saldo-box .label {
          font-size: 8px;
          color: #666;
          margin-bottom: 2px;
        }
        .saldo-box .valor {
          font-size: 16px;
          font-weight: bold;
          color: ${conta.saldo_devedor > 0 ? '#e74c3c' : '#27ae60'};
        }
        .resumo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 4px;
          margin-bottom: 6px;
        }
        .resumo-item {
          background: #f8f9fa;
          padding: 6px;
          border-radius: 4px;
          text-align: center;
        }
        .resumo-item .label {
          font-size: 7px;
          color: #666;
          margin-bottom: 2px;
        }
        .resumo-item .valor {
          font-size: 9px;
          font-weight: bold;
        }
        .resumo-item.total .valor { color: #2c3e50; }
        .resumo-item.recebido .valor { color: #27ae60; }
        .resumo-item.aberto .valor { color: #f39c12; }
        .data-group {
          margin-bottom: 6px;
          border: 1px solid #ecf0f1;
          border-radius: 4px;
          overflow: hidden;
        }
        .data-header {
          background: #34495e;
          color: white;
          padding: 5px 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .data-header .data {
          font-size: 10px;
          font-weight: bold;
        }
        .data-header .total {
          font-size: 8px;
        }
        .produtos-lista {
          padding: 6px 8px;
          background: #f8f9fa;
        }
        .produto-item {
          padding: 4px 0;
          font-size: 9px;
          border-bottom: 1px dotted #ddd;
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }
        .produto-item:last-child {
          border-bottom: none;
        }
        .produto-info {
          flex: 1;
          min-width: 0;
        }
        .produto-nome {
          color: #2c3e50;
          font-weight: 500;
          word-wrap: break-word;
        }
        .produto-pecas {
          font-size: 7px;
          color: #666;
          margin-top: 2px;
          line-height: 1.4;
        }
        .produto-qtd {
          width: 60px;
          text-align: right;
          color: #666;
          flex-shrink: 0;
        }
        .produto-valor {
          width: 60px;
          text-align: right;
          font-weight: bold;
          color: #2c3e50;
          flex-shrink: 0;
        }
        .footer-mobile {
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 7px;
          color: #999;
        }
      </style>

      <div class="conta-mobile">
        <!-- Cabeçalho -->
        <div class="header-mobile">
          ${empresa?.logoBase64 ? `<img src="${empresa.logoBase64}" class="logo" alt="Logo">` : ''}
          <div class="empresa-info">
            <h1>${empresa?.nome || 'Empresa'}</h1>
            ${empresa?.telefones && empresa.telefones.length > 0 ? `<div class="subtitle">Tel: ${empresa.telefones.map((tel: string) => this.formatarTelefone(tel)).join(' | ')}</div>` : ''}
            ${empresa?.email ? `<div class="subtitle">${empresa.email}</div>` : ''}
          </div>
          <div class="title">
            EXTRATO<br>DE CONTA
          </div>
        </div>

        <!-- Cliente -->
        <div class="section">
          <h2>Cliente</h2>
          <div class="cliente-box">
            <div class="nome">${conta.cliente?.nome || '-'}</div>
            <div class="info">
              Doc: ${conta.cliente?.documento ? this.formatarDocumento(conta.cliente.documento) : '-'}
              ${conta.cliente?.telefone_principal?.valor ? ` | Tel: ${this.formatarTelefone(conta.cliente.telefone_principal.valor)}` : ''}
            </div>
          </div>
        </div>

        <!-- Saldo Devedor -->
        <div class="saldo-box">
          <div class="label">SALDO DEVEDOR</div>
          <div class="valor">R$ ${this.formatarValor(conta.saldo_devedor)}</div>
        </div>

        <!-- Resumo -->
        <div class="resumo-grid">
          <div class="resumo-item total">
            <div class="label">Total Geral</div>
            <div class="valor">R$ ${this.formatarValor(conta.valor_total)}</div>
          </div>
          <div class="resumo-item recebido">
            <div class="label">Recebido</div>
            <div class="valor">R$ ${this.formatarValor(conta.valor_recebido)}</div>
          </div>
          <div class="resumo-item aberto">
            <div class="label">Em Aberto</div>
            <div class="valor">R$ ${this.formatarValor(conta.valor_total_em_aberto)}</div>
          </div>
        </div>

        <!-- Histórico de Vendas -->
        <div class="section">
          <h2>Histórico de Vendas</h2>
          ${conta.vendas?.map((venda: any) => `
            <div class="data-group">
              <div class="data-header">
                <span class="data">${new Date(venda.data).toLocaleDateString('pt-BR')}</span>
                <span class="total">Total: R$ ${this.formatarValor(venda.valor_total)} ${venda.valor_em_aberto > 0 ? `| Aberto: R$ ${this.formatarValor(venda.valor_em_aberto)}` : '| ✓'}</span>
              </div>
              <div class="produtos-lista">
                ${this.agruparProdutosParaPDF(venda.produtos).map((item: any) => `
                  <div class="produto-item">
                    <div class="produto-info">
                      <div class="produto-nome">${item.produto?.nome || '-'}${item.pesos && item.pesos.length > 0 ? ` (${item.pesos.length})` : ''}</div>
                      ${item.pesos && item.pesos.length > 0 ? `<div class="produto-pecas">${item.pesos.join('  ')}</div>` : ''}
                    </div>
                    <div class="produto-qtd">${item.quantidade.toFixed(2).replace('.', ',')} ${item.produto?.unidade || 'un'}</div>
                    <div class="produto-valor">R$ ${this.formatarValor(item.valor_total)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Rodapé -->
        <div class="footer-mobile">
          Emitido em: ${dataEmissao}
        </div>
      </div>
    `;

        return div;
    }

    /**
     * Agrupa produtos para PDF (usando a nova estrutura de dados)
     */
    private agruparProdutosParaPDF(produtos: any[]): any[] {
        if (!produtos || produtos.length === 0) return [];

        return produtos.map((item: any) => {
            // Extrai os pesos das peças, se existirem
            const pesos = item.pecas && item.pecas.length > 0 
                ? item.pecas.map((peca: any) => `${peca.peso.toFixed(2).replace('.', ',')}`)
                : [];

            return {
                produto: item.produto,
                quantidade: item.quantidade,
                valor_total: item.valor_total,
                pesos: pesos
            };
        });
    }

    /**
     * Agrupa itens por produto de forma simples (para o relatório de conta - LEGADO)
     */
    private agruparItensPorProdutoSimples(itens: any[]): any[] {
        const grupos: { [key: string]: any } = {};

        itens.forEach((item: any) => {
            const produtoId = item.produto?._id;
            
            if (!produtoId) return;

            // Se for ESTOQUE_PECA, agrupa por produto
            if (item.tipo_saida === 'ESTOQUE PECA' && item.peca) {
                if (!grupos[produtoId]) {
                    grupos[produtoId] = {
                        produto: item.produto,
                        unidade_saida: item.unidade_saida || item.produto?.unidade,
                        quantidade: 0,
                        valor_total: 0,
                        pesos: [],
                        tipo_saida: item.tipo_saida
                    };
                }
                
                grupos[produtoId].quantidade += item.quantidade;
                grupos[produtoId].valor_total += item.valor_total;
                grupos[produtoId].pesos.push(item.peca.peso.toFixed(2).replace('.', ','));
            } else {
                // Se não for ESTOQUE_PECA, agrupa normalmente
                if (!grupos[produtoId]) {
                    grupos[produtoId] = {
                        produto: item.produto,
                        unidade_saida: item.unidade_saida || item.produto?.unidade,
                        quantidade: 0,
                        valor_total: 0,
                        pesos: [],
                        tipo_saida: item.tipo_saida
                    };
                }
                
                grupos[produtoId].quantidade += item.quantidade;
                grupos[produtoId].valor_total += item.valor_total;
            }
        });

        return Object.values(grupos);
    }

    /**
     * Formata CPF ou CNPJ
     * @param value Documento sem formatação
     * @returns Documento formatado
     */
    private formatarDocumento(value: string): string {
        if (!value) return value;
        
        let val = value.toString().replace(/\D/g, '');

        if (val.length <= 11) {
            // CPF mask: 000.000.000-00
            val = val.replace(/(\d{3})(\d)/, '$1.$2');
            val = val.replace(/(\d{3})(\d)/, '$1.$2');
            val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            // CNPJ mask: 00.000.000/0000-00
            val = val.replace(/^(\d{2})(\d)/, '$1.$2');
            val = val.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            val = val.replace(/\.(\d{3})(\d)/, '.$1/$2');
            val = val.replace(/(\d{4})(\d)/, '$1-$2');
        }

        return val;
    }

    /**
     * Formata telefone
     * @param value Telefone sem formatação
     * @returns Telefone formatado
     */
    private formatarTelefone(value: string): string {
        if (!value) return value;
        
        let val = value.toString().replace(/\D/g, '');

        if (val.length === 11) {
            val = val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (val.length === 10) {
            val = val.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }

        return val;
    }

    /**
     * Formata valor monetário no padrão brasileiro
     * @param value Valor numérico
     * @returns Valor formatado (ex: 1.000,00)
     */
    private formatarValor(value: number): string {
        if (!value && value !== 0) return '0,00';
        
        return value.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Converte uma URL de imagem para base64
     * @param url URL da imagem
     * @returns Promise com a imagem em base64
     */
    private async imageUrlToBase64(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Erro ao converter imagem para base64:', error);
            throw error;
        }
    }
}
