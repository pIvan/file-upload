import { Renderer2 } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { FileUploadService } from './file-upload.service';


describe('FileUploadService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
    providers: [FileUploadService, Renderer2],
    teardown: { destroyAfterEach: false }
});
  });

  it('should parse correct', inject([FileUploadService], (fileUploadService: FileUploadService) => {
    expect(fileUploadService.parseSize('10MB')).toBe(10 * 1024 * 1024);
    expect(fileUploadService.parseSize('10 MB')).toBe(10 * 1024 * 1024);
    expect(fileUploadService.parseSize('10mb')).toBe(10 * 1024 * 1024);

    expect(fileUploadService.parseSize('10KB')).toBe(10 * 1024);
    expect(fileUploadService.parseSize('10kb')).toBe(10 * 1024);
    expect(fileUploadService.parseSize('10 KB')).toBe(10 * 1024);

    expect(fileUploadService.parseSize('1024')).toBe(1024);
    expect(fileUploadService.parseSize('1024B')).toBe(1024);
    expect(fileUploadService.parseSize(10233)).toBe(10233); 

    expect(fileUploadService.parseSize('A')).toBe(0);
    expect(fileUploadService.parseSize('1024SB')).toBe(0);
    expect(fileUploadService.parseSize(null)).toBe(0);
    expect(fileUploadService.parseSize(undefined)).toBe(0);
  }));

});