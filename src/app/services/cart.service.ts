import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Produit } from '../models/produit.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private readonly CART_STORAGE_KEY = 'boulangerie_cart';

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    if (savedCart) {
      try {
        this.cartItems = JSON.parse(savedCart);
        this.cartSubject.next([...this.cartItems]);
      } catch (e) {
        console.error('Error parsing cart from storage', e);
        this.clearCart();
      }
    }
  }

  private saveCartToStorage(): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItems));
  }

  getCart(): CartItem[] {
    return [...this.cartItems];
  }

  getCartObservable(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  addToCart(product: Produit, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.total = existingItem.prix * existingItem.quantity;
    } else {
      const newItem: CartItem = {
        ...product,
        quantity,
        total: product.prix * quantity
      };
      this.cartItems.push(newItem);
    }
    
    this.updateCart();
  }

  removeFromCart(productId: number | string): void {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.updateCart();
  }

  updateCartItemQuantity(productId: number | string, quantity: number): void {
    const item = this.cartItems.find(i => i.id === productId);
    if (item) {
      item.quantity = quantity;
      item.total = item.prix * quantity;
      this.updateCart();
    }
  }

  updateCart(items: CartItem[] = this.cartItems): void {
    this.cartItems = items.filter(item => item.quantity > 0);
    this.cartSubject.next([...this.cartItems]);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItems = [];
    this.cartSubject.next([]);
    localStorage.removeItem(this.CART_STORAGE_KEY);
  }

  getCartItemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.total, 0);
  }
}
