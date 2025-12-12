import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminContainerComponent } from "./admin/admin-container/admin-container.component";
import { InicioComponent } from "./admin/inicio/inicio.component";
import { LoginComponent } from "./admin/login/login.component";
import { LogoffComponent } from "./admin/logoff/logoff.component";
import { FormUsuariosComponent } from "./admin/usuarios/form-usuarios/form-usuarios.component";
import { ListarUsuariosComponent } from "./admin/usuarios/listar-usuarios/listar-usuarios.component";
import { AreaClienteSairComponent } from "./cliente/area-cliente-sair/area-cliente-sair.component";
import { ClienteContainerComponent } from "./cliente/cliente-container/cliente-container.component";
import { HomeComponent } from "./cliente/home/home.component";
import { AuthGuard } from './services/auth-guard.service';
import { UsuarioRefreshTokenComponent } from "./usuario-refresh-token/usuario-refresh-token.component";
import { MonitorarPixesComponent } from "./admin/monitorar/monitorar-pixes/monitorar-pixes.component";
import { PixGerarComponent } from "./admin/pixs/pix-gerar/pix-gerar.component";
import { PixListarComponent } from "./admin/pixs/pix-listar/pix-listar.component";


const routes: Routes = [
  {
    path: '',
    component: ClienteContainerComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'conta/sair',
        component: AreaClienteSairComponent
      },
    ]
  },
  {
    path: "area-administrativa",
    component: LoginComponent,
  },
  {
    path: 'refresh-token',
    component: UsuarioRefreshTokenComponent,
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    component: AdminContainerComponent,
    children: [
      {
        path: "inicio",
        component: InicioComponent,
      },
      {
        path: 'usuarios',
        children: [
          {
            path: "listar",
            component: ListarUsuariosComponent
          },
          {
            path: "form",
            component: FormUsuariosComponent
          }
        ]
      },
      {
        path: "monitorar",
        children: [
          {
            path: "pix",
            component: MonitorarPixesComponent
          }
        ]
      },
      {
        path: "pix",
        children: [
          {
            path: "listar",
            component: PixListarComponent
          },
        ]
      },
      {
        path: "configuracoes",
        children: []
      },
      {
        path: "relatorios",
        children: []
      },
      {
        path: "logoff",
        component: LogoffComponent
      },
      {
        path: '',
        redirectTo: '/admin/inicio',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
