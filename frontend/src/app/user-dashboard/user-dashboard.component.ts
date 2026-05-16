import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UserService } from '../services/user.service';

interface User { name:string; email:string; role:string }

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  users: User[] = [];
  roleCounts = { Admin:0, Editor:0, Viewer:0 };
  filterText = '';
  page = 1;
  pageSize = 5;
  loading = false;

  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('formAnchor', { read: ViewContainerRef, static: true }) formAnchor!: ViewContainerRef;

  private chart: any = null;

  constructor(private userService: UserService) {}

  ngOnInit(){
    this.userService.users$.subscribe(users => {
      this.users = users;
      this.page = 1;
      this.updateRoleCounts();
      this.updateChart();
    });
    this.userService.loading$.subscribe(l => this.loading = l);
    this.userService.loadInitial();
  }

  openAddUser(){
    // lazy-load the standalone component
    import('../user-form/user-form.component').then(m => {
      const comp = m.UserFormComponent;
      const ref = this.formAnchor.createComponent(comp);
      ref.instance.submit.subscribe((user: User) => {
        this.userService.addUser(user).subscribe(() => {
          ref.destroy();
        });
      });
      ref.instance.cancel.subscribe(() => ref.destroy());
    });
  }

  private updateRoleCounts(){
    this.roleCounts = { Admin:0, Editor:0, Viewer:0 };
    for(const u of this.users){
      if(this.roleCounts[u.role as keyof typeof this.roleCounts] !== undefined){
        this.roleCounts[u.role as keyof typeof this.roleCounts]++;
      }
    }
  }

  private async updateChart(){
    const data = [this.roleCounts.Admin, this.roleCounts.Editor, this.roleCounts.Viewer];
    if(!this.chart){
      const Chart = (await import('chart.js/auto')).default;
      this.chart = new Chart(this.chartCanvas.nativeElement.getContext('2d'), {
        type: 'pie',
        data: {
          labels: ['Admin','Editor','Viewer'],
          datasets: [{ data, backgroundColor: ['#1c4980','#383838','#cccccc'] }]
        }
      });
    } else {
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }

  get filteredUsers(){
    const q = this.filterText.trim().toLowerCase();
    if(!q) return this.users;
    return this.users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
  }

  get totalPages(){
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  get displayedUsers(){
    const start = (this.page - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  goPage(n:number){
    this.page = Math.min(Math.max(1, n), this.totalPages);
  }
}
