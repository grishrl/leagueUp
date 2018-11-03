import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DirectoryComponent } from './directory/directory.component';
import { AppRoutingModule } from './app.Routes';
import { NavComponent } from './nav/nav.component';
import { LoginComponent } from './login/login.component';
import { ResponseInterceptor } from './token-interceptor.service';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { InputFormMaterial } from './classes/aM-input-Import.class';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamProfileComponent } from './team-profile/team-profile.component';
import { DivisionComponent } from './division/division.component';
import { TeamDisplayComponent } from './team-display/team-display.component';
import { MembersDisplayComponent } from './members-display/members-display.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { OutreachEmailResponseComponent } from './outreach-email-response/outreach-email-response.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogViewComponent } from './blog-view/blog-view.component';
import { AppFooterComponent } from './app-footer/app-footer.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DirectoryComponent,
    NavComponent,
    LoginComponent,
    ProfileEditComponent,
    TeamProfileComponent,
    DivisionComponent,
    TeamDisplayComponent,
    MembersDisplayComponent,
    UserSearchComponent,
    OutreachEmailResponseComponent,
    BlogListComponent,
    BlogViewComponent,
    AppFooterComponent
  ],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    InputFormMaterial,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
    provide:HTTP_INTERCEPTORS,
    useClass:ResponseInterceptor,
    multi:true
    },
    { provide: 'xDomainCookie', useValue: window['xDomainCookie']}
  ],
  bootstrap: [AppComponent]
})


export class AppModule { }
