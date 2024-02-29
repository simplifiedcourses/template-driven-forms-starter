import { Directive, inject, Input, OnDestroy, Output } from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Subject, takeUntil } from 'rxjs';
import { StaticSuite } from 'vest';
import { mergeValuesAndRawValues } from './utils';

@Directive({
  selector: 'form',
  standalone: true,
})
export class FormDirective<T> implements OnDestroy {
  private readonly destroy$$ = new Subject<void>();
  public readonly ngForm = inject(NgForm, { self: true });
  @Input() public formValue: T | null = null;
  @Input() public suite: StaticSuite<string, string, (model: T, field: string) => void> | null = null;

  @Output() public readonly formValueChange = this.ngForm.form.valueChanges.pipe(
    debounceTime(0),
    map(() => mergeValuesAndRawValues<T>(this.ngForm.form))
  );

  @Output() public readonly dirtyChange = this.formValueChange.pipe(
    debounceTime(0),
    map(() => this.ngForm.form.dirty),
    distinctUntilChanged()
  );

  @Output() public readonly validChange =  this.formValueChange.pipe(
    debounceTime(0),
    map(() => this.ngForm.form.valid),
    distinctUntilChanged()
  );

  @Input() public set validationConfig(v: {[key:string]: string[]}) {
    Object.keys(v).forEach((key) => {
      this.formValueChange
        .pipe(
          map(() => this.ngForm.form.get(key)?.value),
          distinctUntilChanged(),
          takeUntil(this.destroy$$)
        )
        .subscribe(() => {
          v[key].forEach((path) => {
            this.ngForm.form.get(path)?.updateValueAndValidity({ onlySelf: false, emitEvent: false });
          })
        })
    })
  }

  constructor() {
    this.ngForm.ngSubmit.subscribe(() => {
      this.ngForm.form.markAllAsTouched();
    });
  }
  
  public ngOnDestroy(): void {
    this.destroy$$.next();
  }
}

