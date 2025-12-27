import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class EndpointsService extends ApiService {

    // Publico
    addEmpresa(data: any) {
        return this.post('/public/empresa', data);
    }
    getFaturasClienteById(id: string) {
        return this.get(`/public/cliente/${id}/faturas?customer=1`);
    }

    // Geral
    getEmpresaByCodigoAtivacao(codigo_ativacao: string) {
        return this.get('/v1/empresa/codigo-ativacao/' + codigo_ativacao);
    }
    login(documento: string, senha: string) {
        return this.post('/v1/login', { documento, senha });
    }
    criarConta(data: any) {
        return this.post('/public/ecommerce/criar-conta', data);
    }
    me() {
        return this.get('/v1/me');
    }
    getPermissoes() {
        return this.get('/v1/admin/usuarios/permissoes');
    }
    getDefaultValues() {
        return this.get('/public/default-values')
    }
    getConfiguracoesEmpresa() {
        return this.get('/v1/admin/configuracoes');
    }
    postConfiguracoesEmpresa(data: any) {
        return this.post('/v1/admin/configuracoes', data);
    }
    // Public
    getEstados() {
        return this.get('/public/estados');
    }
    getCidades(estadoSigla: string) {
        let urlParams = new URLSearchParams();
        urlParams.append('estado', estadoSigla);
        return this.get(`/public/cidades?${urlParams.toString()}`);
    }
    getConsultaCEP(cep: string) {
        let urlParams = new URLSearchParams();
        urlParams.append('cep', cep);
        return this.get(`/public/cep?${urlParams.toString()}`);
    }
    // Admin
    // Usuários
    getUsuarios({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/usuarios' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    getPerfis({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/perfis' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    getPerfilById(id: string) {
        return this.get('/v1/admin/perfis/' + id);
    }
    postPerfil(data: any) {
        return this.post('/v1/admin/perfis', data);
    }
    getUsuario(id: string = '', params: any = {}) {
        let urlParams = new URLSearchParams();
        if (!!id) urlParams.append('id', id);
        for (let i in params) if (params[i]) urlParams.append(i, params[i]);
        return this.get('/v1/admin/usuario' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    postUsuarios(data: any) {
        return this.post('/v1/admin/usuarios', data);
    }
    postUsuarioSimples(data: any) {
        return this.post('/v1/admin/usuarios/simples', data);
    }
    putUsuariosAdicional(data: any) {
        return this.put(`/v1/admin/usuarios/adicional`, data);
    }

    // Pessoas
    getPessoas({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/pessoas' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    getPessoaById(id: string) {
        return this.get('/v1/admin/pessoas/' + id);
    }
    postPessoa(data: any) {
        return this.post('/v1/admin/pessoas', data);
    }

    getClientesNoAuth() {
        let urlParams = new URLSearchParams();
        urlParams.append('perpage', "1000");
        urlParams.append('page', "1");
        urlParams.append('tipo', 'CLIENTE');
        urlParams.append('sort_by', 'nome')
        urlParams.append('skip_auth', '1')
        return this.get('/v1/admin/pessoas' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }

    getFornecedoresNoAuth() {
        let urlParams = new URLSearchParams();
        urlParams.append('perpage', "1000");
        urlParams.append('page', "1");
        urlParams.append('tipo', 'FORNECEDOR');
        urlParams.append('sort_by', 'nome')
        urlParams.append('skip_auth', '1')
        return this.get('/v1/admin/pessoas' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }

    getProdutosNoAuth() {
        let urlParams = new URLSearchParams();
        urlParams.append('perpage', "1000");
        urlParams.append('page', "1");
        urlParams.append('skip_auth', '1')
        return this.get('/v1/admin/produtos' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }

    getAlmoxarifadosNoAuth() {
        let urlParams = new URLSearchParams();
        urlParams.append('perpage', "1000");
        urlParams.append('page', "1");
        urlParams.append('skip_auth', '1')
        urlParams.append('sort_by', 'principal')
        return this.get('/v1/admin/almoxarifados' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }

    getAlmoxarifadoEstoqueListaById(id: string) {
        return this.get(`/v1/admin/almoxarifados/${id}/estoque`);
    }

    getProdutos({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/produtos' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    getProdutoById(id: string) {
        return this.get('/v1/admin/produtos/' + id);
    }
    postProduto(data: any) {
        return this.post('/v1/admin/produtos', data);
    }
    putProduto(data: any) {
        return this.put('/v1/admin/produtos/' + data._id, data);
    }

    // Entrada de Notas
    getEntradasNotas({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/estoque/entrada-notas' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }

    getEntradaNotaById(id: string) {
        return this.get('/v1/admin/estoque/entrada-notas/' + id);
    }

    postEntradaNota(data: any) {
        return this.post('/v1/admin/estoque/entrada-notas', data);
    }

    putEntradaNota(id: string, data: any) {
        return this.put('/v1/admin/estoque/entrada-notas/' + id, data);
    }

    deleteEntradaNota(id: string) {
        return this.delete('/v1/admin/estoque/entrada-notas/' + id);
    }

    cancelarFechamentoNota(id: string, data: { motivo: string, cancelarCobrancas?: boolean, removerEstoque?: boolean }) {
        return this.post('/v1/admin/estoque/entrada-notas/' + id + '/cancelar-fechamento', data);
    }

    getAlmoxarifados({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/almoxarifados' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    postAlmoxarifado(data: any) {
        return this.post('/v1/admin/almoxarifados', data);
    }
    getAlmoxarifadoById(id: string) {
        return this.get('/v1/admin/almoxarifados/' + id);
    }

    getEstoques({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/estoque' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    getProdutosPDV({ busca }: any) {
        let urlParams = new URLSearchParams();
        urlParams.append('perpage', '1000');
        urlParams.append('page', '1');
        if (busca) urlParams.append('busca', busca);
        return this.get('/v1/admin/produtos/pdv/disponiveis' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    getHistoricoProduto(produto_id: string, almoxarifado_id: string) {
        if (produto_id && almoxarifado_id) {
            return this.get(`/v1/admin/estoque/${produto_id}/${almoxarifado_id}`);
        }
        if (produto_id && !almoxarifado_id) {
            return this.get(`/v1/admin/estoque/${produto_id}`);
        }
        return null;
    }

    getPecasProdutoAlmoxarifado(produto_id: string, almoxarifado_id: string, status_estoque: string) {
        let urlParams = new URLSearchParams();
        urlParams.append('produto_id', produto_id);
        urlParams.append('almoxarifado_id', almoxarifado_id);
        if (status_estoque) {
            urlParams.append('status_estoque', status_estoque);
        } else {
            urlParams.append('status_estoque', 'EM ESTOQUE');
        }
        return this.get('/v1/admin/produtos/pecas/almoxarifado/disponiveis' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }

    // Vendas/Pedidos

    getPedidos({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/vendas/pedidos' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }

    postPedido(data: any) {
        return this.post('/v1/admin/vendas/pedidos', data);
    }

    getPedidoById(id: string, params: any = {}) {
        let urlParams = new URLSearchParams();
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/vendas/pedidos/' + id + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }

    desfazerProcessamentoPedido(id: string) {
        return this.post(`/v1/admin/vendas/pedidos/${id}/desfazer-processamento`, {});
    }

    cancelarPedido(id: string) {
        return this.post(`/v1/admin/vendas/pedidos/${id}/cancelar`, {});
    }

    getFormasPagamento({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/formas-pagamento' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    getFormasPagamentoNoAuth(origem = '') {
        let urlParams = new URLSearchParams();
        urlParams.append('status', 'ATIVO');
        urlParams.append('perpage', "1000");
        urlParams.append('page', "1");
        urlParams.append('skip_auth', '1')
        if (origem) urlParams.append('disponivel_em', origem);
        return this.get('/v1/admin/formas-pagamento' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }

    getFormaPagamentoById(id: string) {
        return this.get('/v1/admin/formas-pagamento/' + id);
    }

    postFormaPagamento(data: any) {
        return this.post('/v1/admin/formas-pagamento', data);
    }

    getCaixas({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/caixas' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    getCaixasLancamentosById(id: string, { perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/caixas/' + id + '/lancamentos' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    getCaixasNoAuth() {
        let urlParams = new URLSearchParams();
        urlParams.append('perpage', "1000");
        urlParams.append('page', "1");
        urlParams.append('skip_auth', '1')
        return this.get('/v1/admin/caixas' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    getCaixaById(id: string) {
        return this.get('/v1/admin/caixas/' + id);
    }
    postCaixa(data: any) {
        return this.post('/v1/admin/caixas', data);
    }
    getContasReceber({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/contas-receber' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    putLancamentoContasReceber(id: string, data: any) {
        return this.put(`/v1/admin/contas-receber/${id}/lancamento`, data);
    }
    estornaLancamentoContasReceber(id: string, lancamento_id: string) {
        return this.put(`/v1/admin/contas-receber/${id}/estornar-lancamento/${lancamento_id}`, {});
    }
    putAlterarContasReceber(id: string, data: any) {
        return this.put(`/v1/admin/contas-receber/${id}/alterar`, data);
    }
    darBaixaContasReceber(id: string) {
        return this.put(`/v1/admin/contas-receber/${id}/baixa`, {});
    }
    reverterBaixaContasReceber(id: string) {
        return this.put(`/v1/admin/contas-receber/${id}/baixa/reverter`, {});
    }
    getContasPagar({ perpage, page, busca, ...params }: any) {
        let urlParams = new URLSearchParams();
        if (perpage && page) {
            urlParams.append('perpage', perpage);
            urlParams.append('page', page);
        }
        if (busca) urlParams.append('busca', busca);
        for (const key in params) {
            if (params[key]) urlParams.append(key, params[key]);
        }
        return this.get('/v1/admin/contas-pagar' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    putLancamentoContasPagar(id: string, data: any) {
        return this.put(`/v1/admin/contas-pagar/${id}/lancamento`, data);
    }
    estornaLancamentoContasPagar(id: string, lancamento_id: string) {
        return this.put(`/v1/admin/contas-pagar/${id}/estornar-lancamento/${lancamento_id}`, {});
    }
    putAlterarContasPagar(id: string, data: any) {
        return this.put(`/v1/admin/contas-pagar/${id}/alterar`, data);
    }
    darBaixaContasPagar(id: string) {
        return this.put(`/v1/admin/contas-pagar/${id}/baixa`, {});
    }
    reverterBaixaContasPagar(id: string) {
        return this.put(`/v1/admin/contas-pagar/${id}/baixa/reverter`, {});
    }

    // Recebimentos Painel
    getPainelRecebimentos() {
        return this.get('/v1/admin/recebimentos');
    }
    // Recebimentos Painel Por Cliente
    getPainelRecebimentosByCliente(id_cliente: string) {
        return this.get('/v1/admin/recebimentos/' + id_cliente);
    }
    // Lancamento de recebimento
    postLancamentoRecebimento(data: any) {
        return this.post('/v1/admin/recebimentos/lancamento', data);
    }
    // Excluir recebimento
    deleteRecebimento(id: string) {
        return this.delete('/v1/admin/recebimentos/' + id);
    }
    // Estornar lancamento de recebimento
    putEstornarLancamentoRecebimento(id: string) {
        return this.put('/v1/admin/recebimentos/lancamento/' + id + '/estornar', {});
    }
    // Lista de recebimentos por cliente
    getListaRecebimentosByClienteId(id_cliente: string) {
        return this.get('/v1/admin/recebimentos/lancamentos/' + id_cliente);
    }
    // OCR
    uploadImageOcr(formData: FormData) {
        return this.post('/image-reader/notas/ocr', formData);
    }

    // Upload de imagem genérico
    uploadImage(formData: FormData) {
        return this.post('/public/image-uploader', formData);
    }








}