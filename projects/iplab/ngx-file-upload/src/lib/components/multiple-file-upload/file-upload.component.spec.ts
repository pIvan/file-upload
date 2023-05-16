import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';

import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FileUploadModule, FileUploadControl, FileUploadValidators } from './../../file-upload.module';


@Component({
    template: `
    <form [formGroup]="demoForm" id="reactiveForm">
        <file-upload id="simpleAttribute" formControlName="files" multiple="false"></file-upload>

        <file-upload id="dataBindingAttribute" formControlName="fileUploadWithTemplate" [multiple]="multiple">
            <ng-template let-isFileDragDropAvailable="isFileDragDropAvailable" #placeholder>
                <span *ngIf="isFileDragDropAvailable">drop or click</span>
                <span *ngIf="!isFileDragDropAvailable">click</span>
            </ng-template>

            <ng-template let-i="index" let-file="file" let-control="control" #item>
                <div class="file-info" (click)="control.removeFile(file)">
                    <span class="file-name">{{ file.name }}</span>
                </div>
            </ng-template>
        </file-upload>
    </form>

    <form #templateDrForm="ngForm" id="templateDrivenForm">
        <file-upload [(ngModel)]="uploadedFiles" [filesize]="100000" [disabled]="isDisabled" name="uploadFiles"></file-upload>
    </form>

    <file-upload id="standAlone" [control]="fileUploadControl"></file-upload>

    <file-upload id="fileUploadMultipleFalseCheck" [control]="fileUploadMultipleFalseCheck"></file-upload>

    <file-upload id="acceptCheck" [control]="acceptCheck" accept="image/*"></file-upload>
    `
})
export class FileUploadComponentHost {

    /**
     * custom control
     */
    public fileUploadControl = new FileUploadControl(null, FileUploadValidators.fileSize(80000));

    /**
     * custom control
     */
    public acceptCheck = new FileUploadControl();

    public fileUploadMultipleFalseCheck = new FileUploadControl({ multiple: false });

    public multiple = false;

    /**
     * reactive form control
     */
    public fileUploadWithTemplate = new FormControl<File[]>(null);
    public filesControl = new FormControl<File[]>(null, FileUploadValidators.accept(['video/*', 'image/*', '.mp3']));
    public demoForm = new FormGroup({
        files: this.filesControl,
        fileUploadWithTemplate: this.fileUploadWithTemplate
    });

    /**
     * form template driven control
     */
    public uploadedFiles = [];
    public isDisabled: boolean = false;

    @ViewChild('templateDrForm', { static: true })
    public templateDrForm: ElementRef;

    constructor() {
        const file = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.txt", {type: "text/plain"});
        this.filesControl.setValue([file]);
        this.fileUploadWithTemplate.setValue([file]);
    }
}


