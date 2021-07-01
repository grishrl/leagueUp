import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';

import { AppRoutingModule } from './app.Routes';
import { NavComponent } from './nav/nav.component';
import { LoginComponent } from './pages/login/login.component';
import { ResponseInterceptor } from './services/token-interceptor.service';
import { PlayerProfile } from './pages/player-profile-page/player-profile-page.component';
import { InputFormMaterial } from './classes/aM-input-Import.class';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamProfileComponent } from './pages/team-profile-page/team-profile-page.component';
import { DivisionComponent } from './pages/division-page/division-page.component';
import { TeamDisplayComponent } from './components/team/team-display/team-display.component';
import { MembersDisplayComponent } from './components/unused/members-display/members-display.component';
import { UserSearchComponent } from './components/user-search/user-search.component';
import { OutreachEmailResponseComponent } from './pages/outreach-email-response/outreach-email-response.component';
import { BlogListComponent } from './components/blog/blog-list/blog-list.component';
import { BlogViewComponent } from './pages/blog-view/blog-view.component';
import { AppFooterComponent } from './components/app-footer/app-footer.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { CreateTeamComponent } from './pages/create-team/create-team.component';
import { ApproveMemberComponent } from './admin/approve-member/approve-member.component';
import { UserQuickViewComponent } from './admin/approve-member/user-quick-view/user-quick-view.component';
import { TeamQuickViewComponent } from './admin/approve-member/team-quick-view/team-quick-view.component';
import { ApproveMemberViewComponent } from './admin/approve-member/approve-member-view/approve-member-view.component';
import { ManageMemberComponent } from './admin/manage-member/manage-member.component';
import { ManageSelectTeamComponent } from './admin/manage-team/manage-select-team.component';
import { TeamSearchComponent } from './components/team/team-search/team-search.component';
import { ChangeCaptainModalComponent } from './modal/change-captain-modal/change-captain-modal.component';
import { DivisionManagementComponent } from './admin/division-management/division-management.component';
import { AddTeamComponent } from './admin/division-management/add-team/add-team.component';
import { DivisionPropsComponent } from './admin/division-management/division-props/division-props.component';
import { RemoveTeamComponent } from './admin/division-management/remove-team/remove-team.component';
import { ScheduleViewComponent } from './components/schedule/schedule-view/schedule-view.component';
import { MatchSchedulerComponent } from './pages/match-scheduler/match-scheduler.component';

import { ReportingComponent } from './pages/reporting/reporting.component';
import { ReportingDeckComponent } from './pages/reporting/reporting-deck/reporting-deck.component';
import { ngfModule } from 'angular-file';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CasterDashboardComponent } from './pages/caster-dashboard/caster-dashboard.component';
import { CasterInputsComponent } from './pages/caster-dashboard/caster-inputs/caster-inputs.component';
import { MatchEditComponent } from './admin/match-management/match-edit/match-edit.component';
import { MatchManagementComponent } from './admin/match-management/match-management.component';
import { AdminAclManagementComponent } from './admin/admin-acl-management/admin-acl-management.component';
import { UpdateRolesComponent } from './admin/admin-acl-management/update-roles/update-roles.component';
import { StandingsViewComponent } from './components/division/standings-view/standings-view.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { ManageTeamViewComponent } from './admin/manage-team/manage-team-view/manage-team-view.component';
import { DeleteConfrimModalComponent } from './modal/delete-confrim-modal/delete-confrim-modal.component';
import { NoAccessComponent } from './pages/no-access/no-access.component';
import { SessionTimeoutComponent } from './pages/session-timeout/session-timeout.component';
import { TimesAvailableComponent } from './formComponents/times-available/times-available.component';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';
import { LogsViewerComponent } from './admin/logs-viewer/logs-viewer.component';
import { CalendarViewComponent } from './pages/calendar-view/calendar-view.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { EventModalComponent } from './pages/calendar-view/event-modal/event-modal.component';
import { EventLargeComponent } from './pages/calendar-view/event-large/event-large.component';
import { SetDeadlineComponent } from './admin/match-management/set-deadline/set-deadline.component';
import { MatchViewComponent } from './components/match/match-view/match-view.component';
import { DropDownTimeComponent } from './formComponents/times-available/drop-down-time/drop-down-time.component';
import { UserMessageCenterComponent } from './pages/messageCenter/user-message-center/user-message-center.component';
import { TeamMarketComponent } from './marketplace/team-market/team-market.component';
import { UserMarketplaceComponent } from './marketplace/user-marketplace/user-marketplace.component';
import { UserDeckComponent } from './marketplace/user-marketplace/user-deck/user-deck.component';

