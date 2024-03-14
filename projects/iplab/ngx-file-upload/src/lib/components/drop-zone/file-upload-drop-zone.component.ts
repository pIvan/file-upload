import {
    Component,
    ChangeDetectionStrategy
} from '@angular/core';

@Component({
    selector: `file-upload-drop-zone`,
    templateUrl: `./file-upload-drop-zone.component.html`,
    styleUrls: [`./file-upload-drop-zone.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class FileUploadDropZoneComponent {
}
