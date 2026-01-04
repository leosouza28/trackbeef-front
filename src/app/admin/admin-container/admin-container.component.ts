import { Component, inject, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/services/api.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SessaoService } from 'src/app/services/sessao.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { EndpointsService } from 'src/app/services/endpoints.service';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-admin-container',
  templateUrl: './admin-container.component.html',
  styleUrls: ['./admin-container.component.scss']
})
export class AdminContainerComponent implements OnInit {

  public offcanvasService = inject(NgbOffcanvas);

  version: any;
  menu: any[] = [];

  logged_user: any;

  dashboard_admin_data: any = null;

  constructor(
    private api: ApiService,
    private router: Router,
    public sessao: SessaoService,
    private pushNotificationService: PushNotificationService,
    private endpointService: EndpointsService,
    private reportService: ReportService,
  ) { }

  ngOnInit(): void {
    this.sessao.userSubject.subscribe(user => {
      if (user) {
        this.logged_user = user;
        this.loadMenu(false)
        this.loadEmpresaAtiva();
      } else {
        this.loadMenu(true)
        this.reportService.cleanEmpresaAtiva();
      }
    })
    this.getVersion();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.offcanvasService.dismiss();
      });
  }


  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  async loadEmpresaAtiva() {
    let data = await this.endpointService.getConfiguracoesEmpresa()
    this.reportService.setEmpresaAtiva(data)
  }

  loadMenu(onlyDefault: boolean = false) {
    if (onlyDefault) {
      this.menu = this.menuItems.filter(item => item.default);
      return;
    } else {
      let sessao = this.sessao.getUser();
      let scopes: any = this.scopesEmpresaAtiva;
      this.menu = this.menuItems.filter((item: any) => {
        if (item.default) return true;
        if (item.submenu) {
          item.submenu = item.submenu.filter((subItem: any) => {
            return !subItem.scopes || subItem.scopes.some((scope: string) => scopes.includes(scope));
          });
          return item.submenu.length > 0;
        }
        return !item.submenu && (!item.scopes || item.scopes.some((scope: string) => scopes.includes(scope)));
      });
    }
  }

  getVersion() {
    this.version = this.api.getPackageVersion();
  }

  toggleSubmenu(item: any) {
    if (item.submenu) {
      this.menu.forEach(menuItem => {
        if (menuItem !== item && menuItem.submenu) {
          menuItem.open = false;
        }
      });
      item.open = !item.open;
    }
  }

  openMenu(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }

  async turnOnNotifications() {
    if (this.isNotificationAvailables) {
      try {
        await this.pushNotificationService.requestPermissionAndGetToken()
      } catch (error) {
        console.error(error);
      }
    }
  }

  get navigatorSupportsNotifications() {
    return 'Notification' in window;
  }

  get isNotificationAvailables() {
    // Verificar se o Navegador suporte notificações e se ainda não está registrado
    const supportsNotifications = 'Notification' in window;
    const isAlreadyRegistered = this.pushNotificationService.isNotificationRegistered();
    return supportsNotifications && !isAlreadyRegistered;
  }

  get isNotificationRegistered() {
    return this.pushNotificationService.isNotificationRegistered();
  }


  get scopesEmpresaAtiva(): string[] {
    let empresa = this.sessao.getEmpresaAtiva();
    let user = this.sessao.getUser();
    if (empresa && user) {
      let _user_empresa = user.empresas.find((ue: any) => ue.empresa_id === empresa.id);
      console.log(_user_empresa)
      if (_user_empresa && _user_empresa.perfil && _user_empresa.perfil.scopes) {
        return _user_empresa.perfil.scopes;
      }
      return [];
    }
    return [];
  }


  get menuItems() {
    return [
      {
        icon: 'bi bi-house-fill me-2',
        nome: 'Início',
        link: "/admin/inicio",
        submenu: null,
        default: true
      },
      {
        icon: 'bi bi-mortarboard-fill me-2',
        nome: 'Tutorial',
        link: "/admin/tutorial",
        submenu: null,
        default: true
      },

      {
        icon: 'bi bi-hammer me-2',
        nome: 'Operacional',
        submenu: [
          {
            scopes: ["usuarios.leitura"],
            icon: 'bi bi-people me-2',
            nome: 'Usuários',
            link: '/admin/usuarios/listar'
          },
          {
            scopes: ["clientes.leitura"],
            icon: 'bi bi-people me-2',
            nome: 'Pessoas',
            link: '/admin/pessoas/listar'
          },
          {
            scopes: ["perfis.leitura"],
            icon: 'bi bi-person-lines-fill me-2',
            nome: 'Perfis de acesso',
            link: '/admin/perfis/listar'
          },
          {
            scopes: ["produtos.leitura"],
            icon: 'bi bi-boxes me-2',
            nome: 'Produtos',
            link: '/admin/produtos/listar'
          },
          {
            scopes: ["almoxarifados.leitura"],
            icon: 'bi bi-buildings me-2',
            nome: 'Almoxarifados',
            link: '/admin/almoxarifados/listar'
          },
          {
            scopes: ["estoque.notas_entradas_leitura"],
            icon: 'bi bi-clipboard-plus me-2',
            nome: 'Entrada de Estoque',
            link: '/admin/notas-entradas/listar'
          },
          {
            scopes: ["estoque.leitura"],
            icon: 'bi bi-building me-2',
            nome: 'Estoque',
            link: '/admin/estoque/listar'
          }
        ],
        open: false
      },

      {
        icon: 'bi bi-cash-coin me-2',
        nome: 'Vendas',
        submenu: [
          {
            scopes: ["vendas.leitura"],
            icon: 'bi bi-search me-2',
            nome: 'Consultar',
            link: '/admin/vendas/listar'
          },
          {
            scopes: ["vendas.pdv"],
            icon: 'bi bi-plus-lg me-2',
            nome: 'Nova Venda',
            link: '/admin/vendas/pdv'
          },
        ],
        open: false
      },
      {
        icon: 'bi bi-cash-stack me-2',
        nome: 'Financeiro',
        submenu: [

          {
            scopes: ["financeiro.caixa_leitura"],
            icon: 'bi bi-bank me-2',
            nome: 'Caixa',
            link: '/admin/financeiro/caixa/listar'
          },
          {
            scopes: ["financeiro.contas_receber_leitura"],
            icon: 'bi bi-graph-up-arrow me-2',
            nome: 'Contas a Receber',
            link: '/admin/financeiro/contas-a-receber/listar'
          },
          {
            scopes: ["financeiro.contas_pagar_leitura"],
            icon: 'bi bi-graph-down-arrow me-2',
            nome: 'Contas a Pagar',
            link: '/admin/financeiro/contas-a-pagar/listar'
          },
          {
            scopes: ["financeiro.caixa_leitura"],
            icon: 'bi bi-receipt me-2',
            nome: 'Recebimentos',
            link: '/admin/financeiro/recebimentos'
          },
        ],
        open: false
      },

      {
        icon: 'bi bi-gear me-2',
        nome: 'Configurações',
        submenu: [
          {
            scopes: ["configuracoes.empresa_editar"],
            icon: 'bi bi-building me-2',
            nome: 'Empresa',
            link: '/admin/configuracoes/empresa'
          },
          {
            scopes: ["configuracoes.formas_pagamento_leitura"],
            icon: 'bi bi-cash-stack me-2',
            nome: 'Formas Pagamento',
            link: '/admin/configuracoes/formas-pagamento/listar'
          },
          {
            scopes: ["configuracoes.juros_multas_leitura"],
            icon: 'bi bi-percent me-2',
            nome: 'Juros e Multas',
            link: '/admin/configuracoes/juros-multas/listar'
          },
        ],
        open: false
      },

      {
        icon: 'bi bi-files-alt me-2',
        nome: 'Relatórios',
        submenu: [],
        open: false,
      },



      {
        icon: 'bi bi-door-open-fill text-danger me-2',
        nome: 'Sair',
        link: '/admin/logoff',
        submenu: null,
        default: true
      },
    ]
  }
}