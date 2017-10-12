import { Component } from '@angular/core';
import { BackendService } from '../../services/backend.service';

@Component({
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.scss']
})
export class CommunicationComponent {
  subject: string;
  titleText: string;
  regularText: string;
  group = 'dev';
  show = false;

  constructor(private backend: BackendService) { }

  confirmSend() {
    if (!this.group || !this.subject || !this.titleText || !this.regularText) {
      return alert('Missing one of the inputs');
    }
    else { this.show = true; }
  }

  sendMassCommunication() {
    this.show = false;

    const body = {
      group: this.group,
      subject: this.subject,
      titleText: this.titleText,
      regularText: this.regularText
    };

    this.backend.sendEmail(body, {})
    .then((data) => { alert('Email sent'); });
  }
}
