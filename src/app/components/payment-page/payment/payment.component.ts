import { Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil} from 'rxjs/operators';

import { COUNTRIES } from './../../../data/countries';
import { ICountries } from './../../../interfaces/countries.interface';
import { ICard } from './../../../interfaces/card.interface';
import { OrderService } from './../../../services/order.service';
import { UnsubscriberBaseClass } from 'app/shared/unsubscriber-base-class.class';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent extends UnsubscriberBaseClass implements OnInit, OnDestroy {

  cardDataForm: FormGroup;
  countries: ICountries[] = COUNTRIES;
  isUsa: boolean = false;

  constructor(
    private router: Router,
    private orderService: OrderService,
    public fb: FormBuilder,
  ) {
    super()
  }

  ngOnInit(): void {
    this.cardDataForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      country: ['', [Validators.required]],
      state: [''],
      city: ['', [Validators.required]],
      street1: ['', [Validators.required]],
      street2: [''],
      zipCode: ['', [Validators.required]],
      cardNumber: ['',
        [
          Validators.required,
          Validators.minLength(16),
          Validators.maxLength(16)
        ]],
      ccv: ['',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(3)
        ]],
      expiryDate: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)
      ]],
      cardType: ['', [Validators.required]],
    })
    this.checkUsa();
    this.checkCardChanges();
  }

  private checkUsa(): void {
    this.cardDataForm.get('country')?.valueChanges.pipe(
      takeUntil(this.destroy$))
      .subscribe(country => {
        this.isUsa = country === 'United States of America (the)';
      })
  }

  public submitPayment(): void {
    const card: ICard = {
      cardNumber: this.cardDataForm.value.cardNumber,
      cardType: this.cardDataForm.value.cardType,
    }
    this.orderService.cardData$.next(card)
    this.router.navigate(['/order-preview']);
  }

  private checkCardChanges(): void {
    this.cardDataForm.get('cardNumber')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => value.length >= 4 && this.fillFormFields());
  }

  private fillFormFields(): void {
    const formPatchData = {
      cardType: this.orderService.getCardType(this.cardDataForm.get('cardNumber')?.value)
    };
    this.cardDataForm.patchValue(formPatchData);
  }
}
