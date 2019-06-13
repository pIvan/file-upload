import { FileUploadValidators } from './validators.class';
import { FileUploadControl } from './control.class';
import { fakeAsync, tick } from '@angular/core/testing';

describe('FileUploadValidators', () => {

    let control: FileUploadControl;

    beforeEach(() => {
        control = new FileUploadControl();
        const txtFile = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.txt", {type: "text/plain"});
        control.addFile(txtFile);
    });

    it('file size should be limited', () => {
        control.setValidators(FileUploadValidators.fileSize(100));
        expect(control.valid).toBe(true);
    });

    it('file size should be in range', () => {
        const control = new FileUploadControl();
        const file = new File([""], "filename.txt", {type: "text/plain"});
        control.addFile(file);

        control.setValidators(FileUploadValidators.sizeRange({ minSize: 10, maxSize: 4000 }));
        expect(control.valid).toBe(false);
    });

    it('file size should be greater', () => {
        const control = new FileUploadControl();
        const file = new File([""], "filename.txt", {type: "text/plain"});
        control.addFile(file);

        control.setValidators(FileUploadValidators.sizeRange({ minSize: 10 }));
        expect(control.valid).toBe(false);
    });

    it('should test file extension', () => {
        control.setValidators(FileUploadValidators.accept(['.txt']));
        expect(control.valid).toBe(true);
    });

    it('should test file type', () => {
        control.setValidators(FileUploadValidators.accept(['text/*']));
        expect(control.valid).toBe(true);
    });

    it('should test csv file type', fakeAsync(() => {
        control.setValidators(FileUploadValidators.accept(['.txt', '.csv']));
        const csvFile = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.csv", {type: "application/vnd.ms-excel"});
        control.addFile(csvFile);
        expect(control.valid).toBe(true);
    }));

    it('should test multiple types and extensions', () => {
        control.setValidators(FileUploadValidators.accept(['.png', 'audio/*', 'text/*', '.mp3']));
        expect(control.valid).toBe(true);
    });

    it('should test files limit', () => {
        control.setValidators(FileUploadValidators.filesLimit(2));
        const file2 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.txt", {type: "text/plain"});
        const file3 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.txt", {type: "text/plain"});

        control.addFile(file2);
        control.addFile(file3);
    
        expect(control.valid).toBe(false);
    });

});