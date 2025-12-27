import { HttpClientModule } from '@angular/common/http';
import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule, NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angularx-qrcode';
import { NgChartsModule } from 'ng2-charts';
import { NgxCurrencyDirective, NgxCurrencyInputMode, provideEnvironmentNgxCurrency } from 'ngx-currency';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { LOAD_WASM } from 'ngx-scanner-qrcode';
import { AdminContainerComponent } from './admin/admin-container/admin-container.component';
import { InicioComponent } from './admin/inicio/inicio.component';
import { LoginComponent } from './admin/login/login.component';
import { LogoffComponent } from './admin/logoff/logoff.component';
import { FormPerfisComponent } from './admin/perfis/form-perfis/form-perfis.component';
import { ListarPerfisComponent } from './admin/perfis/listar-perfis/listar-perfis.component';
import { FormUsuariosComponent } from './admin/usuarios/form-usuarios/form-usuarios.component';
import { ListarUsuariosComponent } from './admin/usuarios/listar-usuarios/listar-usuarios.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClienteContainerComponent } from './cliente/cliente-container/cliente-container.component';
import { HomeComponent } from './cliente/home/home.component';
import { AlertComponent } from './components/alert/alert.component';
import { ClienteQuickFormComponent } from './components/cliente-quick-form/cliente-quick-form.component';
import { ImageCropperModalComponent } from './components/image-cropper-modal/image-cropper-modal.component';
import { IngressoCardComponent } from './components/ingresso-card/ingresso-card.component';
import { InlineErrorComponent } from './components/inline-error/inline-error.component';
import { CadastroPessoaModalComponent } from './components/cadastro-pessoa-modal/cadastro-pessoa-modal.component';
import { InlineLoadingComponent } from './components/inline-loading/inline-loading.component';
import { NumericPadComponent } from './components/numeric-pad/numeric-pad.component';
import { RenderBadgeComponent } from './components/render-badge/render-badge.component';
import { TableTemplateComponent } from './components/table-template/table-template.component';
import { TextSpinnerComponent } from './components/text-spinner/text-spinner.component';
import { CpfCnpjPipe } from './pipes/cpf-cnpj.pipe';
import { DateSimplePipe } from './pipes/date-simple.pipe';
import { MoneyBrlPipe } from './pipes/money-brl.pipe';
import { PaymentDescriptionPipe } from './pipes/payment-description.pipe';
import { PhonePipe } from './pipes/phone.pipe';
import { UserAgentPipe } from './pipes/user-agent.pipe';
import { UserInfoPipe } from './pipes/user-info.pipe';
import { UsuarioRefreshTokenComponent } from './usuario-refresh-token/usuario-refresh-token.component';
import { DateFromNowPipe } from './pipes/date-from-now.pipe';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { ListarEstoqueComponent } from './admin/estoque/listar-estoque/listar-estoque.component';
import { EntradaNotasComponent } from './admin/estoque/entrada-notas/entrada-notas.component';
import { EntradaNotasListarComponent } from './admin/estoque/entrada-notas-listar/entrada-notas-listar.component';
import { ProdutosListarComponent } from './admin/produtos/produtos-listar/produtos-listar.component';
import { ProdutosFormComponent } from './admin/produtos/produtos-form/produtos-form.component';
import { ListarPessoasComponent } from './admin/pessoas/listar-pessoas/listar-pessoas.component';
import { FormPessoasComponent } from './admin/pessoas/form-pessoas/form-pessoas.component';
import { AlmoxarifadoListarComponent } from './admin/almoxarifado-listar/almoxarifado-listar.component';
import { AlmoxarifadoFormComponent } from './admin/almoxarifado-form/almoxarifado-form.component';
import { HistoricoEstoqueProdutoComponent } from './admin/estoque/historico-estoque-produto/historico-estoque-produto.component';
import { VendasListarComponent } from './admin/vendas/vendas-listar/vendas-listar.component';
import { VendasPdvComponent } from './admin/vendas/vendas-pdv/vendas-pdv.component';
import { FormasPagamentoListarComponent } from './admin/configuracoes/formas-pagamento-listar/formas-pagamento-listar.component';
import { FormasPagamentoFormComponent } from './admin/configuracoes/formas-pagamento-form/formas-pagamento-form.component';
import { JurosMultasFormComponent } from './admin/configuracoes/juros-multas-form/juros-multas-form.component';
import { NextOnEnterDirective } from './directives/next-on-enter.directive';
import { VendasVisualizacaoComponent } from './admin/vendas/vendas-visualizacao/vendas-visualizacao.component';
import { CaixaListarComponent } from './admin/financeiro/caixa-listar/caixa-listar.component';
import { ContaspagarListarComponent } from './admin/financeiro/contaspagar-listar/contaspagar-listar.component';
import { ContasreceberListarComponent } from './admin/financeiro/contasreceber-listar/contasreceber-listar.component';
import { CaixaFormComponent } from './admin/financeiro/caixa-form/caixa-form.component';
import { MultiCheckboxSelectComponent } from './components/multi-checkbox-select/multi-checkbox-select.component';
import { CaixaLancamentosComponent } from './admin/financeiro/caixa-lancamentos/caixa-lancamentos.component';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { TutorialComponent } from './admin/tutorial/tutorial.component';
import { HelpButtonComponent } from './components/help-button/help-button.component';
import { AlmoxarifadoVisualizarComponent } from './admin/almoxarifado-visualizar/almoxarifado-visualizar.component';
import { RecebimentosComponent } from './admin/financeiro/recebimentos/recebimentos.component';
import { RecebimentosClientesComponent } from './admin/financeiro/recebimentos-clientes/recebimentos-clientes.component';
import { ConfigurarEmpresaComponent } from './admin/configuracoes/configurar-empresa/configurar-empresa.component';
import { ClientesFaturasComponent } from './cliente/public/clientes-faturas/clientes-faturas.component';

