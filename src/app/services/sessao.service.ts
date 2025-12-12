import { Injectable, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SessaoService {

    local_keys = {
        "TOKEN": "TOKEN",
        "USER_DATA": "USER_DATA",
        "CARRINHO": "CARRINHO",
    }

    private _isAuthenticated: boolean = false;
    public user: any = null;
    public userSubject = new BehaviorSubject<any>(this.getUser());
    public empresa_ativa: any = null;

    public carrinho: any[] = [];
    public carrinhoSubject = new BehaviorSubject<any[]>(this.getCarrinho());

    public helper_carteirinhas: any;


    constructor() {
        let userData = localStorage.getItem(this.local_keys.USER_DATA);
        if (userData) {
            userData = JSON.parse(userData);
            this.user = userData;
            this.setAuthenticated(true);
            this.atualizarSessao();
        }
        let carrinhoData: any = localStorage.getItem(this.local_keys.CARRINHO);
        if (carrinhoData) {
            carrinhoData = JSON.parse(carrinhoData);
            this.carrinho = carrinhoData;
        }
    }
    public hasPermissao(id: any) {
        if (this.user?.empresa?.perfil?.permissoes?.length) {
            let has_permissao = this.user.empresa.perfil.permissoes.find((item: any) => item.id == id);
            if (!!has_permissao) return true;
        }
        return false;
    }
    public isAuthenticated(): boolean {
        return this._isAuthenticated;
    }
    // Método para definir o estado de autenticação do usuário
    public setAuthenticated(isAuthenticated: boolean): void {
        this._isAuthenticated = isAuthenticated;
    }
    // Método para obter o ID do usuário
    public getUser(): any {
        return this.user;
    }
    // Método para definir o ID do usuário
    public setUser(user: any): void {
        if (user) {
            if (user?.access_token) localStorage.setItem(this.local_keys.TOKEN, user.access_token);
            delete user.access_token;
            localStorage.setItem(this.local_keys.USER_DATA, JSON.stringify(user, null, 2));
        }
        this.user = user;
        this.atualizarSessao();
    }
    // Método para limpar a sessão do usuário
    public clearSession(): void {
        this._isAuthenticated = false;
        this.user = null;
        localStorage.removeItem(this.local_keys.USER_DATA);
        localStorage.removeItem(this.local_keys.TOKEN);
        this.atualizarSessao();
        this.atualizarCarrinho();
    }
    public getToken(): string | null {
        let token = localStorage.getItem(this.local_keys.TOKEN);
        if (!!token) return token;
        return null;
    }
    // Carrinho
    public atualizarCarrinho() {
        this.carrinhoSubject.next(this.getCarrinho());
    }
    public atualizarSessao() {
        this.userSubject.next(this.getUser());
    }
    public getCarrinho(): any[] {
        // if (isDevMode()) console.log(this.carrinho);
        return this.carrinho;
    }
    public setCarrinho(carrinho: any[]): void {
        if (carrinho) {
            localStorage.setItem(this.local_keys.CARRINHO, JSON.stringify(carrinho, null, 2));
        }
        this.carrinho = carrinho;
        this.atualizarCarrinho();
    }
    public addItemCarrinho(item: any): void {
        if (item) {
            let ingresso: any = {
                _id: item._id,
                nome: item.nome,
                qtd: item.qtd,
                valor: item.valor,
                data_visita: item.data_visita,
                requer_dados: item.requer_dados,
                slug: item.slug
            }
            if (!!item?.imagem_principal?.url) ingresso.thumb = item.imagem_principal.url

            let itemExistente = this.carrinho.find((i: any) => i._id == ingresso._id && i.data_visita == ingresso.data_visita);
            if (itemExistente) {
                itemExistente.qtd += item.qtd;
                itemExistente.valor += item.valor;
            } else {
                this.carrinho.push(ingresso);
            }
            localStorage.setItem(this.local_keys.CARRINHO, JSON.stringify(this.carrinho, null, 2));
        }
        this.atualizarCarrinho();
    }
    public clearCarrinho(): void {
        this.carrinho = [];
        localStorage.removeItem(this.local_keys.CARRINHO);
    }

    public isScopeAvailable(scope: string): boolean {
        if (this.user?.scopes?.length) {
            let has_scope = this.user.scopes.find((item: any) => item == scope);
            if (!!has_scope) return true;
        }
        return false;
    }

    public getHelperCarteirinhas(): any {
        let helper = localStorage.getItem('helper_carteirinhas');
        if (helper) {
            this.helper_carteirinhas = JSON.parse(helper);
        } else {
            this.helper_carteirinhas = null;
        }
        return this.helper_carteirinhas;
    }
    
    public setHelperCarteirinhas(helper: any): void {
        if (helper) localStorage.setItem('helper_carteirinhas', JSON.stringify(helper));
        this.helper_carteirinhas = helper;
    }

    public clearHelperCarteirinhas(): void {
        this.helper_carteirinhas = null;
        localStorage.removeItem('helper_carteirinhas');
    }

}
