import { Injectable, Renderer2 } from '@angular/core';
import { FileUploadTypes } from './../helpers/file-types.class';

@Injectable()
export class FileUploadService {

    private extensions: Array<'B' | 'KB' | 'MB' | 'GB'> = ['B', 'KB', 'MB', 'GB'];
    constructor(private renderer: Renderer2) {
    }

    public isFileDragDropAvailable(): boolean {
        const div = this.renderer.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div));
    }

    public parseSize(sizeUnit: string | number): number {
        if (typeof sizeUnit === 'number') {
            return sizeUnit;
        }

        const match = sizeUnit.match(new RegExp(`^(\\d+)(?: *)(${this.extensions.join('|')})?$`));

        if (match) {
            const size = match[1];
            const unit = match[2];
            let multiple = 1;

            if (unit) {
              multiple = this.extensions.findIndex(each => each === unit);
              multiple = Math.pow(1024, multiple);
            }

            return parseInt(size, 10) * multiple;
        }
        return 0;
    }

    public calculateSize(size: number, extensionIndex: number = 0): string {
        if (isNaN(size)) {
            size = 0;
        }

        if (size < 1024) {
            return `${Math.round(size * 100) / 100} ${this.extensions[extensionIndex]}`;
        }

        return this.calculateSize(size / 1024, extensionIndex + 1);
    }

    public getFileType(file: File): string {
        return Object.keys(FileUploadTypes).find((key) => FileUploadTypes[key] === file.type);
    }
}
