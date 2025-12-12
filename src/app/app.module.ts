import { HttpClientModule } from '@angular/common/http';
import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
import { AreaClienteSairComponent } from './cliente/area-cliente-sair/area-cliente-sair.component';
import { ClienteContainerComponent } from './cliente/cliente-container/cliente-container.component';
import { HomeComponent } from './cliente/home/home.component';
import { AlertComponent } from './components/alert/alert.component';
import { CarrinhoFloatComponent } from './components/carrinho-float/carrinho-float.component';
import { ClienteQuickFormComponent } from './components/cliente-quick-form/cliente-quick-form.component';
import { ImageCropperModalComponent } from './components/image-cropper-modal/image-cropper-modal.component';
import { IngressoCardComponent } from './components/ingresso-card/ingresso-card.component';
import { InlineErrorComponent } from './components/inline-error/inline-error.component';
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
import { MonitorarPixesComponent } from './admin/monitorar/monitorar-pixes/monitorar-pixes.component';
import { DateFromNowPipe } from './pipes/date-from-now.pipe';
import { PixGerarComponent } from './admin/pixs/pix-gerar/pix-gerar.component';
import { PixListarComponent } from './admin/pixs/pix-listar/pix-listar.component';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePt, 'pt-BR');

LOAD_WASM('assets/wasm/ngx-scanner-qrcode.wasm').subscribe();


export const customCurrencyMaskConfig = {
  align: "right",
  allowNegative: true,
  allowZero: true,
  decimal: ",",
  precision: 2,
  prefix: "R$ ",
  suffix: "",
  thousands: ".",
  nullable: true
};


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
    CarrinhoFloatComponent,
    IngressoCardComponent,
    AreaClienteSairComponent,
    AlertComponent,
    UsuarioRefreshTokenComponent,
    ImageCropperModalComponent,
    MonitorarPixesComponent,
    DateFromNowPipe,
    PixGerarComponent,
    PixListarComponent,
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
      prefix: "R$ ",
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
