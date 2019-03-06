import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as prettify from 'google-code-prettify/bin/prettify.min.js';

import { FileUploadControl, FileUploadValidators } from '@iplab/ngx-file-upload';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  public readonly fileUploadControl = new FileUploadControl(FileUploadValidators.fileSize(80000));

  public readonly fileUploadWithTemplate = new FileUploadControl();

  public readonly filesControl = new FormControl(null, FileUploadValidators.accept(['video/*', 'image/*', '.mp3']));

  public readonly simpleFileUpload = new FileUploadControl();

  public readonly demoForm = new FormGroup({
    files: this.filesControl
  });

  public uploadedFiles = [];
  public isDisabled: boolean = false;

  constructor(private elRef: ElementRef) {
  }

  public ngAfterViewInit(): void {
    this.elRef.nativeElement.querySelectorAll('.prettify')
      .forEach(( el: HTMLElement ) => el.innerHTML = prettify.prettyPrintOne(el.innerHTML));
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
