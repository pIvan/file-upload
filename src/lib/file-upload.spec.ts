import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FileUploadModule, FileUploadControl, FileUploadValidators } from './file-upload.module';


@Component({
    template: `
    <form [formGroup]="demoForm" id="reactiveForm">
        <file-upload formControlName="files"></file-upload>

        <file-upload formControlName="fileUploadWithTemplate">
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
    `
})
export class FileUploadComponentHost {
    
    /**
     * custom control
     */
    public fileUploadControl = new FileUploadControl(FileUploadValidators.fileSize(80000));

    /**
     * reactive form control
     */
    public fileUploadWithTemplate = new FormControl();
    public filesControl = new FormControl(null, FileUploadValidators.accept(['video/*', 'image/*', '.mp3']));
    public demoForm = new FormGroup({
        files: this.filesControl,
        fileUploadWithTemplate: this.fileUploadWithTemplate
    });

    /**
     * form template driven control
     */
    public uploadedFiles = [];
    public isDisabled: boolean = false;

    @ViewChild('templateDrForm')
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

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
                ReactiveFormsModule,
                FormsModule,
                FileUploadModule
            ],
			declarations: [FileUploadComponentHost]
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

});