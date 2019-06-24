import {FileUploadService} from './file-upload.service';
import {inject, TestBed} from '@angular/core/testing';
import {Renderer2} from '@angular/core';

describe('FileUploadService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileUploadService, Renderer2]
    });
  });

  it('should be initialized', inject([FileUploadService], (fileUploadService: FileUploadService) => {
    expect(fileUploadService.parseSize('10MB')).toBe(10 * 1024 * 1024);
    expect(fileUploadService.parseSize('10mb')).toBe(10 * 1024 * 1024);
    expect(fileUploadService.parseSize('10KB')).toBe(10 * 1024);
    expect(fileUploadService.parseSize('10 KB')).toBe(10 * 1024);
    expect(fileUploadService.parseSize('1024')).toBe(1024);
    expect(fileUploadService.parseSize('A')).toBe(0);
    expect(fileUploadService.parseSize('1024SB')).toBe(0);
    expect(fileUploadService.parseSize(10233)).toBe(10233);
  }));

});
