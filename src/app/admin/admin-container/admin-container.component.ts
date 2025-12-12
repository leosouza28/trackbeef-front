import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/services/api.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SessaoService } from 'src/app/services/sessao.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';

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

  constructor(private api: ApiService, private router: Router, public sessao: SessaoService, private pushNotificationService: PushNotificationService) { }

  ngOnInit(): void {
    this.sessao.userSubject.subscribe(user => {
      if (user && user?.scopes?.length) {
        this.logged_user = user;
        this.loadMenu(false)
      } else {
        this.loadMenu(true)
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

  loadMenu(onlyDefault: boolean = false) {
    if (onlyDefault) {
      this.menu = this.menuItems.filter(item => item.default);
      return;
    } else {
      let sessao = this.sessao.getUser();
      let scopes: any = sessao?.scopes || [];
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
        icon: 'bi bi-people-fill me-2',
        nome: 'Usuários',
        submenu: [
          {
            scopes: ["usuarios.leitura"],
            icon: 'bi bi-search me-2',
            nome: 'Consultar',
            link: '/admin/usuarios/listar'
          },
          {
            scopes: ["usuarios.editar"],
            icon: 'bi bi-plus-lg me-2',
            nome: 'Adicionar',
            link: '/admin/usuarios/form'
          },
        ],
        open: false
      },
      {
        icon: 'bi bi-hammer me-2',
        nome: 'Operações',
        submenu: [
          {
            scopes: ['pix.leitura'],
            icon: 'bi bi-search me-2',
            nome: 'Consultar PIX (Sistema)',
            link: '/admin/pix/listar'
          },
        ],
        open: false,
      },
      {
        icon: 'bi bi-eye-fill me-2',
        nome: 'Monitorar',
        submenu: [
          {
            scopes: ['monitoramento.pix_leitura'],
            icon: 'bi bi-search me-2',
            nome: 'PIX',
            link: '/admin/monitorar/pix'
          },
        ],
        open: false,
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