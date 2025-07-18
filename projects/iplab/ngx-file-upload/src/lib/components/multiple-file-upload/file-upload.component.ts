import {
  Component,
  HostListener,
  HostBinding,
  Inject,
  TemplateRef,
  ChangeDetectionStrategy,
  forwardRef,
  booleanAttribute,
  contentChild,
  Signal,
  input,
  InputSignalWithTransform,
  effect,
  DOCUMENT
} from '@angular/core';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { AnimationEvent } from '@angular/animations';

import { FileUploadService } from './../../services/file-upload.service';
import { InsertAnimation } from './../../animations/insert.animation';
import { ZoomAnimation } from './../../animations/zoom.animation';
import { FileUploadAbstract, DRAGOVER_CLASS_NAME } from './../file-upload-abstract.component';
import { FileUploadDropZoneComponent } from './../drop-zone/file-upload-drop-zone.component';
import { FileUploadListItemComponent } from './../file-list/file-upload-list-item.component';
import { FileUploadControl } from './../../helpers/control.class';

@Component({
    selector: `file-upload:not([simple])`,
    templateUrl: `./file-upload.component.html`,
    styleUrls: [`./file-upload.component.scss`],
    providers: [
        FileUploadService,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileUploadComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        ZoomAnimation,
        InsertAnimation
    ],
    standalone: true,
    imports: [
        AsyncPipe,
        NgTemplateOutlet,
        FileUploadDropZoneComponent,
        FileUploadListItemComponent
    ]
})
export class FileUploadComponent extends FileUploadAbstract implements ControlValueAccessor {

    public animation: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(true, { transform: booleanAttribute });

    public templateRef: Signal<TemplateRef<any>> = contentChild('placeholder', { read: TemplateRef });

    public listItem: Signal<TemplateRef<any>> = contentChild('item', { read: TemplateRef });;

    public templateContext = {
        $implicit: this.fileUploadService.isFileDragDropAvailable(),
        isFileDragDropAvailable: this.fileUploadService.isFileDragDropAvailable()
    };

    /** animation fields */
    public zoomText: 'zoomOut' | 'zoomIn' | 'static' = 'static';
    public listVisible: boolean = false;

    constructor(
        public fileUploadService: FileUploadService,
        @Inject(DOCUMENT) private document,
    ) {
        super();
        effect(() => {
            this.checkAndSetMultiple();
        });
    }

    @HostBinding('@.disabled')
    public get isAnimationDisabled(): boolean {
        return this.animation() === false;
    }

    protected getListItemTemplateContext(index: number, item: File):
        { $implicit: File, file: File, index: number, control: FileUploadControl } {
        return {
            $implicit: item,
            file: item,
            index,
            control: this.getControlInstance()
        };
    }

    protected trackByFn(index: number, item: File): string {
        return item.name;
    }

    protected registerEvents(): void {
        super.registerEvents();
        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((eventName) => {
            this.hooks.push(
                this.renderer.listen(this.document, eventName, (event: any) => this.preventDragEvents(event))
            );
        });

        ['dragover', 'dragenter'].forEach((eventName) => {
            this.hooks.push(
                this.renderer.listen(this.hostElementRef.nativeElement, eventName, (event: any) => this.onDragOver(event))
            );
        });

        ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
            this.hooks.push(
                this.renderer.listen(this.hostElementRef.nativeElement, eventName, (event: any) => this.onDragLeave(event))
            );
        });

        const control = this.getControlInstance();
        this.subscriptions.push(
            control.valueChanges.subscribe((files) => this.renderView())
        );

        this.subscriptions.push(
            control.listVisibilityChanges.subscribe((status) => this.toggleListVisibility())
        );
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            const control = this.getControlInstance();
            control.click();
        }
    }

    private preventDragEvents(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    private renderView(): void {
        if (!this.listVisible) {
            const control = this.getControlInstance();
            this.zoomText = control.isListVisible && control.size > 0 ? 'zoomOut' : 'static';
        }
        this.cdr.detectChanges();
    }

    private showList(): void {
        if (this.zoomText !== 'static') {
            this.listVisible = true;
        }
    }

    private hideList(): void {
        this.listVisible = false;
    }

    private toggleListVisibility(): void {
        const control = this.getControlInstance();
        this.listVisible = control.isListVisible && control.size > 0;
        if (this.listVisible) {
            this.renderer.addClass(this.hostElementRef.nativeElement, 'list-visible');
            this.zoomText = 'static';
        }
        this.cdr.detectChanges();
    }

    /**
     * on file over add class name
     */
    private onDragOver(event: Event): void {
        this.renderer.addClass(this.hostElementRef.nativeElement, DRAGOVER_CLASS_NAME);
    }

    /**
     * on mouse out remove class name
     */
    private onDragLeave(event: Event): void {
        this.renderer.removeClass(this.hostElementRef.nativeElement, DRAGOVER_CLASS_NAME);
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: Event): void {
        const control = this.getControlInstance();
        if (control.disabled) {
            return;
        }
        // There is some issue with DragEvent in typescript lib.dom.d.ts
        const files = (event as any).dataTransfer.files;
        control.addFiles(files);
        this.onTouch();
    }

    public onInputChange(event: Event): void {
        const input = (event.target) as HTMLInputElement;
        const control = this.getControlInstance();

        if (!control.disabled && input.files.length > 0) {
            control.addFiles(input.files);
            this.clearInputEl();
        }

        this.onTouch();
    }

     /**
      * model -> view changes
      */
    public writeValue(files: any): void {
        if (files != null) {
            const control = this.getControlInstance();
            control.setValue(files, { emitEvent: false });
            this.renderView();
        }
    }

    public setDisabledState(isDisabled: boolean): void {
        const control = this.getControlInstance();
        control.disable(isDisabled);
    }

    public zoomAnimationDone(event: AnimationEvent): void {
        const control = this.getControlInstance();
        if (control.isListVisible && control.size > 0) {
            this.showList();
        } else {
            this.hideList();
        }

        if (event.fromState === 'static' && event.toState === 'zoomOut') {
            this.renderer.addClass(this.hostElementRef.nativeElement, 'hide-text');
        } else {
            this.renderer.removeClass(this.hostElementRef.nativeElement, 'hide-text');
        }

        if (event.toState === 'zoomIn') {
            this.zoomText = 'static';
        }
    }

    public animationListFinished(event: AnimationEvent): void {
        if (event.toState === 'void') {
            this.zoomText = 'zoomIn';
            this.renderer.removeClass(this.hostElementRef.nativeElement, 'list-visible');
        }
        if (event.fromState === 'void') {
            this.zoomText = 'static';
            this.renderer.addClass(this.hostElementRef.nativeElement, 'list-visible');
        }
    }
}
