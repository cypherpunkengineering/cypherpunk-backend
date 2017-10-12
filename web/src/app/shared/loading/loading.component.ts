import { isPlatformBrowser } from '@angular/common';
import { Component, Input, PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  private _show = false;
  @Input('show')
  set show(state: boolean) {
    this._show = state;
    if (state) { setTimeout(() => { this.setup(); }); }
    else { this.looping = false; }
  };
  get show(): boolean { return this._show; }


  looping = true;
  isBrowser: boolean;
  done = false;
  cycleCount = 5;
  cycleCurrent = 0;
  letters = [];
  letterCount: number;
  letterCurrent = 0;
  chars = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-_=+{}|[]\\;\':"<>?,./`~'.split('');


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  setup() {
    this.looping = true;
    const nodeList = document.querySelectorAll('.char');
    this.letters.length = 0;
    for (let i = 0; i < nodeList.length; i++) {
      this.letters.push(nodeList[i]);
    }
    this.letterCount = this.letters.length;
    this.letters.forEach((el) => {
      el.setAttribute('data-orig', el.innerText);
      el.innerHTML = '-';
    });
    this.cycleCount = 5;
    this.reset();
  }

  reset() {
    if (!this.looping) { return; }
    this.done = false;
    this.cycleCurrent = 0;
    this.letterCurrent = 0;
    this.letters.forEach((el) => {
      el.innerHTML = el.getAttribute('data-orig');
      el.classList.remove('done');
    });
    this.loop();
  }

  loop() {
    this.letters.forEach((elem, index) => {
      if (index >= this.letterCurrent) {
        const text = elem.innerText || elem.textContent;
        if (text !== ' ') {
          elem.innerHTML = this.getChar();
          elem.style.opacity = Math.random().toString();
        }
      }
    });

    if (this.cycleCurrent < this.cycleCount) { this.cycleCurrent++; }
    else if (this.letterCurrent < this.letterCount) {
      const currLetter = this.letters[this.letterCurrent];
      this.cycleCurrent = 0;
      currLetter.innerHTML = currLetter.getAttribute('data-orig');
      currLetter.style.opacity = '1';
      currLetter.classList.add('done');
      this.letterCurrent++;
    }
    else { this.done = true; }

    if (!this.done) { requestAnimationFrame(() => { this.loop(); }); }
    else { setTimeout(() => { this.reset(); }, 750); }
  }
}
