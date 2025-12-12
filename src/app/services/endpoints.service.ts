import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class EndpointsService extends ApiService {

    getDashboardAdmin(params: any = {}) {
        let urlParams = new URLSearchParams();
        for (let i in params) if (params[i]) urlParams.append(i, params[i]);
        return this.get('/v1/admin/dashboard/admin' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }

    // Geral
    login(documento: string, senha: string, scope: string = 'CLIENTE') {
        return this.post('/v1/login', { documento, senha, scope });
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
    getVendedores() {
        return this.get('/v1/admin/usuarios/vendedores');
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

    getRecebimentos(params: any = {}) {
        let urlParams = new URLSearchParams();
        for (let i in params) if (params[i]) urlParams.append(i, params[i]);
        return this.get('/v1/admin/recebimentos' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    setRecebimentos(data: any) {
        return this.put('/v1/admin/recebimentos', data);
    }
    getPix(params: any = {}) {
        let urlParams = new URLSearchParams();
        for (let i in params) if (params[i]) urlParams.append(i, params[i]);
        return this.get('/v1/admin/pix' + (urlParams.toString() ? `?${urlParams.toString()}` : ''));
    }
    createPix(data: any) {
        return this.post('/v1/admin/pix', data);
    }
    registerFcmToken(token: string) {
        return this.post('/v1/register-fcm-token', { token });
    }

}