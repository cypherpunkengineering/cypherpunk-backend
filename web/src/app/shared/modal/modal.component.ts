import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() show: boolean;
  @Output() showChange = new EventEmitter<boolean>();

  updateShow(val) {
    this.show = val;
    this.showChange.emit(this.show);
  }

  constructor() { }

}
