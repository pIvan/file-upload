import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup } from '@angular/forms';
import { FileUploadModule, FileUploadControl, FileUploadValidators, FileUploadTypes } from '@iplab/ngx-file-upload';
import { AsyncPipe } from '@angular/common';
// import hljs from 'highlight.js';
// import typescript from 'highlight.js/lib/languages/typescript';

// hljs.registerLanguage('typescript', typescript);

import { FileUploadWrapperComponent } from 'src/file-upload-wrapper/file-upload-wrapper.component';

@Component({
    selector: `app-root`,
    templateUrl: `./app.component.html`,
    styleUrls: [`./app.component.css`],
    standalone: true,
    imports: [
        AsyncPipe,
        ReactiveFormsModule,
        FormsModule,
        FileUploadModule,
        FileUploadWrapperComponent
    ]
})
export class AppComponent implements AfterViewInit {

  public readonly fileUploadControl = new FileUploadControl({ multiple: false },
    [FileUploadValidators.fileSize(80000), FileUploadValidators.reject([FileUploadTypes.txt])]);

  public readonly simpleFileUploadControl = new FileUploadControl({ multiple: false },
    [FileUploadValidators.fileSize(1000000), FileUploadValidators.reject([FileUploadTypes.txt])]);

  public readonly fileUploadWithTemplate = new FileUploadControl({ accept: ['image/*'] }, FileUploadValidators.accept(['image/*']));

  public readonly filesControl = new FormControl<File[]>(null, FileUploadValidators.accept(['video/*', 'image/*', '.mp3']));

  public readonly demoForm = new FormGroup({
    files: this.filesControl
  });

  public readonly customFileUploadControl = new FileUploadControl({ listVisible: false });

  public readonly customTemplateWrapperFileUploadControl = new FileUploadControl(
    { listVisible: true, accept: ['image/*'], discardInvalid: true, multiple: false },
    [FileUploadValidators.accept(['image/*']), FileUploadValidators.filesLimit(1)]
  );

  public readonly fileUploaddiscardInvalidControl = new FileUploadControl({ accept: ['image/*'], discardInvalid: true, listVisible: false },
    [FileUploadValidators.accept(['image/*']), FileUploadValidators.fileSize(80000)]);

  public animation: boolean = false;
  public multiple: boolean = false;
  public uploadedFiles = [];
  public isDisabled: boolean = false;
  public acceptFiles: string = 'image/*';

  public readonly ANGULAR_COMPATIBILITY: { ng: string; lib: string }[] = [
    { ng: '20.x.x', lib: '20.x.x' },
    { ng: '19.x.x', lib: '19.x.x' },
    { ng: '18.x.x', lib: '18.x.x' },
    { ng: '17.x.x', lib: '17.x.x' },
    { ng: '16.x.x', lib: '16.x.x' },
    { ng: '15.x.x', lib: '15.x.x' },
    { ng: '14.x.x', lib: '14.x.x' },
    { ng: '13.x.x', lib: '13.x.x' },
    { ng: '12.x.x', lib: '12.x.x' },
    { ng: '11.x.x', lib: '11.x.x' }
  ];

  constructor(private elRef: ElementRef) {
    this.fileUploaddiscardInvalidControl.discardedValueChanges.subscribe(files => console.log('discarded: ', files));
  }

  public ngAfterViewInit(): void {
  //   this.elRef.nativeElement.querySelectorAll('.prettify')
  //     .forEach((el: HTMLElement) => {
  //       console.log(hljs.highlight(el.innerHTML, { language: 'typescript' }));
  //       el.innerHTML = hljs.highlight(el.innerHTML, { language: 'xml' }).value;
  // });
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
