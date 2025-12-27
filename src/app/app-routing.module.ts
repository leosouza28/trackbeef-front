import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminContainerComponent } from "./admin/admin-container/admin-container.component";
import { InicioComponent } from "./admin/inicio/inicio.component";
import { LoginComponent } from "./admin/login/login.component";
import { LogoffComponent } from "./admin/logoff/logoff.component";
import { FormUsuariosComponent } from "./admin/usuarios/form-usuarios/form-usuarios.component";
import { ListarUsuariosComponent } from "./admin/usuarios/listar-usuarios/listar-usuarios.component";
import { ClienteContainerComponent } from "./cliente/cliente-container/cliente-container.component";
import { HomeComponent } from "./cliente/home/home.component";
import { AuthGuard } from './services/auth-guard.service';
import { UsuarioRefreshTokenComponent } from "./usuario-refresh-token/usuario-refresh-token.component";
import { ListarPerfisComponent } from "./admin/perfis/listar-perfis/listar-perfis.component";
import { FormPerfisComponent } from "./admin/perfis/form-perfis/form-perfis.component";
import { ListarEstoqueComponent } from "./admin/estoque/listar-estoque/listar-estoque.component";
import { EntradaNotasComponent } from "./admin/estoque/entrada-notas/entrada-notas.component";
import { EntradaNotasListarComponent } from "./admin/estoque/entrada-notas-listar/entrada-notas-listar.component";
import { ListarPessoasComponent } from "./admin/pessoas/listar-pessoas/listar-pessoas.component";
import { FormPessoasComponent } from "./admin/pessoas/form-pessoas/form-pessoas.component";
import { ProdutosFormComponent } from "./admin/produtos/produtos-form/produtos-form.component";
import { ProdutosListarComponent } from "./admin/produtos/produtos-listar/produtos-listar.component";
import { AlmoxarifadoListarComponent } from "./admin/almoxarifado-listar/almoxarifado-listar.component";
import { AlmoxarifadoFormComponent } from "./admin/almoxarifado-form/almoxarifado-form.component";
import { HistoricoEstoqueProdutoComponent } from "./admin/estoque/historico-estoque-produto/historico-estoque-produto.component";
import { VendasListarComponent } from "./admin/vendas/vendas-listar/vendas-listar.component";
import { VendasPdvComponent } from "./admin/vendas/vendas-pdv/vendas-pdv.component";
import { FormasPagamentoListarComponent } from "./admin/configuracoes/formas-pagamento-listar/formas-pagamento-listar.component";
import { FormasPagamentoFormComponent } from "./admin/configuracoes/formas-pagamento-form/formas-pagamento-form.component";
import { JurosMultasFormComponent } from "./admin/configuracoes/juros-multas-form/juros-multas-form.component";
import { VendasVisualizacaoComponent } from "./admin/vendas/vendas-visualizacao/vendas-visualizacao.component";
import { CaixaListarComponent } from "./admin/financeiro/caixa-listar/caixa-listar.component";
import { ContasreceberListarComponent } from "./admin/financeiro/contasreceber-listar/contasreceber-listar.component";
import { ContaspagarListarComponent } from "./admin/financeiro/contaspagar-listar/contaspagar-listar.component";
import { CaixaFormComponent } from "./admin/financeiro/caixa-form/caixa-form.component";
import { CaixaLancamentosComponent } from "./admin/financeiro/caixa-lancamentos/caixa-lancamentos.component";
import { TutorialComponent } from "./admin/tutorial/tutorial.component";
import { AlmoxarifadoVisualizarComponent } from "./admin/almoxarifado-visualizar/almoxarifado-visualizar.component";
import { RecebimentosComponent } from "./admin/financeiro/recebimentos/recebimentos.component";
import { RecebimentosClientesComponent } from "./admin/financeiro/recebimentos-clientes/recebimentos-clientes.component";
import { ConfigurarEmpresaComponent } from "./admin/configuracoes/configurar-empresa/configurar-empresa.component";
import { ClientesFaturasComponent } from "./cliente/public/clientes-faturas/clientes-faturas.component";


const routes: Routes = [
  {
    path: '',
    component: ClienteContainerComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
    ]
  },
  {
    path: 'cliente',
    children: [
      {
        path: ':id/faturas',
        component: ClientesFaturasComponent
      }
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
        path: "tutorial",
        component: TutorialComponent,
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
        path: 'vendas',
        children: [
          {
            path: "listar",
            component: VendasListarComponent
          },
          {
            path: "visualizar",
            component: VendasVisualizacaoComponent
          },
          {
            path: "pdv",
            component: VendasPdvComponent
          }
        ]
      },
      {
        path: 'pessoas',
        children: [
          {
            path: "listar",
            component: ListarPessoasComponent
          },
          {
            path: "form",
            component: FormPessoasComponent
          }
        ]
      },
      {
        path: 'almoxarifados',
        children: [
          {
            path: "listar",
            component: AlmoxarifadoListarComponent
          },
          {
            path: "form",
            component: AlmoxarifadoFormComponent
          },
          {
            path: ":id/visualizar",
            component: AlmoxarifadoVisualizarComponent
          }
        ]
      },
      {
        path: 'perfis',
        children: [
          {
            path: "listar",
            component: ListarPerfisComponent
          },
          {
            path: "form",
            component: FormPerfisComponent
          }
        ]
      },
      {
        path: 'notas-entradas',
        children: [
          {
            path: "listar",
            component: EntradaNotasListarComponent
          },
          {
            path: "form",
            component: EntradaNotasComponent
          }
        ]
      },
      {
        path: 'produtos',
        children: [
          {
            path: "listar",
            component: ProdutosListarComponent
          },
          {
            path: "form",
            component: ProdutosFormComponent
          }
        ]
      },
      {
        path: 'estoque',
        children: [
          {
            path: "listar",
            component: ListarEstoqueComponent
          },
          {
            path: "historico",
            component: HistoricoEstoqueProdutoComponent
          },
        ]
      },
      {
        path: 'financeiro',
        children: [
          {
            path: "caixa/listar",
            component: CaixaListarComponent
          },
          {
            path: "caixa/form",
            component: CaixaFormComponent
          },
          {
            path: "caixa/:id/lancamentos",
            component: CaixaLancamentosComponent
          },
          {
            path: "contas-a-receber/listar",
            component: ContasreceberListarComponent
          },
          {
            path: "contas-a-pagar/listar",
            component: ContaspagarListarComponent
          },
          {
            path: "recebimentos",
            component: RecebimentosComponent
          },
          {
            path: "recebimentos/:id_cliente/listar",
            component: RecebimentosClientesComponent
          },
        ]
      },
      {
        path: "configuracoes",
        children: [
          {
            path: "empresa",
            component: ConfigurarEmpresaComponent
          },
          {
            path: "formas-pagamento/listar",
            component: FormasPagamentoListarComponent
          },
          {
            path: "formas-pagamento/form",
            component: FormasPagamentoFormComponent
          },
          {
            path: "juros-multas/form",
            component: JurosMultasFormComponent
          }
        ]
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
