import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as prettify from 'google-code-prettify/bin/prettify.min.js';

import { FileUploadControl, FileUploadValidators } from '@ng-forms/file-upload';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  public fileUploadControl = new FileUploadControl(FileUploadValidators.fileSize(80000));
  
  public fileUploadWithTemplate = new FileUploadControl();

  public filesControl = new FormControl(null, FileUploadValidators.accept(['video/*', 'image/*', '.mp3']));

  public demoForm = new FormGroup({
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
}
