import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMomentDateModule } from '@angular/material-moment-adapter';


@NgModule({
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSliderModule,
    MatDatepickerModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatRadioModule,
    MatTabsModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatMomentDateModule,
  ],
  exports: [
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSliderModule,
    MatDatepickerModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatRadioModule,
    MatTabsModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatMomentDateModule,
  ],
})
export class InputFormMaterial {}
