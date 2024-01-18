import { Component, HostBinding, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ToastService } from './shared/services/toast.service';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'zorgplanner-toast',
  standalone: true,
  imports: [NgbToastModule, NgTemplateOutlet],
  template: `
    @for (toast of toastService.toasts(); track toast) {
    <ngb-toast
      [header]="toast.header || ''"
      [class]="
        'toast align-items-center border-0 text-bg-' + (toast.type ?? 'primary')
      "
      [autohide]="true"
      [delay]="toast.delay || 5000"
      (hidden)="toastService.remove$.next(toast)"
    >
      <div class="d-flex">
        <div class="toast-body" style="white-space: pre;">
          {{ toast.content }}
        </div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
          (click)="toastService.remove$.next(toast)"
        ></button>
      </div>
    </ngb-toast>
    }
  `,
})
export class ToastComponent {
  @HostBinding('class') class =
    'toast-container position-fixed bottom-0 end-0 p-3';
  @HostBinding('style.z-index') styleZIndex = 9999;

  toastService = inject(ToastService);
}
