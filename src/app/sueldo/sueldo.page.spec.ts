import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SueldoPage } from './sueldo.page';

describe('SueldoPage', () => {
  let component: SueldoPage;
  let fixture: ComponentFixture<SueldoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SueldoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
