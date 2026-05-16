import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div style="position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;padding:20px">
    <div style="background:#fff;padding:20px;border-radius:8px;min-width:320px">
      <h3>Add User</h3>
      <form (ngSubmit)="onSubmit()" #f="ngForm">
        <div style="margin-bottom:8px">
          <input name="name" [(ngModel)]="model.name" class="input" placeholder="Name" required />
        </div>
        <div style="margin-bottom:8px">
          <input name="email" [(ngModel)]="model.email" class="input" placeholder="Email" required email />
        </div>
        <div style="margin-bottom:12px">
          <select name="role" [(ngModel)]="model.role" class="input" required>
            <option value="">Select role</option>
            <option>Admin</option>
            <option>Editor</option>
            <option>Viewer</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn" (click)="onCancel()" style="background:#ccc;color:#000">Cancel</button>
          <button type="submit" class="btn" [disabled]="!f.form.valid">Add</button>
        </div>
      </form>
    </div>
  </div>
  `
})
export class UserFormComponent {
  @Output() submit = new EventEmitter<User>();
  @Output() cancel = new EventEmitter<void>();

  model: User = { name:'', email:'', role:'' };

  onSubmit(){
    if(this.model.name && this.model.email && this.model.role){
      this.submit.emit(this.model);
    }
  }

  onCancel(){ this.cancel.emit(); }
}
