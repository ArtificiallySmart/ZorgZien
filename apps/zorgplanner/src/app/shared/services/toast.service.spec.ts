import { TestBed } from '@angular/core/testing';

import { Toast, ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let toast1: Omit<Toast, 'id'>;
  let toast2: Omit<Toast, 'id'>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);

    toast1 = { content: 'Toast 1', type: 'success' };
    toast2 = { content: 'Toast 2', type: 'info' };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a toast when show is called', () => {
    service.show(toast1.content, toast1.type);
    const result = service.toasts();
    expect(result.length).toBe(1);
    expect(result[0].content).toBe(toast1.content);
    expect(result[0].type).toBe(toast1.type);
    expect(result[0].id).toBeTruthy();
  });

  it('should add multiple toasts when show is called multiple times', () => {
    const toasts = [toast1, toast2];
    toasts.forEach((toast, index) => {
      service.show(toast.content, toast.type);
      const result = service.toasts()[index];
      expect(result.content).toBe(toast.content);
      expect(result.type).toBe(toast.type);
      expect(result.id).toBeTruthy();
    });

    expect(service.toasts().length).toEqual(toasts.length);
  });

  it('should remove a toast when remove$ is called', () => {
    service.show(toast1.content, toast1.type);
    service.show(toast2.content, toast2.type);
    const toast = service.toasts()[0];
    service.remove$.next(toast.id);
    const result = service.toasts();
    expect(result.length).toBe(1);
    expect(result[0].content).toBe(toast2.content);
    expect(result[0].type).toBe(toast2.type);
  });

  it('should clear all toasts when clear$ is called', () => {
    service.show(toast1.content, toast1.type);
    service.show(toast2.content, toast2.type);
    service.clear$.next();
    expect(service.toasts()).toEqual([]);
  });
});
