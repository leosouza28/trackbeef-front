import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { EndpointsService } from 'src/app/services/endpoints.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-pix-listar',
  templateUrl: './pix-listar.component.html',
  styleUrls: ['./pix-listar.component.scss']
})
export class PixListarComponent implements OnInit {

  @ViewChild('pixDetailsModal') pixDetailsModalRef!: TemplateRef<any>;

  data: any = { lista: [], total: 0 }
  form: FormGroup;
  pixForm!: FormGroup;
  loading: boolean = false;
  creatingPix: boolean = false;
  pixCriado: any = null;

  status = ['ATIVO', 'CONCLUIDO', 'EXPIRADO'];

  constructor(
    private endpointsService: EndpointsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private alert: AlertService
  ) {
    this.form = this.fb.group({
      q: this.fb.control(""),
      page: this.fb.control("1"),
      perpage: this.fb.control("10"),
      status: this.fb.control("TODOS"),
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(({ ...params }) => {
      if (Object.keys(params).length == 0) this.initializeRoute(true);
      else this.busca(params);
    })
  }

  initializeRoute(init = false) {
    let q = { ...this.form.getRawValue(), unix: dayjs().unix() };
    if (q?.page) q.page = Number(q.page);
    if (q?.perpage) q.perpage = Number(q.perpage);
    if (init) this.router.navigate([window.location.pathname], { queryParams: q, replaceUrl: true })
    return q;
  }

  query() {
    this.router.navigate([window.location.pathname], {
      queryParams: { ...this.initializeRoute() }
    })
  }

  async busca(q: any) {
    if (this.loading) return;
    this.loading = true;
    try {
      for (let i in q) this.form.get(i)?.setValue(q[i]);
      let values = this.form.getRawValue();
      let data: any = await this.endpointsService.getPix({ ...values });
      this.data = data;
    } catch (error) {
      console.log("Error", error);
    }
    this.loading = false;
  }

  openCreatePixModal(content: any) {
    this.pixForm = this.fb.group({
      tipo_documento: this.fb.control('cpf'),
      nome_cliente: this.fb.control(''),
      documento_cliente: this.fb.control(''),
      valor: this.fb.control('', [Validators.required, Validators.min(0.01)]),
      expiracao_segundos: this.fb.control(3600, [Validators.required, Validators.min(60), Validators.max(86400)]),
      descricao: this.fb.control('', [Validators.maxLength(140)])
    });
    this.modalService.open(content, { size: 'md', centered: true });
  }

  async createPix() {
    if (this.pixForm.invalid || this.creatingPix) return;

    // Validar documento se foi preenchido
    const documento = this.pixForm.get('documento_cliente')?.value;
    if (documento) {
      const tipoDoc = this.pixForm.get('tipo_documento')?.value;
      if (!this.validarDocumento(documento, tipoDoc)) {
        this.alert.showDanger(`${tipoDoc.toUpperCase()} inválido!`);
        return;
      }
    }

    this.creatingPix = true;
    try {
      const formData = this.pixForm.getRawValue();
      const payload: any = {
        valor: Number(formData.valor),
        expiracao_segundos: Number(formData.expiracao_segundos)
      };

      if (formData.nome_cliente) {
        payload.nome_cliente = formData.nome_cliente;
      }

      if (formData.documento_cliente) {
        if (formData.tipo_documento === 'cpf') {
          payload.cpf_cliente = formData.documento_cliente.replace(/\D/g, '');
        } else {
          payload.cnpj_cliente = formData.documento_cliente.replace(/\D/g, '');
        }
      }

      if (formData.descricao) {
        payload.descricao = formData.descricao;
      }

      const response = await this.endpointsService.createPix(payload);
      console.log('PIX criado:', response);
      
      this.modalService.dismissAll();
      this.pixCriado = response;
      this.alert.showSuccess('PIX criado com sucesso!');
      
      // Atualizar lista
      await this.busca(this.initializeRoute());
      
      // Abrir modal de detalhes automaticamente
      setTimeout(() => {
        this.openPixDetailsModal(this.pixDetailsModalRef);
      }, 300);
    } catch (error: any) {
      this.alert.showDanger(error?.message || 'Erro ao criar PIX');
    }
    this.creatingPix = false;
  }

  validarDocumento(documento: string, tipo: string): boolean {
    const numeros = documento.replace(/\D/g, '');
    
    if (tipo === 'cpf') {
      if (numeros.length !== 11) return false;
      // Validação básica de CPF
      if (/^(\d)\1{10}$/.test(numeros)) return false;
      return true;
    } else {
      if (numeros.length !== 14) return false;
      // Validação básica de CNPJ
      if (/^(\d)\1{13}$/.test(numeros)) return false;
      return true;
    }
  }

  getMascaraDocumento(): string {
    const tipo = this.pixForm?.get('tipo_documento')?.value;
    return tipo === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00';
  }

  openPixDetailsModal(content: any) {
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  viewPixDetails(pix: any, content: any) {
    this.pixCriado = pix;
    this.openPixDetailsModal(content);
  }

  copiarTexto(texto: string) {
    navigator.clipboard.writeText(texto).then(() => {
      this.alert.showSuccess('Copiado para a área de transferência!');
    }).catch(() => {
      this.alert.showDanger('Erro ao copiar texto');
    });
  }

  formatarData(data: string): string {
    return dayjs(data).format('DD/MM/YYYY HH:mm:ss');
  }

}
