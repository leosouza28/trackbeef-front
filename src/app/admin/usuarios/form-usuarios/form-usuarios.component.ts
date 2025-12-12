import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';

@Component({
  selector: 'app-form-usuarios',
  templateUrl: './form-usuarios.component.html',
  styleUrls: ['./form-usuarios.component.scss']
})
export class FormUsuariosComponent implements OnInit {

  form: FormGroup;
  status_options = ['ATIVO', 'BLOQUEADO'];
  permissoes: any = [];
  estados_options: any = [];
  cidades_options: any = [];
  loading: boolean = false;
  loading_cidades: boolean = false;
  loading_estados: boolean = false;
  loading_cep: boolean = false;
  user_data: any = null;

  constructor(private fb: FormBuilder, private endpointService: EndpointsService, private router: Router, private route: ActivatedRoute, private alert: AlertService) {
    this.form = this.fb.group({
      _id: this.fb.control(""),
      documento: this.fb.control(""),
      nivel_cliente: this.fb.control(false),
      nivel_admin: this.fb.control(false),
      nivel_vendedor: this.fb.control(false),
      username: this.fb.control(""),
      nome: this.fb.control(""),
      scopes: this.fb.array([]),
      email: this.fb.control(""),
      senha: this.fb.control(""),
      data_nascimento: this.fb.control(null),
      sexo: this.fb.control(""),
      status: this.fb.control("ATIVO"),
      telefones: this.fb.array([
        this.fb.group({
          tipo: this.fb.control(""),
          valor: this.fb.control(""),
          principal: this.fb.control(false)
        })
      ]),
      endereco: this.fb.group({
        cep: this.fb.control(""),
        logradouro: this.fb.control(""),
        numero: this.fb.control(""),
        complemento: this.fb.control(""),
        bairro: this.fb.control(""),
        cidade: this.fb.control(""),
        estado: this.fb.control("")
      })
    });
  }

  ngOnInit(): void {
    this.init();
    this.route.queryParams.subscribe((params) => {
      if (params['id']) this.getUsuario(params['id']);
      else this.resetFormUsuario();
    });
    this.form.get('endereco.estado')?.valueChanges.subscribe((estado) => {
      if (!!estado) this.getCidades(estado);
    });
    // this.form.get('endereco.cep')?.valueChanges.subscribe((cep) => {
    //   if (!cep || cep?.length < 8) return;
    //   this.getConsultaCEP(cep);
    // });
  }

  async init() {
    this.getEstados();
    this.getPermissoes();
  }

  async getUsuario(usuario_id: string) {
    if (this.loading) return;
    this.loading = true;
    try {
      let user = await this.endpointService.getUsuario(usuario_id);
      this.setValues(user);
    } catch (error) {

    }
    this.loading = false;
  }

  async getPermissoes() {
    try {
      let permissoes = await this.endpointService.getPermissoes();
      this.permissoes = this.getPermissoesOrganizadas(permissoes);
      console.log(JSON.stringify(this.permissoes, null, 2));
    } catch (error) {

    }
  }

  getPermissoesOrganizadas(permissoes: any) {
    const permissoesOrganizadas: any[] = [];
    for (const permissao of permissoes) {
      const [secao, acao] = permissao.key.split('.');
      let secaoExistente = permissoesOrganizadas.find(p => p.secao === secao);
      if (!secaoExistente) {
        secaoExistente = { secao, permissoes: [] };
        permissoesOrganizadas.push(secaoExistente);
      }
      secaoExistente.permissoes.push({
        key: permissao.key,
        description: permissao.description,
        acao: acao
      });
    }
    return permissoesOrganizadas;
  }

