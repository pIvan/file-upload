import { FileUploadValidators } from './validators.class';
import { FileUploadControl } from './control.class';

describe('FileUploadValidators', () => {

    let control: FileUploadControl;

    beforeEach(() => {
        control = new FileUploadControl();
        const file = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.txt", {type: "text/plain"});
        control.addFile(file);
    })

    it('file size should be limited', () => {
        control.setValidators(FileUploadValidators.fileSize(100));
        expect(control.valid).toBe(true);
    });

    it('should test file extension', () => {
        control.setValidators(FileUploadValidators.accept(['.txt']));
        expect(control.valid).toBe(true);
    });

    it('should test file type', () => {
        control.setValidators(FileUploadValidators.accept(['text/*']));
        expect(control.valid).toBe(true);
    });

    it('should test multiple types and extensions', () => {
        control.setValidators(FileUploadValidators.accept(['text/*', '.png', 'audio/*', '.mp3']));
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