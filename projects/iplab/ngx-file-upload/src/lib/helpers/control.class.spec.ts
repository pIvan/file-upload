import { FileUploadValidators } from './validators.class';
import { FileUploadControl, STATUS } from './control.class';

describe('FileUploadControl', () => {

    let control: FileUploadControl;

    beforeEach(() => {
        control = new FileUploadControl();
        const file = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.txt", {type: "text/plain"});
        control.addFile(file);
    });

    it('should validate files', () => {
        control.setValidators([FileUploadValidators.filesLimit(1), FileUploadValidators.fileSize(100), FileUploadValidators.accept(['.png', 'text/*', 'audio/*', '.mp3'])]);
        const file2 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.txt", {type: "text/plain"});
        control.addFile(file2);
        expect(control.valid).toBe(false);
    });

    it('should add new files', () => {
        const file2 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fyxc<xc dsfdsfdsafdsaf sdaf sdaf  sadfdsf sda fdsa fasd f sfsad f sadf sdasdafsf asdd dasd"], "filename.txt", {type: "text/plain"});
        const file3 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fd dasd"], "filename.txt", {type: "text/plain"});

        control.addFile(file2);
        control.addFile(file3);
    
        expect(control.valid).toBe(true);
        expect(control.getError() instanceof Array).toBe(true);
        expect(control.getError().length).toBe(0);
        expect(control.size).toBe(3);
        expect(control.value.length).toBe(3);
    });

    it('should emit value changes', () => {
        const valueChanges = jasmine.createSpy();

        control.valueChanges.subscribe(valueChanges);

        const file2 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fyxc<xc dsfdsfdsafdsaf sdaf sdaf sdafsf asdd dasd"], "filename.txt", {type: "text/plain"});
        control.addFile(file2);

        expect(valueChanges).toHaveBeenCalled();
    });

    it('should emit value changes only two times, initial and on change', () => {
        const valueChanges = jasmine.createSpy();

        control.valueChanges.subscribe(valueChanges);

        const file1 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fyxc<xc dsfdsfdsafdsaf sdaf sdaf sdafsf asdd dasd"], "filename.txt", {type: "text/plain"});
        const file2 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fyxc<xc dsfdsfdsafdsaf sdaf sdaf sdafsf asdd dasd"], "filename.txt", {type: "text/plain"});
        const file3 = new File(["f sda fsadfdsaf sadfdsaf asdfsdaafasd fyxc<xc dsfdsfdsafdsaf sdaf sdaf sdafsf asdd dasd"], "filename.txt", {type: "text/plain"});
        
        control.setValue([file1, file2, file3]);

        expect(valueChanges).toHaveBeenCalled();
        expect(valueChanges).toHaveBeenCalledTimes(2);
        expect(control.size).toBe(3);
    });

    it('should emit status changes', () => {
        const statusChanges = jasmine.createSpy();
        control.statusChanges.subscribe(statusChanges);

        control.disable();
        expect(statusChanges).toHaveBeenCalled();
        expect(statusChanges).toHaveBeenCalledWith(STATUS.DISABLED);
    });

    it('should clear and set new values', () => {
        const file1 = new File([""], "filename.txt", {type: "text/plain"});
        const file2 = new File([""], "filename.txt", {type: "text/plain"});
        const valueChanges = jasmine.createSpy();


        control.valueChanges.subscribe(valueChanges);

        control.setValue([file1, file2]);

        expect(valueChanges).toHaveBeenCalled();
        expect(control.value).toContain(file1);
        expect(control.value).toContain(file2);
        expect(control.size).toBe(2);
    });

    it('should empty File list', () => {
        const valueChanges = jasmine.createSpy();
        control.valueChanges.subscribe(valueChanges);
        control.clear();

        expect(valueChanges).toHaveBeenCalled();
        expect(control.size).toBe(0);
        expect(control.value.length).toBe(0);
    });

    it('should disable list', () => {
        control.disable();
        expect(control.disabled).toBe(true);
    });

    it('should respect multiple constraint', () => {
        control.multiple(false);

        expect(control.isMultiple).toBe(false);

        const file1 = new File([""], "filename.txt", {type: "text/plain"});
        const file2 = new File([""], "filename.txt", {type: "text/plain"});

        control.setValue([file1, file2]);
        expect(control.size).toBe(1);
        expect(control.value[0]).toEqual(file1);

        control.addFile(file2);
        expect(control.size).toBe(1);
        expect(control.value[0]).toEqual(file2);
    });
});
