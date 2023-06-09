import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { User } from '../../interface/user.interface';
import { UsersService } from 'src/app/services/users.service';
import { DeleteModalComponent } from '../../delete-modal/delete-modal.component';
import { SharedService } from 'src/app/services/shared.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  usersList: User[] = [];
  errorMessage: string = '';
  selectAll: boolean = false;
  selectedItems: User[] = [];
  isRowSelected: boolean = false;
  private deleteButtonSubscription?: Subscription;
  sortOrder: string = 'asc';
  activeSortColumn: string | null = null;
  toastMessage: string = '';
  @ViewChild(DeleteModalComponent, { static: false })
  deleteModal: DeleteModalComponent | null = null;

  constructor(
    private userServices: UsersService,
    private cdRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private routeActive: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getAllUser();
    this.deleteButtonSubscription =
      this.sharedService.deleteButtonClicked.subscribe(() => {
        this.deleteSelectedUsers();
        this.showToastMessage('Deleted Successfully');
      });

    const loginMessageShown = localStorage.getItem('loginMessageShown');
    if (loginMessageShown === 'true') {
      // Show login message
      this.showToastMessage('Login Successfully');
      // Clear the flag value in localStorage
      localStorage.removeItem('loginMessageShown');
    }
  }

  //show toast message function
  showToastMessage(message: string) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }

  // get all user from data.json
  getAllUser() {
    this.userServices.getAllUser().subscribe(
      (users: User[]) => {
        // Handle the received user data
        this.usersList = users;
      },
      (error: any) => {
        // Handle the error
        this.errorMessage = error;
      }
    );
  }

  // delete selected user from table
  deleteSelectedUsers() {
    this.selectedItems = this.usersList.filter((user) => user.selected);
    const userIds = this.selectedItems.map((user) => user.id);
    this.usersList = this.usersList.filter(
      (user) => !userIds.includes(user.id)
    );
    this.cdRef.detectChanges();
  }

  // Delete button click open modal
  openDeleteModal() {
    if (this.deleteModal) {
      this.deleteModal.openModal();
    }
  }

  // row delete button click
  deleteUser(selectedUser: User) {
    this.openDeleteModal();
    // Update the selected user
    this.usersList.forEach((user) => {
      if (user === selectedUser) {
        user.selected = true;
      } else {
        user.selected = false;
      }
    });
  }

  //select all table row
  selectAllRows() {
    this.isRowSelected = this.selectAll;
    for (const user of this.usersList) {
      user.selected = this.selectAll;
    }
  }

  // select single table row
  updateRowSelection() {
    this.isRowSelected = this.usersList.some((user) => user.selected);
  }

  // sorting table column
  sortBy(column: string, type: string) {
    // sorting logic here
    this.sortOrder = type;
    this.usersList.sort((a, b) => {
      const valueA = this.getUserValue(a, column);
      const valueB = this.getUserValue(b, column);

      if (valueA < valueB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      } else if (valueA > valueB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
    this.activeSortColumn = column;
  }

  // get user value for row sorting
  getUserValue(user: any, column: string): any {
    const userprop = column.split('.');
    let u = user;
    for (const prop of userprop) {
      u = u[prop];
    }
    return u;
  }

  ngOnDestroy(): void {
    this.deleteButtonSubscription?.unsubscribe();
  }
}
