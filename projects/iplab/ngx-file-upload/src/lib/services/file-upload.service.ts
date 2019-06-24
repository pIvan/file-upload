import { Injectable, Renderer2 } from '@angular/core';
import { FileUploadTypes } from './../helpers/file-types.class';
import { IsNullOrEmpty } from './../helpers/helpers.class';

export type ISize = 'B' | 'KB' | 'MB' | 'GB';

@Injectable()
export class FileUploadService {

    private readonly extensions: Array<ISize> = ['B', 'KB', 'MB', 'GB'];

    private readonly sizeRegex = new RegExp(`^(\\d+)(?:\\s{0,1})(${this.extensions.join('|')})?$`, 'i');

    constructor(private renderer: Renderer2) {
    }

    public isFileDragDropAvailable(): boolean {
        const div = this.renderer.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div));
    }

    public parseSize(value: string | number): number {
        if (IsNullOrEmpty(value)) {
            return 0;
        }

        if (typeof value === 'number') {
            return value;
        }

        const [, size, extension] = value.match(this.sizeRegex) || [null, '0', 'B'];
        const i =  IsNullOrEmpty(extension) ? 0 : this.extensions.indexOf(extension.toUpperCase() as ISize);

        return parseInt(size, 10) * Math.pow(1024, i < 0 ? 0 : i);
    }

    public formatSize(size: number): string {
        return this.calculateSize(size);
    }

    private calculateSize(size: number, extensionIndex: number = 0): string {
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