describe('FileUpload', () => {
    let hostComponentEl: any;
    let hostComp: FileUploadComponentHost;
    let hostFixture: ComponentFixture<FileUploadComponentHost>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        FormsModule,
        FileUploadModule,
        NoopAnimationsModule
    ],
    declarations: [FileUploadComponentHost],
    teardown: { destroyAfterEach: false }
})
        .compileComponents()
        .then(() => {
            hostFixture = TestBed.createComponent(FileUploadComponentHost);
            hostComp = hostFixture.componentInstance;
            hostComponentEl = hostFixture.debugElement.nativeElement;
            hostFixture.detectChanges();
        });
    }));

    it('should create component', () => {
        expect(hostComp).toBeDefined();
    });


    it(`should set correct template`, () => {
        const placeholderEl = hostComponentEl.querySelector('#reactiveForm file-upload:first-child .icon');
        const placeholderCustomEl = hostComponentEl.querySelector('#reactiveForm file-upload:nth-child(2) .upload-input span');

        const itemElement = hostComponentEl.querySelector('#reactiveForm file-upload:first-child file-upload-list-item');
        const customItemElement = hostComponentEl.querySelector('#reactiveForm file-upload:nth-child(2) .file-info');

        // templateDrivenForm
        // standAlone
        expect(placeholderEl).toBeDefined();
        expect(placeholderCustomEl).toBeDefined();
        expect(placeholderCustomEl.innerText).toEqual('drop or click');

        expect(itemElement).toBeDefined();
        expect(customItemElement).toBeDefined();
    });

    it('should disable all components', fakeAsync(() => {
        // FileUploadControl
        hostComp.fileUploadControl.disable();

        expect(hostComp.fileUploadControl.disabled).toEqual(true);

        const standAlone = hostComponentEl.querySelector('#standAlone');
        const standAloneInput = hostComponentEl.querySelector('#standAlone input');
        expect(standAlone.className).toContain('disabled');
        expect(standAloneInput.disabled).toBe(true);

        // reactive form
        hostComp.fileUploadWithTemplate.disable();
        hostComp.filesControl.disable();

        expect(hostComp.fileUploadWithTemplate.disabled).toEqual(true);
        expect(hostComp.filesControl.disabled).toEqual(true);

        const reactiveFirst = hostComponentEl.querySelector('#reactiveForm file-upload:first-child');
        const reactiveSecond = hostComponentEl.querySelector('#reactiveForm file-upload:nth-child(2)');
        const reactiveFirstInput = hostComponentEl.querySelector('#reactiveForm file-upload:first-child input');
        const reactiveSecondInput = hostComponentEl.querySelector('#reactiveForm file-upload:nth-child(2) input');

        expect(reactiveFirst.className).toContain('disabled');
        expect(reactiveSecond.className).toContain('disabled');
        expect(reactiveFirstInput.disabled).toBe(true);
        expect(reactiveSecondInput.disabled).toBe(true);

        // template driven
        hostComp.isDisabled = true;
        hostFixture.detectChanges();
        tick();

        const templateDriven = hostComponentEl.querySelector('#templateDrivenForm file-upload');
        const templateDrivenInput = hostComponentEl.querySelector('#templateDrivenForm file-upload input');
        expect(templateDriven.className).toContain('disabled');
        expect(templateDrivenInput.disabled).toBe(true);

    }));


    it('should accept files', fakeAsync(() => {
        /**
         * initialy set accept attribute
         */
        const acceptCheckEl = hostComponentEl.querySelector('#acceptCheck input');
        expect(acceptCheckEl.accept).toBe('image/*');

        /**
         * set accept attribute on change
         */
        const standAloneInput = hostComponentEl.querySelector('#standAlone input');
        expect(standAloneInput.accept).toBe('');

        hostComp.fileUploadControl.acceptFiles('text/*');
        tick();
        expect(standAloneInput.accept).toBe('text/*');

    }));

    it('should initially be multiple', fakeAsync(() => {
        tick();
        tick();
        /**
         * attribute test
         */
        const simpleAttributeCheckEl = hostComponentEl.querySelector('#simpleAttribute input');
        const isSimpleDisabled = simpleAttributeCheckEl["multiple"];
        expect(isSimpleDisabled).toBe(false);

        /**
         * attribute two way data binding
         */
        const dataBindingAttributeCheckEl = hostComponentEl.querySelector('#dataBindingAttribute input');
        const isDisabled = dataBindingAttributeCheckEl["multiple"];
        expect(isDisabled).toBe(false);

        /**
         * stand alone control test
         */
        const standAloneEl = hostComponentEl.querySelector('#standAlone input');
        const isstandAloneEnabled = standAloneEl["multiple"];
        expect(isstandAloneEnabled).toBe(true);

        /**
         * initial multiple
         */
        const fileUploadMultipleFalseCheckEl = hostComponentEl.querySelector('#fileUploadMultipleFalseCheck input');
        const isFileUploadMultipleFalseEnabled = fileUploadMultipleFalseCheckEl["multiple"];
        expect(hostComp.fileUploadMultipleFalseCheck.isMultiple).toBe(false);
        expect(isFileUploadMultipleFalseEnabled).toBe(false);
    }));


    it('should toggle multiple selection', fakeAsync(() => {
        /**
         * attribute test
         */
        const simpleAttributeCheckEl = hostComponentEl.querySelector('#simpleAttribute input');
        const isSimpleDisabled = simpleAttributeCheckEl["multiple"];
        expect(isSimpleDisabled).toBe(false);

        /**
         * attribute two way data binding
         */
        const dataBindingAttributeCheckEl = hostComponentEl.querySelector('#dataBindingAttribute input');
        const isDisabled = dataBindingAttributeCheckEl["multiple"];
        expect(isDisabled).toBe(false);

        hostComp.multiple = true;
        hostFixture.detectChanges();
        tick();
        const isEnabled = dataBindingAttributeCheckEl["multiple"];
        expect(isEnabled).toBe(true);

        /**
         * stand alone control test
         */
        const standAloneEl = hostComponentEl.querySelector('#standAlone input');
        const isstandAloneEnabled = standAloneEl["multiple"];
        expect(isstandAloneEnabled).toBe(true);

        hostComp.fileUploadControl.multiple(false);
        tick();
        const isstandAloneDisabled = standAloneEl["multiple"];

        expect(hostComp.fileUploadControl.isMultiple).toBe(false);
        expect(isstandAloneDisabled).toBe(false);
    }));

});
