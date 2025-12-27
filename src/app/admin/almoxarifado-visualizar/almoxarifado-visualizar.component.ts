import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EndpointsService } from 'src/app/services/endpoints.service';

@Component({
  selector: 'app-almoxarifado-visualizar',
  templateUrl: './almoxarifado-visualizar.component.html',
  styleUrls: ['./almoxarifado-visualizar.component.scss']
})
export class AlmoxarifadoVisualizarComponent {

  data: any = {
    lista: [],
    lista_pecas: [],
    valor_total_estoque: 0,
    total_itens_estoque: 0
  };
  
  lista_pecas_filtrada: any[] = [];
  loading: boolean = false;
  
  // Filtros
  filtro_produto: string = '';
  filtro_peso_maior: number | null = null;
  filtro_peso_menor: number | null = null;
  filtro_status: string = '';
  ordem_peso: 'asc' | 'desc' = 'desc';
  
  produtos_disponiveis: any[] = [];
  
  // Modal de detalhes
  mostrarModalDetalhes: boolean = false;
  pecaSelecionadaDetalhes: any = null;
  
  // Referência ao Object para usar no template
  Object = Object;

  constructor(private activateRoute: ActivatedRoute, private endpointService: EndpointsService) {
    this.activateRoute.params.subscribe(params => {
      this.getEstoque(params['id']);
    });
  }


  async getEstoque(id: string) {
    if (this.loading) return;
    this.loading = true;
    try {
      let data: any = await this.endpointService.getAlmoxarifadoEstoqueListaById(id);
      this.data = data;
      this.lista_pecas_filtrada = [...data.lista_pecas];
      
      // Extrair produtos únicos para o filtro
      const produtosMap = new Map();
      data.lista_pecas.forEach((peca: any) => {
        if (peca.produto && !produtosMap.has(peca.produto._id)) {
          produtosMap.set(peca.produto._id, peca.produto);
        }
      });
      this.produtos_disponiveis = Array.from(produtosMap.values());
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
    }
    this.loading = false;
  }

  aplicarFiltros() {
    this.lista_pecas_filtrada = this.data.lista_pecas.filter((peca: any) => {
      let passa = true;
      
      // Filtro por produto
      if (this.filtro_produto && peca.produto?._id !== this.filtro_produto) {
        passa = false;
      }
      
      // Filtro peso maior que
      if (this.filtro_peso_maior !== null && peca.peso <= this.filtro_peso_maior) {
        passa = false;
      }
      
      // Filtro peso menor que
      if (this.filtro_peso_menor !== null && peca.peso >= this.filtro_peso_menor) {
        passa = false;
      }
      
      // Filtro por status
      if (this.filtro_status && peca.status_estoque !== this.filtro_status) {
        passa = false;
      }
      
      return passa;
    });
    
    // Ordenar por peso
    this.ordenarPorPeso();
  }

  ordenarPorPeso() {
    this.lista_pecas_filtrada.sort((a: any, b: any) => {
      if (this.ordem_peso === 'asc') {
        return a.peso - b.peso;
      } else {
        return b.peso - a.peso;
      }
    });
  }

  limparFiltros() {
    this.filtro_produto = '';
    this.filtro_peso_maior = null;
    this.filtro_peso_menor = null;
    this.filtro_status = '';
    this.ordem_peso = 'desc';
    this.lista_pecas_filtrada = [...this.data.lista_pecas];
    this.ordenarPorPeso();
  }

  abrirModalDetalhes(peca: any) {
    this.pecaSelecionadaDetalhes = peca;
    this.mostrarModalDetalhes = true;
  }

  fecharModalDetalhes() {
    this.mostrarModalDetalhes = false;
    this.pecaSelecionadaDetalhes = null;
  }

}
