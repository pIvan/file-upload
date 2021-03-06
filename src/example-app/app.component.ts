import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as prettify from 'google-code-prettify/bin/prettify.min.js';

import { FileUploadControl, FileUploadValidators } from '@iplab/ngx-file-upload';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  public readonly fileUploadControl = new FileUploadControl({ multiple: false }, FileUploadValidators.fileSize(80000));

  public readonly fileUploadWithTemplate = new FileUploadControl({ accept: ['image/*'] }, FileUploadValidators.accept(['image/*']));

  public readonly filesControl = new FormControl(null, FileUploadValidators.accept(['video/*', 'image/*', '.mp3']));

  public readonly demoForm = new FormGroup({
    files: this.filesControl
  });

  public readonly customFileUploadControl = new FileUploadControl({ listVisible: false });

  public readonly fileUploaddiscardInvalidControl = new FileUploadControl({ accept: ['image/*'], discardInvalid: true, listVisible: false },
    [FileUploadValidators.accept(['image/*']), FileUploadValidators.fileSize(80000)]);

  public animation: boolean = false;
  public multiple: boolean = false;
  public uploadedFiles = [];
  public isDisabled: boolean = false;
  public acceptFiles: string = 'image/*';

  constructor(private elRef: ElementRef) {
    this.fileUploaddiscardInvalidControl.discardedValueChanges.subscribe(files => console.log('discarded: ', files));
  }

  public ngAfterViewInit(): void {
    this.elRef.nativeElement.querySelectorAll('.prettify')
      .forEach((el: HTMLElement) => el.innerHTML = prettify.prettyPrintOne(el.innerHTML));
  }

  public toggleStatus(): void {
    this.filesControl.disabled ? this.filesControl.enable() : this.filesControl.disable();
  }

  public toggleStandAloneStatus(): void {
    this.fileUploadControl.disable(!this.fileUploadControl.disabled);
  }

  public toggleListVisibility(): void {
    this.fileUploadControl.setListVisibility(!this.fileUploadControl.isListVisible);
  }

  public toggleMultiple(): void {
    this.fileUploadControl.multiple(!this.fileUploadControl.isMultiple);
  }

  public toggleReactiveMultiple(): void {
    this.multiple = !this.multiple;
  }

  public clearReactive(): void {
    this.filesControl.setValue([]);
  }

  public clearTemplateDriven(): void {
    this.uploadedFiles = [];
  }

  public clearStandAlone(): void {
    this.fileUploadControl.clear();
  }
}
