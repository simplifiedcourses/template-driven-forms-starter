import { Injectable } from '@angular/core';
import { Product } from './product.type';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  public getAll(): Observable<Product[]> {
    return of([
      { id: '0', name: 'Iphone x'},
      { id: '1', name: 'Iphone 11'},
      { id: '2', name: 'Iphone 12'},
      { id: '3', name: 'Iphone 13'}
    ]).pipe(delay(1000))
  }
}
