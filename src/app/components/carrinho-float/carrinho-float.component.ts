import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SessaoService } from 'src/app/services/sessao.service';

@Component({
  selector: 'carrinho-float',
  templateUrl: './carrinho-float.component.html',
  styleUrls: ['./carrinho-float.component.scss']
})
export class CarrinhoFloatComponent {
  totalIngressos = 0;
  valorTotal = 0;

  constructor(private router: Router, private sessao: SessaoService) { }

  ngOnInit(): void {
    let carrinho = this.sessao.getCarrinho();
    if (carrinho) this.recalcula(carrinho);
    this.sessao.carrinhoSubject.subscribe(carrinho => {
      if (carrinho.length) this.recalcula(carrinho);
    });

  }

  get hasCarrinho(): boolean {
    let bol = false;
    let items = this.sessao.getCarrinho();
    if (items.length) bol = true;
    return bol
  }
  recalcula(carrinho: any) {
    this.totalIngressos = carrinho.reduce((sum: number, item: any) => sum + item.qtd, 0);
    this.valorTotal = carrinho.reduce((sum: number, item: any) => sum + (item.qtd * item.valor), 0);
  }

  irParaCheckout() {
    this.router.navigate(['/checkout']);
  }

  get labelIngressos(): string {
    let label = "Nenhum ingresso na sacola";
    if (this.totalIngressos > 0) {
      label = this.totalIngressos + " ingresso" + (this.totalIngressos > 1 ? "s" : "");
    }
    return label;
  }

}
