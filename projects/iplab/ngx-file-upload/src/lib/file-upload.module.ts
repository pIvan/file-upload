/*
 * FileUpload
 *
 * By Ivan Pintar, http://www.pintar-ivan.com
 * Licensed under the MIT License
 * See https://github.com/pIvan/file-upload/blob/master/README.md
 */
import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileUploadComponent } from './components/multiple-file-upload/file-upload.component';
import { FileUploadDropZoneComponent } from './components/drop-zone/file-upload-drop-zone.component';
import { FileUploadListItemComponent } from './components/file-list/file-upload-list-item.component';
import { FileUploadIconComponent } from './components/file-list/file-upload-icon.component';
import { FileUploadAttributeComponent } from './components/attribute/file-upload-attr.component';
import { SimpleFileUploadComponent } from './components/simple-file-upload/simple-file-upload.component';

import { FileSizeValidator, FilesLimitValidator, FilesAcceptValidator } from './directives/validators.directive';
import { FilesAcceptDirective } from './directives/attribute.directive';
import { FilesDiscardDirective } from './directives/discard.directive';
import { FilesNativeDirective } from './directives/native.directive';

export { FileUploadComponent } from './components/multiple-file-upload/file-upload.component';
export { FileUploadDropZoneComponent } from './components/drop-zone/file-upload-drop-zone.component';
export { FileUploadAttributeComponent } from './components/attribute/file-upload-attr.component';
export { SimpleFileUploadComponent } from './components/simple-file-upload/simple-file-upload.component';
export { FileSizeValidator, FilesLimitValidator, FilesAcceptValidator } from './directives/validators.directive';
export { FilesAcceptDirective } from './directives/attribute.directive';
export { FilesDiscardDirective } from './directives/discard.directive';
export { FilesNativeDirective } from './directives/native.directive';

export { FileUploadControl } from './helpers/control.class';
export { FileUploadValidators, ValidationErrors, ValidatorFn } from './helpers/validators.class';
export { FileUploadTypes } from './helpers/file-types.class';

export { FileUploadService } from './services/file-upload.service';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        FileUploadComponent,
        FileUploadListItemComponent,
        FileUploadIconComponent,
        FileUploadDropZoneComponent,

        FileUploadAttributeComponent,

        FileSizeValidator,
        FilesLimitValidator,
        FilesAcceptValidator,
        FilesAcceptDirective,
        FilesDiscardDirective,
        FilesNativeDirective,

        SimpleFileUploadComponent
    ],
    exports: [
        FileUploadComponent,
        FileUploadDropZoneComponent,
        FileUploadListItemComponent,
        FileUploadAttributeComponent,

        FileSizeValidator,
        FilesLimitValidator,
        FilesAcceptValidator,
        FilesAcceptDirective,
        FilesDiscardDirective,

        SimpleFileUploadComponent
    ],
    entryComponents: [
        FileUploadComponent
    ]
})
export class FileUploadModule {
    ngDoBootstrap() {}
}
