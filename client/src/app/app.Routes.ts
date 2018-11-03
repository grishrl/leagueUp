import { HomeComponent } from "./home/home.component";
import { DirectoryComponent } from "./directory/directory.component";
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";
import { LoginComponent } from "./login/login.component";
import { ProfileEditComponent } from "./profile-edit/profile-edit.component";
import { TeamProfileComponent } from "./team-profile/team-profile.component";
import { DivisionComponent } from "./division/division.component";
import { OutreachEmailResponseComponent } from "./outreach-email-response/outreach-email-response.component";
import { BlogListComponent } from "./blog-list/blog-list.component";
import { BlogViewComponent } from "./blog-view/blog-view.component";

const APP_ROUTES: Routes = [
  { path: 'directory', component: DirectoryComponent},
  { path:'', component: HomeComponent},
  { path: 'login', component: LoginComponent },
  { path: 'login/:token', component: LoginComponent},
  { path: 'profile/:id', component: ProfileEditComponent},
  { path: 'teamProfile/:id', component: TeamProfileComponent},
  { path: 'division/:division', component: DivisionComponent, runGuardsAndResolvers:'paramsChange' },
  { path: 'division/:division/:coast', component: DivisionComponent, runGuardsAndResolvers: 'paramsChange' },
  { path: 'email/invite/:id', component:OutreachEmailResponseComponent },
  { path: 'blog', component:BlogListComponent},
  { path: 'blog/:id', component:BlogViewComponent}
]

@NgModule({
  imports: [ RouterModule.forRoot(APP_ROUTES, {onSameUrlNavigation:'reload'})],
  exports : [ RouterModule ]
})

export class AppRoutingModule{}