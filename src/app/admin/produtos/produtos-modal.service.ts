import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProdutosFormComponent } from './produtos-form/produtos-form.component';

@Injectable({
  providedIn: 'root'
})
export class ProdutosModalService {

  constructor(private modalService: NgbModal) { }

  /**
   * Abre o formulário de produto como modal
   * @param produtoId ID do produto para edição (opcional)
   * @returns Promise com os dados do produto criado/editado ou undefined se cancelado
   */
  async openProdutoModal(produtoId?: string): Promise<any> {
    const modalRef = this.modalService.open(ProdutosFormComponent, {
      size: 'lg',
      backdrop: 'static',
      scrollable: true
    });

    // Passa o activeModal e o ID (se houver) para o componente
    modalRef.componentInstance.modal = modalRef;
    if (produtoId) {
      modalRef.componentInstance.produtoId = produtoId;
    }

    try {
      const result = await modalRef.result;
      return result;
    } catch (error) {
      // Modal foi fechado/cancelado
      return undefined;
    }
  }
}
