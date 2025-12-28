import { Component, isDevMode, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SessaoService } from 'src/app/services/sessao.service';
import { Router } from '@angular/router';
import { EndpointsService } from 'src/app/services/endpoints.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CadastroPessoaModalComponent } from 'src/app/components/cadastro-pessoa-modal/cadastro-pessoa-modal.component';
import { AlertService } from 'src/app/services/alert.service';



@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form_activation: FormGroup;
  loading_activation: boolean = false;

  form: FormGroup;
  error: any;
  loading: boolean = false;

  step: number = 1;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    public sessao: SessaoService,
    private alert: AlertService,
    private router: Router,
    private endpoint: EndpointsService,
    private modalService: NgbModal
  ) {
    this.form_activation = this.fb.group({
      codigo_ativacao: this.fb.control("", [Validators.required, Validators.maxLength(6), Validators.minLength(6)]),
    });

    this.form = this.fb.group({
      documento: this.fb.control("", [Validators.required]),
      senha: this.fb.control("", [Validators.required])
    });
  }

  ngOnInit(): void {
    this.verificarSessao();
    if (isDevMode()) {
      this.form_activation.patchValue({
        codigo_ativacao: "000000"
      });
      this.form.patchValue({
        documento: "admin",
        senha: "leo1010"
      });
    }
  }

  async verificarSessao() {
    let sessao = this.sessao.getUser();
    if (!sessao) {
      let empresa = await this.sessao.getEmpresaAtiva();
      if (empresa) {
        this.step = 2;
      }
    }
    if (sessao) {
      this.api.logDev('Logged user', sessao);
      this.router.navigate(['/admin/inicio']);
    }
  }


  async onSubmit() {
    if (this.loading) return;
    this.loading = true;
    this.error = null;
    try {
      let { documento, senha } = this.form.value;
      let data = await this.endpoint.login(documento, senha);
      this.sessao.setUser(data);
      this.router.navigate(['/admin/inicio'])
    } catch (error) {
      this.api.logDev(error);
      this.error = error;
    }
    this.loading = false;
  }

  async onSubmitAtivacao() {
    if (this.loading_activation) return;
    this.loading_activation = true;
    this.error = null;
    try {
      let { codigo_ativacao } = this.form_activation.value;
      let data = await this.endpoint.getEmpresaByCodigoAtivacao(codigo_ativacao);
      this.sessao.setEmpresaAtiva(data);
      this.step = 2;
    } catch (error: any) {
      this.alert.showDanger(error);
    } finally {
      this.loading_activation = false;
    }
  }

  abrirModalCadastro() {
    const modalRef = this.modalService.open(CadastroPessoaModalComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.result.then(async (result) => {
      this.api.logDev('Dados do formulário:', result);

      if (result && result.codigo_acesso) {
        // Preenche o código de ativação
        this.form_activation.patchValue({
          codigo_ativacao: result.codigo_acesso
        });

        // Busca a empresa automaticamente
        try {
          this.loading_activation = true;
          const empresa = await this.endpoint.getEmpresaByCodigoAtivacao(result.codigo_acesso);
          this.sessao.setEmpresaAtiva(empresa);

          // Preenche username e senha
          this.form.patchValue({
            documento: result.usuario?.username || '',
            senha: result.senha || ''
          });

          this.step = 2;
        } catch (error) {
          this.api.logDev('Erro ao ativar empresa:', error);
          this.error = error;

        } finally {
          this.loading_activation = false;
        }
      }
    }).catch((error) => {
      this.api.logDev('Modal fechado sem salvar', error);
    });
  }

  clearEmpresa() {
    this.sessao.clearEmpresaAtiva();
    this.step = 1;
  }

}