  setValues(usuario: any) {
    this.user_data = usuario;
    this.form.get('_id')?.setValue(usuario._id);
    this.form.get('documento')?.setValue(usuario.documento);
    if (usuario?.niveis?.indexOf('CLIENTE') > -1) this.form.get('nivel_cliente')?.setValue(true);
    if (usuario?.niveis?.indexOf('ADMIN') > -1) this.form.get('nivel_admin')?.setValue(true);
    if (usuario?.niveis?.indexOf('VENDEDOR') > -1) this.form.get('nivel_vendedor')?.setValue(true);
    if (usuario?.niveis?.indexOf('SUPERVISOR VENDAS') > -1) this.form.get('nivel_supervisor')?.setValue(true);
    this.form.get('nome')?.setValue(usuario.nome);
    this.form.get('username')?.setValue(usuario.username);
    this.form.get('email')?.setValue(usuario?.email || "");
    if (usuario?.data_nascimento?.length == 24) {
      let data = usuario.data_nascimento.split("T")[0];
      this.form.get('data_nascimento')?.setValue(data);
    }
    this.form.get('sexo')?.setValue(usuario?.sexo || "");
    this.form.get('status')?.setValue(usuario?.status || "");
    this.form.get('endereco.cep')?.setValue(usuario.endereco?.cep);
    this.form.get('endereco.logradouro')?.setValue(usuario.endereco?.logradouro);
    this.form.get('endereco.numero')?.setValue(usuario.endereco?.numero);
    this.form.get('endereco.complemento')?.setValue(usuario.endereco?.complemento);
    this.form.get('endereco.bairro')?.setValue(usuario.endereco?.bairro);
    this.form.get('endereco.estado')?.setValue(usuario.endereco?.estado);
    setTimeout(() => {
      this.form.get('endereco.cidade')?.setValue(usuario.endereco?.cidade);
    }, 250);
    this.limparArrayTelefones();
    for (let tel of usuario.telefones) {
      const telefoneForm = this.fb.group({
        tipo: [tel.tipo, Validators.required],
        valor: [tel.valor, Validators.required],
        principal: [tel.principal]
      });
      this.telefonesArray.push(telefoneForm);
    }
    if (usuario?.scopes?.length == 1 && usuario.scopes[0] == '*') {
      this.form.get('scopes')?.disable();
    } else {
      const scopesArray = this.form.get('scopes') as FormArray;
      usuario.scopes?.forEach((scope: string) => scopesArray.push(new FormControl(scope)));
    }
  }

  resetFormUsuario() {
    this.form.patchValue({
      _id: "",
      documento: "",
      nivel_cliente: false,
      nivel_admin: false,
      nivel_vendedor: false,
      username: "",
      nome: "",
      email: "",
      senha: "",
      data_nascimento: null,
      sexo: "",
      status: "ATIVO",
      endereco: {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: ""
      },
      admin: {
        status: "",
        perfil: {
          _id: "",
          nome: ""
        },
        add_permissoes: []
      }
    })
    this.limparArrayTelefones();
  }

  limparArrayTelefones() {
    while (this.telefonesArray.length > 0) {
      this.telefonesArray.removeAt(0);
    }
  }

  async getCidades(estadoSigla: string) {
    if (this.loading_cidades) return;
    this.loading_cidades = true;
    try {
      let cidades = await this.endpointService.getCidades(estadoSigla);
      this.endpointService.logDev(cidades);
      this.cidades_options = cidades;
    } catch (error) {
      // console.log(error);;
    }
    this.loading_cidades = false;
  }

  async getEstados() {
    this.loading_estados = true;
    try {
      let estados = await this.endpointService.getEstados();
      this.estados_options = estados;
    } catch (error) {
    }
    this.loading_estados = false;
  }

  async getConsultaCEP() {
    let cep = this.form.get('endereco.cep')?.value;
    if (!cep || cep?.length < 8) return;
    if (this.loading_cep) return;
    this.loading_cep = true;
    try {
      let response = await this.endpointService.getConsultaCEP(cep);
      if (!!response?.logradouro) {
        this.form.get('endereco.logradouro')?.setValue(response.logradouro);
        this.form.get('endereco.bairro')?.setValue(response.bairro);
        this.form.get('endereco.estado')?.setValue(response.uf);
        this.form.get('endereco.cidade')?.setValue(response.localidade);
      }
    } catch (error) {
      this.endpointService.logDev(error);
    }
    this.loading_cep = false;

  }

  get isNivelAdmin() {
    return this.form.get('nivel_admin')?.value;
  }

  get telefonesArray(): FormArray {
    return this.form.get('telefones') as FormArray;
  }

  addTelefone(): void {
    const telefoneForm = this.fb.group({
      tipo: ['', Validators.required],
      valor: ['', Validators.required],
      principal: [false]
    });
    this.telefonesArray.push(telefoneForm);
  }

  removeTelefone(index: number): void {
    this.telefonesArray.removeAt(index);
  }

  // Verifica se a permissão já está no FormArray
  temScope(scopeKey: string): boolean {
    return this.form.get('scopes')?.value.includes(scopeKey);
  }

  // Adiciona ou remove do FormArray
  toggleScope(event: any, scopeKey: any): void {
    const scopes = this.form.get('scopes') as FormArray;
    if (event?.target?.checked && !scopes.value.includes(scopeKey)) {
      scopes.push(new FormControl(scopeKey));
    } else if (!event?.target?.checked) {
      const index = scopes.controls.findIndex(ctrl => ctrl.value === scopeKey);
      if (index > -1) scopes.removeAt(index);
    }
  }

  async onSubmit() {
    if (this.loading) return;
    this.loading = true;
    try {
      await this.endpointService.postUsuarios(this.form.value);
      this.back();
    } catch (error: any) {
      this.alert.showDanger(error)
    }
    this.loading = false;
  }

  back() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/admin/usuarios/listar']);
    }
  }


}
