import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandesFormComponent } from './commandes-form.component';

describe('CommandesFormComponent', () => {
  let component: CommandesFormComponent;
  let fixture: ComponentFixture<CommandesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommandesFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommandesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
