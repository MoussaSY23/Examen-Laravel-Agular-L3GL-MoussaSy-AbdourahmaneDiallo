import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandePanierComponent } from './commande-panier.component';

describe('CommandePanierComponent', () => {
  let component: CommandePanierComponent;
  let fixture: ComponentFixture<CommandePanierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommandePanierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommandePanierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