import { ConfirmRemoveMemberComponent } from './modal/confirm-remove-member/confirm-remove-member.component';
import { TournamentGeneratorComponent } from './admin/match-management/tournament-generator/tournament-generator.component';
import { GenerateSeasonComponent } from './admin/match-management/generate-season/generate-season.component';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { TournamentViewComponent } from './components/tournament-view/tournament-view.component';
import { ReplayBrowserComponent } from './pages/replay-browser/replay-browser.component';
import { DivisionSelectorComponent } from './components/division-selector/division-selector.component';
import { DragScrollModule } from 'ngx-drag-scroll';

import { TeamTournamentsComponent } from './components/schedule/team-tournaments/team-tournaments.component';
import { TournamentReportingComponent } from './pages/reporting/tournament-reporting/tournament-reporting.component';
import { EventDisplayComponent } from './components/events/event-display/event-display.component';
import { EventCreateComponent } from './admin/events/event-create/event-create.component';
import { EventListComponent } from './admin/events/event-list/event-list.component';
import { MatchViewVerticleComponent } from './components/match/match-view-verticle/match-view-verticle.component';
import { LargeCarouselComponent } from './components/large-carousel/large-carousel.component';

import { NewsNoSidebarComponent } from './components/news-no-sidebar/news-no-sidebar.component';
import { DivisionStandingsComponent } from './components/division-standings/division-standings.component';
import { RecentResultsComponent } from './components/recent-results/recent-results.component';
import { TopStatsWidgetComponent } from './components/top-stats-widget/top-stats-widget.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import { DivisionTableViewComponent } from './components/division-table-view/division-table-view.component';
import { MiniTeamViewComponent } from './components/division-table-view/mini-team-view/mini-team-view.component';
import { RecentNewsComponent } from './components/recent-news/recent-news.component';
import { UpcomingMatchesComponent } from './components/upcoming-matches/upcoming-matches.component';
import { RecentContentComponent } from './components/recent-content/recent-content.component';
import { SafePipe } from './safe.pipe';
import { SafeHtmlPipe } from './static-html-loader/static-html-loader.component';
import { StaticHtmlLoaderComponent } from './static-html-loader/static-html-loader.component';
import { HideMenuDirective } from './nav/hide-menu.directive';
import { CategoriesComponent } from './components/blog/categories/categories.component';
import { BlogHeadlineComponent } from './components/blog/blog-headline/blog-headline.component';
import { TextInputComponent } from './formComponents/competitiveLevel/competitive-level.component';
import { StormLeagueComponent } from './formComponents/storm-league/storm-league.component';
import { PlayHistoryComponent } from './formComponents/play-history/play-history.component';
import { RolesComponent } from './formComponents/roles/roles.component';
import { DiscordTagComponent } from './formComponents/discord-tag/discord-tag.component';
import { TimezoneComponent } from './formComponents/timezone/timezone.component';
import { HistoryComponent } from './components/player/history/history.component';

import { MembersComponent } from './components/team/members/members.component';
import { PlayerSmallCardComponent } from './components/player/player-small-card/player-small-card.component';
import { TeamScheduleTableComponent } from './components/schedule/team-schedule-table/team-schedule-table.component';
import { TeamResultsTilesComponent } from './components/team/team-results-tiles/team-results-tiles.component';