registerLocaleData(localePt, 'pt-BR');

LOAD_WASM('assets/wasm/ngx-scanner-qrcode.wasm').subscribe();



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InicioComponent,
    LoginComponent,
    FormPerfisComponent,
    ListarPerfisComponent,
    FormUsuariosComponent,
    ListarUsuariosComponent,
    AdminContainerComponent,
    TableTemplateComponent,
    InlineLoadingComponent,
    InlineErrorComponent,
    TextSpinnerComponent,
    MoneyBrlPipe,
    DateSimplePipe,
    CpfCnpjPipe,
    PaymentDescriptionPipe,
    UserInfoPipe,
    UserAgentPipe,
    PhonePipe,
    LogoffComponent,
    RenderBadgeComponent,
    NumericPadComponent,
    ClienteQuickFormComponent,
    ClienteContainerComponent,
    IngressoCardComponent,
    AlertComponent,
    UsuarioRefreshTokenComponent,
    ImageCropperModalComponent,
    CadastroPessoaModalComponent,
    DateFromNowPipe,
    ListarEstoqueComponent,
    EntradaNotasComponent,
    EntradaNotasListarComponent,
    ProdutosListarComponent,
    ProdutosFormComponent,
    ListarPessoasComponent,
    FormPessoasComponent,
    AlmoxarifadoListarComponent,
    AlmoxarifadoFormComponent,
    HistoricoEstoqueProdutoComponent,
    VendasListarComponent,
    VendasPdvComponent,
    FormasPagamentoListarComponent,
    FormasPagamentoFormComponent,
    JurosMultasFormComponent,
    NextOnEnterDirective,
    VendasVisualizacaoComponent,
    CaixaListarComponent,
    ContaspagarListarComponent,
    ContasreceberListarComponent,
    CaixaFormComponent,
    MultiCheckboxSelectComponent,
    CaixaLancamentosComponent,
    TutorialComponent,
    HelpButtonComponent,
    AlmoxarifadoVisualizarComponent,
    RecebimentosComponent,
    RecebimentosClientesComponent,
    ConfigurarEmpresaComponent,
    ClientesFaturasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule,
    NgbModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgxCurrencyDirective,
    BrowserAnimationsModule,
    QRCodeModule,
    ImageCropperComponent,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideEnvironmentNgxCurrency({
      align: "left",
      allowNegative: false,
      allowZero: true,
      decimal: ",",
      precision: 2,
      prefix: "",
      suffix: "",
      thousands: ".",
      nullable: true,
      min: null,
      max: null,
      inputMode: NgxCurrencyInputMode.Financial
    }),
    provideNgxMask()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
