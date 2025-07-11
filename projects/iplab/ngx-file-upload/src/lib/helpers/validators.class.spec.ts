import { FileUploadValidators } from './validators.class';
import { FileUploadControl } from './control.class';

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

    it('should test file extension ignore case', () => {
      const ctrlUpper = new FileUploadControl();
      const ctrlUpperTxtFile = new File([""], "filename.TXT", {type: "text/plain"});
      ctrlUpper.addFile(ctrlUpperTxtFile);

      ctrlUpper.setValidators(FileUploadValidators.accept(['.txt']));
      expect(ctrlUpper.valid).toBe(true);
    });

    it('should test file type', () => {
        control.setValidators(FileUploadValidators.accept(['text/*']));
        expect(control.valid).toBe(true);
    });

    it('should test csv file type', () => {
        control.setValidators(FileUploadValidators.accept(['.txt', '.csv']));
        const csvFile = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.csv", {type: "application/vnd.ms-excel"});
        control.addFile(csvFile);
        expect(control.valid).toBe(true);
    });

    it('should test multiple types and extensions', () => {
        control.setValidators(FileUploadValidators.accept(['.png', 'audio/*', 'text/*', '.mp3']));
        expect(control.valid).toBe(true);
    });

    it('should test file extension with reject validator', () => {
        control.setValidators(FileUploadValidators.reject(['.txt']));
        const csvFile = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.csv", {type: "application/vnd.ms-excel"});
        control.addFile(csvFile);

        expect(control.valid).toBe(false);
        expect(control.getError().length).toBe(1);
    });

    it('should test files limit', () => {
        control.setValidators(FileUploadValidators.filesLimit(2));
        const file2 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename2.txt", {type: "text/plain"});
        const file3 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename3.txt", {type: "text/plain"});

        control.addFile(file2);
        control.addFile(file3);

        expect(control.valid).toBe(false);
    });

    it('should test file name with multi dot', () => {
      const multiDotCtrl = new FileUploadControl();
      const multiDotCtrlTxtFile = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.middle.txt", {type: "text/plain"});
      multiDotCtrl.addFile(multiDotCtrlTxtFile);
      multiDotCtrl.setValidators(FileUploadValidators.accept(['.txt', '.csv']));

      expect(multiDotCtrl.valid).toBe(true);
    });

    it('should test file without extension', () => {
      const control = new FileUploadControl();
      const file = new File([""], "filename", {type: "text/plain"});
      control.addFile(file);
      control.setValidators(FileUploadValidators.accept(['.txt']));

      expect(control.valid).toBe(false);
    });

    it('should replace files with the same name', () => {
        const file2 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.txt", {type: "text/plain"});
        const file3 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.txt", {type: "text/plain"});

        control.addFile(file2);
        control.addFile(file3);

        expect(control.value.length).toBe(1);
    });

    it('summary size should be limited', () => {
        control.setValidators(FileUploadValidators.sizeLimit(100));

        const file2 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.txt", {type: "text/plain"});
        const file3 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename2.txt", {type: "text/plain"});
        const file4 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename3.txt", {type: "text/plain"});

        control.addFile(file2);
        control.addFile(file3);
        control.addFile(file4);

        expect(control.valid).toBe(false);
    });
});
