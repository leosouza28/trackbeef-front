import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessaoService } from 'src/app/services/sessao.service';

@Component({
  selector: 'app-area-cliente-sair',
  templateUrl: './area-cliente-sair.component.html',
  styleUrls: ['./area-cliente-sair.component.scss']
})
export class AreaClienteSairComponent implements OnInit {


  constructor(private sessao: SessaoService, private router: Router) {

  }

  ngOnInit(): void {
    this.sessao.clearSession()
    this.sessao.clearCarrinho();
    this.router.navigate(['/ingressos']);
  }
}