import { TeamHistoryComponent } from './components/team/team-history/team-history.component';
import { TeamUpcomingMatchComponent } from './components/team/team-upcoming-match/team-upcoming-match.component';
import { DivisionResultsTilesComponent } from './components/division/division-results-tiles/division-results-tiles.component';
import { DivisionUpcomingMatchesComponent } from './components/division/division-upcoming-matches/division-upcoming-matches.component';
import { BannerImageComponent } from './components/banner-image/banner-image.component';
import { ResultsTilesComponent } from './components/results-tiles/results-tiles.component';
import { ApprovePendingAvatarComponent } from './admin/approve-pending-avatar/approve-pending-avatar.component';
import { ApproveAvatarViewComponent } from './admin/approve-pending-avatar/approve-avatar-view/approve-avatar-view.component';
import { TwitchComponent } from './formComponents/twitch/twitch.component';
import { TwitterComponent } from './formComponents/twitter/twitter.component';
import { YoutubeComponent } from './formComponents/youtube/youtube.component';
import { UpdateMemberInfoComponent } from './admin/manage-member/update-member-info/update-member-info.component';
import { UpdateTeamInfoComponent } from './admin/manage-team/update-team-info/update-team-info.component';
import { TeamTickerComponent } from './formComponents/team-ticker/team-ticker.component';
import { AllTeamsComponent } from './pages/all-teams/all-teams.component';
import { DivisionIfPublicComponent } from './elements/division-if-public/division-if-public.component';
import { LeagueStatsComponent } from './components/league-stats/league-stats.component';
import { LStatDirective } from './components/league-stats/l-stat.directive';
import { MatchResultsViewComponent } from './components/match/games-information/match-results-view/match-results-view.component';
import { ChallongeTournComponent } from './components/challonge-tourn/challonge-tourn.component';
import { DivisionLinkComponent } from './LinkComponents/division-link/division-link.component';
import { TeamLinkComponent } from './LinkComponents/team-link/team-link.component';
import { PlayerLinkComponent } from './LinkComponents/player-link/player-link.component';
import { DivisionCupResultsTilesComponent } from './components/division/division-cup-results-tiles/division-cup-results-tiles.component';
import { DivisionTournamentResultsTilesComponent } from './components/division/division-tournament-results-tiles/division-tournament-results-tiles.component';
import { DivisionCupScheduleComponent } from './components/division//division-cup-schedule/division-cup-schedule.component';
import { TeamTournamentScheduleTableComponent } from './components/schedule/team-tournament-schedule-table/team-tournament-schedule-table.component';
import { TeamTournamentResultsTilesComponent } from './components/team/team-tournament-results-tiles/team-tournament-results-tiles.component';
import { SeasonInfoManagerComponent } from './admin/season-info-manager/season-info-manager.component';
import { DatePickerComponent } from './formComponents/date-picker/date-picker.component';
import { AssistantCaptainMgmtComponent } from './modal/assistant-captain-mgmt/assistant-captain-mgmt.component';
import { PastSeasonsComponent } from './pages/past-seasons/past-seasons.component';
import { AuthorListComponent } from './components/blog/author-list/author-list.component';
import { AuthorPageComponent } from './components/blog/author-page/author-page.component';
import { DivisionTournamentScheduleTableComponent } from './components/division/division-tournament-schedule-table/division-tournament-schedule-table.component';
import { CasterPageComponent } from './pages/caster-page/caster-page.component';
import { AuthorNameComponent } from './components/blog/author-name/author-name.component';
import { ImageGetterComponent } from './components/blog/image-getter/image-getter.component';
import { MatchupHistoryComponent } from './components/match/matchup-history/matchup-history.component';
import { GamesInformationComponent } from './components/match/games-information/games-information.component';
import { MatchupInfoEmbeddableComponent } from './components/match/matchup-history/matchup-info-embeddable/matchup-info-embeddable.component';
import { ScheduleTableComponent } from './elements/schedule-table/schedule-table.component';
import { ScoutReportComponent } from './scout-report/scout-report.component';
import { CasterDashboardMatchDisplayComponent } from './pages/caster-dashboard/caster-dashboard-match-display/caster-dashboard-match-display.component';
import { MvpReportComponent } from './pages/reporting/mvp-report/mvp-report.component';
import { PotgPageComponent } from './pages/potg-page/potg-page.component';
import { PotgDisplayComponent } from './pages/potg-page/potg-display/potg-display.component';
import { CurrentlyLiveGamesComponent } from './components/currently-live-games/currently-live-games.component';
import { LiveGameEmbeddComponent } from './components/currently-live-games/live-game-embed/live-game-embedd.component';
import { MvpDisplayComponent } from './components/mvp-display/mvp-display.component';
import { PlayerDisplayComponent } from './pages/potg-page/potg-display/player-display/player-display.component';
import { MvpPageComponent } from './pages/mvp-page/mvp-page.component';
import { StreamManagerComponent } from './admin/stream-manager/stream-manager.component';
import { CommonPipePipe } from './common/common-pipe.pipe';
import { TeamNameComponent } from './formComponents/team-name/team-name.component';
import { RoundColumnComponent } from './elements/schedule-table/round-column/round-column.component';
import { ActiveTournamentViewerComponent } from './pages/tournament-viewer-page/active-tournament-viewer/active-tournament-viewer.component';
import { TeamRegisteredComponent } from './components/team/team-registered/team-registered.component';
import { ArchiveSeasonComponent } from './admin/archive-season/archive-season.component';
import { DisplayNameForIdComponent } from './elements/display-name-for-id/display-name-for-id.component';
import { NotesComponent } from './admin/approve-member/approve-member-view/notes/notes.component';
import { ReplayCastsComponent } from './components/caster-tools/replay-casts/replay-casts.component';
import { LiveCastsComponent } from './components/caster-tools/live-casts/live-casts.component';
import { MatchPaginatorComponent } from './components/caster-tools/match-paginator/match-paginator.component';
import { DateTimePickerComponent } from './formComponents/date-time-picker/date-time-picker.component';
import { GrandFinalGeneratorComponent } from './admin/grand-final-generator/grand-final-generator.component';
import { NotesViewComponent } from './components/notes/notes-view/notes-view.component';
import { NotesCreateComponent } from './components/notes/notes-create/notes-create.component';
import { TournamentViewerComponent } from './pages/tournament-viewer-page/tournament-viewer-page.component';
import { PastTournamentViewerComponent } from './pages/tournament-viewer-page/past-tournament-viewer/past-tournament-viewer.component';
import { CasterReportComponent } from './pages/caster-report/caster-report.component';
import { GrandChampionsViewerComponent } from './pages/grand-champions-viewer/grand-champions-viewer.component';
import { ChampExpanderComponent } from './pages/grand-champions-viewer/champ-expander/champ-expander.component';
import { MatchResultsHeaderComponent } from './components/match/match-results-header/match-results-header.component';
import { LoadingComponent } from './elements/loading/loading.component';
import { RankRequirementsComponent } from './admin/rank-requirements/set-rank-requirements/rank-requirements.component';
import { ValidateRankComponent } from './admin/rank-requirements/validate-rank/validate-rank.component';
import { ApproveRankViewComponent } from './admin/rank-requirements/validate-rank/approve-rank-view/approve-rank-view.component';
import { VerifiedStormLeagueRanksViewComponent } from './components/verified-storm-league-ranks-view/verified-storm-league-ranks-view.component';
import { DeleteTournamentComponent } from './admin/match-management/delete-tournament/delete-tournament.component';
import { MembersReportingComponent } from './components/storm-rank-tools/members-reporting/members-reporting.component';
import { VerifiedStormRanksDisplayNameComponent } from './components/storm-rank-tools/verified-storm-ranks-display-name/verified-storm-ranks-display-name.component';
import { PlayerSearchComponent } from './pages/player-search/player-search.component';
import { SingleTeamDisplayComponent } from './components/team/team-display/single-team-display/single-team-display.component';
import { MAT_COLOR_FORMATS, NgxMatColorPickerModule, NGX_MAT_COLOR_FORMATS } from '@angular-material-components/color-picker';
import { AdminYoutubeCurator } from './admin/caster/admin-youtube-curator/admin-youtube-curator.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    LoginComponent,
    PlayerProfile,
    TeamProfileComponent,
    DivisionComponent,
    TeamDisplayComponent,
    MembersDisplayComponent,
    UserSearchComponent,
    OutreachEmailResponseComponent,
    BlogListComponent,
    BlogViewComponent,
    AppFooterComponent,
    ImageUploadComponent,
    LogoutComponent,
    CreateTeamComponent,
    ApproveMemberComponent,
    UserQuickViewComponent,
    TeamQuickViewComponent,
    ApproveMemberViewComponent,
    ManageMemberComponent,
    ManageSelectTeamComponent,
    TeamSearchComponent,
    ChangeCaptainModalComponent,
    DivisionManagementComponent,
    AddTeamComponent,
    DivisionPropsComponent,
    RemoveTeamComponent,
    ScheduleViewComponent,
    MatchSchedulerComponent,
    ReportingComponent,
    ReportingDeckComponent,
    DashboardComponent,
    CasterDashboardComponent,
    CasterInputsComponent,
    MatchManagementComponent,
    MatchEditComponent,
    AdminAclManagementComponent,
    UpdateRolesComponent,
    StandingsViewComponent,
    SnackbarComponent,
    ManageTeamViewComponent,
    DeleteConfrimModalComponent,
    NoAccessComponent,
    SessionTimeoutComponent,
    TimesAvailableComponent,
    QuestionnaireComponent,
    LogsViewerComponent,
    CalendarViewComponent,
    EventModalComponent,
    EventLargeComponent,
    SetDeadlineComponent,
    MatchViewComponent,
    DropDownTimeComponent,
    UserMessageCenterComponent,
    TeamMarketComponent,
    UserMarketplaceComponent,
    UserDeckComponent,
    ConfirmRemoveMemberComponent,
    GenerateSeasonComponent,
    TournamentGeneratorComponent,
    TournamentViewComponent,
    ReplayBrowserComponent,
    DivisionSelectorComponent,
    TeamTournamentsComponent,
    TournamentReportingComponent,
    EventDisplayComponent,
    EventCreateComponent,
    EventListComponent,
    MatchViewVerticleComponent,
    LargeCarouselComponent,
    NewsNoSidebarComponent,
    DivisionStandingsComponent,
    RecentResultsComponent,
    TopStatsWidgetComponent,
    CountdownComponent,
    DivisionTableViewComponent,
    MiniTeamViewComponent,
    RecentNewsComponent,
    UpcomingMatchesComponent,
    RecentContentComponent,
    SafePipe,
    StaticHtmlLoaderComponent,
    HideMenuDirective,
    CategoriesComponent,
    BlogHeadlineComponent,
    TextInputComponent,
    StormLeagueComponent,
    PlayHistoryComponent,
    RolesComponent,
    DiscordTagComponent,
    TimezoneComponent,
    HistoryComponent,
    MembersComponent,
    PlayerSmallCardComponent,
    TeamScheduleTableComponent,
    TeamResultsTilesComponent,

    TeamHistoryComponent,
    TeamUpcomingMatchComponent,
    DivisionResultsTilesComponent,
    DivisionUpcomingMatchesComponent,
    SafeHtmlPipe,
    BannerImageComponent,
    ResultsTilesComponent,
    ApprovePendingAvatarComponent,
    ApproveAvatarViewComponent,
    TwitchComponent,
    TwitterComponent,
    YoutubeComponent,
    UpdateMemberInfoComponent,
    UpdateTeamInfoComponent,
    TeamTickerComponent,
    AllTeamsComponent,
    DivisionIfPublicComponent,
    LeagueStatsComponent,
    LStatDirective,
    MatchResultsViewComponent,
    ChallongeTournComponent,
    DivisionLinkComponent,
    TeamLinkComponent,
    PlayerLinkComponent,
    DivisionCupResultsTilesComponent,
    DivisionTournamentResultsTilesComponent,
    DivisionCupScheduleComponent,
    TeamTournamentScheduleTableComponent,
    TeamTournamentResultsTilesComponent,
    SeasonInfoManagerComponent,
    DatePickerComponent,
    AssistantCaptainMgmtComponent,
    PastSeasonsComponent,
    AuthorListComponent,
    AuthorPageComponent,
    DivisionTournamentScheduleTableComponent,
    CasterPageComponent,
    AuthorNameComponent,
    ImageGetterComponent,
    MatchupHistoryComponent,
    GamesInformationComponent,
    MatchupInfoEmbeddableComponent,
    ScheduleTableComponent,
    ScoutReportComponent,
    CasterDashboardMatchDisplayComponent,
    MvpReportComponent,
    PotgPageComponent,
    PotgDisplayComponent,
    CurrentlyLiveGamesComponent,
    LiveGameEmbeddComponent,
    MvpDisplayComponent,
    PlayerDisplayComponent,
    MvpPageComponent,
    StreamManagerComponent,
    CommonPipePipe,
    TeamNameComponent,
    TeamRegisteredComponent,
    ArchiveSeasonComponent,
    RoundColumnComponent,
    ActiveTournamentViewerComponent,
    DisplayNameForIdComponent,
    NotesComponent,
    ReplayCastsComponent,
    LiveCastsComponent,
    MatchPaginatorComponent,
    DateTimePickerComponent,
    GrandFinalGeneratorComponent,
    NotesViewComponent,
    NotesCreateComponent,
    TournamentViewerComponent,
    PastTournamentViewerComponent,
    CasterReportComponent,
    GrandChampionsViewerComponent,
    ChampExpanderComponent,
    MatchResultsHeaderComponent,
    LoadingComponent,
    RankRequirementsComponent,
    ValidateRankComponent,
    ApproveRankViewComponent,
    VerifiedStormLeagueRanksViewComponent,
    DeleteTournamentComponent,
    MembersReportingComponent,
    VerifiedStormRanksDisplayNameComponent,
    PlayerSearchComponent,
    SingleTeamDisplayComponent,
    AdminYoutubeCurator
  ],
  entryComponents:[
    DeleteConfrimModalComponent,
    ChangeCaptainModalComponent,
    ConfirmRemoveMemberComponent,
    EventModalComponent,
    AssistantCaptainMgmtComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    InputFormMaterial,
    FormsModule,
    ReactiveFormsModule,
    ngfModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    DragDropModule,
    DragScrollModule,
    NgxMatColorPickerModule
  ],
  providers: [
    {
    provide:HTTP_INTERCEPTORS,
    useClass:ResponseInterceptor,
    multi:true
    },
    { provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS }
  ],
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent]
})


export class AppModule {}

/*
    NgsAccordianComponent,
    NgsAccordianTitleComponent,
    NgsAccordianContentComponent
 */
