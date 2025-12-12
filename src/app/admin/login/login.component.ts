import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SessaoService } from 'src/app/services/sessao.service';
import { Router } from '@angular/router';
import { EndpointsService } from 'src/app/services/endpoints.service';



@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  error: any;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private api: ApiService, private sessao: SessaoService, private router: Router, private endpoint: EndpointsService) {
    this.form = this.fb.group({
      documento: this.fb.control("", [Validators.required]),
      senha: this.fb.control("", [Validators.required])
    });
  }

  ngOnInit(): void {
    this.verificarSessao();
  }

  verificarSessao() {
    let sessao = this.sessao.getUser();
    console.log(sessao);
    if (sessao) {
      this.api.logDev('Logged user', sessao);
      this.router.navigate(['/admin']);
    }
  }


  async onSubmit() {
    if (this.loading) return;
    this.loading = true;
    this.error = null;
    try {
      let { documento, senha } = this.form.value;
      let data = await this.endpoint.login(documento, senha, 'ADMIN');
      this.sessao.setUser(data);
      this.router.navigate(['/admin/inicio'])
    } catch (error) {
      this.api.logDev(error);
      this.error = error;
    }
    this.loading = false;
  }

}
