import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelpService } from 'src/app/services/help.service';

@Component({
  selector: 'app-help-button',
  templateUrl: './help-button.component.html',
  styleUrls: ['./help-button.component.scss']
})
export class HelpButtonComponent implements OnInit {

  @Input() helpKey: string = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() position: 'inline' | 'floating' = 'inline';

  helpContent: any = null;

  constructor(
    private modalService: NgbModal,
    private helpService: HelpService
  ) { }

  ngOnInit(): void {
    if (this.helpKey) {
      this.helpContent = this.helpService.getHelp(this.helpKey);
    }
  }

  openHelp(content: any): void {
    if (this.helpContent) {
      this.modalService.open(content, { 
        size: 'lg',
        centered: true,
        scrollable: true
      });
    }
  }

  get buttonClass(): string {
    const sizeClass = this.size === 'sm' ? 'btn-sm' : this.size === 'lg' ? 'btn-lg' : '';
    const positionClass = this.position === 'floating' ? 'floating-help-btn' : '';
    return `btn btn-info ${sizeClass} ${positionClass}`;
  }

}
