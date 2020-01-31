import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material';
import { MatSliderModule } from '@angular/material';
import { MatDatepickerModule } from '@angular/material';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { MatNativeDateModule } from '@angular/material';
import { MatSnackBarModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material';
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
    MatNativeDateModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatMomentDateModule
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
    MatNativeDateModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatMomentDateModule
  ]
})
export class InputFormMaterial {}
