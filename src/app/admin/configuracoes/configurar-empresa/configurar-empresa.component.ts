import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { EndpointsService } from 'src/app/services/endpoints.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-configurar-empresa',
  templateUrl: './configurar-empresa.component.html',
  styleUrls: ['./configurar-empresa.component.scss']
})
export class ConfigurarEmpresaComponent implements OnInit {
  form: FormGroup;
  loading = false;
  configId: string = '';
  
  // Logo upload
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;
  uploadingLogo = false;
  logoUrl: string = '';

  constructor(
    private endpointService: EndpointsService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      razao_social: ['', Validators.required],
      doc_type: ['CNPJ', Validators.required],
      documento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefones: [''],
      codigo_acesso: [''],
      ativo: [true],
      logo: [''],
      endereco: this.fb.group({
        cep: [''],
        logradouro: [''],
        numero: [''],
        complemento: [''],
        bairro: [''],
        cidade: [''],
        estado: [''],
        pais: ['BR']
      }),
      juros: this.fb.group({
        tipo: ['percentual'],
        dias: [0],
        valor: [0]
      }),
      multa: this.fb.group({
        tipo: ['percentual'],
        dias: [0],
        valor: [0]
      })
    });
  }

  ngOnInit(): void {
    this.getItem();
  }

  async getItem() {
    try {
      this.loading = true;
      let config = await this.endpointService.getConfiguracoesEmpresa();
      console.log(config);

      if (config) {
        this.configId = config._id;

        // Converter array de telefones em string
        const telefones = config.telefones?.join(', ') || '';

        this.form.patchValue({
          nome: config.nome,
          razao_social: config.razao_social,
          doc_type: config.doc_type,
          documento: config.documento,
          email: config.email,
          telefones: telefones,
          codigo_acesso: config.codigo_acesso,
          ativo: config.ativo,
          logo: config.logo || '',
          endereco: config.endereco || {},
          juros: config.juros || { tipo: 'percentual', dias: 0, valor: 0 },
          multa: config.multa || { tipo: 'percentual', dias: 0, valor: 0 }
        });
        
        this.logoUrl = config.logo || '';
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    try {
      this.loading = true;

      const formValue = this.form.value;

      // Converter telefones de string para array
      const telefones = formValue.telefones
        .split(',')
        .map((tel: string) => tel.trim())
        .filter((tel: string) => tel);

      const data = {
        ...formValue,
        telefones
      };

      // Aqui você precisa adicionar o método de atualização no seu service
      await this.endpointService.postConfiguracoesEmpresa(data);

      this.alertService.showSuccess('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      this.alertService.showDanger('Erro ao salvar configurações. Tente novamente.');
    } finally {
      this.loading = false;
    }
  }

  buscarCep() {
    const cep = this.form.get('endereco.cep')?.value?.replace(/\D/g, '');

    if (cep?.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
          if (!data.erro) {
            this.form.patchValue({
              endereco: {
                logradouro: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf
              }
            });
          }
        })
        .catch(error => console.error('Erro ao buscar CEP:', error));
    }
  }

  // Métodos para upload de logo
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.blob;
  }

  imageLoaded() {
    // Imagem carregada com sucesso
  }

  cropperReady() {
    // Cropper pronto
  }

  loadImageFailed() {
    this.alertService.showDanger('Erro ao carregar a imagem');
    this.showCropper = false;
  }

  cancelCrop() {
    this.imageChangedEvent = '';
    this.croppedImage = '';
    this.showCropper = false;
  }

  async uploadCroppedImage() {
    if (!this.croppedImage) {
      this.alertService.showWarning('Nenhuma imagem selecionada');
      return;
    }

    try {
      this.uploadingLogo = true;

      const formData = new FormData();
      formData.append('image', this.croppedImage, 'logo.png');

      const response = await this.endpointService.uploadImage(formData);
      
      if (response?.url) {
        this.logoUrl = response.url;
        this.form.patchValue({ logo: response.url });
        this.alertService.showSuccess('Logo enviada com sucesso!');
        this.showCropper = false;
        this.imageChangedEvent = '';
      }
    } catch (error) {
      console.error('Erro ao fazer upload da logo:', error);
      this.alertService.showDanger('Erro ao enviar logo. Tente novamente.');
    } finally {
      this.uploadingLogo = false;
    }
  }

  removeLogo() {
    this.logoUrl = '';
    this.form.patchValue({ logo: '' });
    this.imageChangedEvent = '';
    this.croppedImage = '';
  }
}
