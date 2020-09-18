import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { HttpResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as moment from 'moment';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  // variables to store front-end data
  events = [];
  categories = [];
  tags = [];

  // filter variables
  categoryFilter: any = null;
  tagFilter: any = null;
  dateFilter: string = '';


  // store state of loading to check if all data is loaded
  isLoaded = false;

  destroy$ = new Subject<boolean>();

  constructor(private apiService: ApiService) { }

  ngOnInit() {

    this.apiService.getEvents().pipe(takeUntil(this.destroy$)).subscribe((res: HttpResponse<any>) => {
      this.events = res.body.data.items;
      this.formatDates();

      if (this.categories.length !== 0 && this.tags.length !== 0) this.isLoaded = true;
    });

    this.apiService.getTaxonomies().pipe(takeUntil(this.destroy$)).subscribe((res: HttpResponse<any>) => {

      for (let i = 0; i < res.body.data[0].items.length; i++) {
        this.categories.push({
          id: res.body.data[0].items[i].id,
          title: res.body.data[0].items[i].title,
        })
      }

      for (let j = 0; j < res.body.data[j].items.length; j++) {
        this.tags.push({
          id: res.body.data[1].items[j].id,
          title: res.body.data[1].items[j].title
        })
      }

      if (this.events.length !== 0) this.isLoaded = true;
    });


  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  private formatDates() {
    for (let i = 0; i < this.events.length; i++) {
      this.events[i].start_datetime = moment(this.events[i].start_datetime).format('MMM Do YY, h:mm a');
      this.events[i].end_datetime = moment(this.events[i].end_datetime).format('MMM Do YY, h:mm a');
    }
  }

  private formatDateParam(date) {

    if (!!date) {
      let month = '' + (date.getMonth() + 1),
        day = '' + date.getDate(),
        year = date.getFullYear();

      if (month.length < 2)
        month = '0' + month;
      if (day.length < 2)
        day = '0' + day;

      return [year, month, day].join('-');
    }
    return null;
  }

  public selectCategoryFilter(category) {
    this.categoryFilter = category;
  }

  public selectTagFilter(tag) {
    this.tagFilter = tag;
  }

  public applyFilters() {
    this.isLoaded = false;
    this.dateFilter = this.formatDateParam(this.dateFilter);
    let cFilter = !!this.categoryFilter ? this.categoryFilter.id : '';
    let tFilter = !!this.tagFilter ? this.tagFilter.id : '';
    this.apiService.sendGetRequestToUrl(this.apiService.first, cFilter, tFilter, this.dateFilter)
      .pipe(takeUntil(this.destroy$)).subscribe((res: HttpResponse<any>) => {
        this.events = res.body.data.items;
        this.formatDates();
        this.isLoaded = true;
      });
  };

  public firstPage() {
    this.apiService.sendGetRequestToUrl(this.apiService.first)
      .pipe(takeUntil(this.destroy$)).subscribe((res: HttpResponse<any>) => {
        this.events = res.body.data.items;
        this.formatDates();
      });
  }
  public previousPage() {

    if (this.apiService.prev !== undefined && this.apiService.prev !== '') {
      this.apiService.sendGetRequestToUrl(this.apiService.prev)
        .pipe(takeUntil(this.destroy$)).subscribe((res: HttpResponse<any>) => {
          this.events = res.body.data.items;
          this.formatDates();
        })
    }

  }
  public nextPage() {
    if (this.apiService.next !== undefined && this.apiService.next !== '') {
      this.apiService.sendGetRequestToUrl(this.apiService.next)
        .pipe(takeUntil(this.destroy$)).subscribe((res: HttpResponse<any>) => {
          this.events = res.body.data.items;
          this.formatDates();
        })
    }
  }
  public lastPage() {
    this.apiService.sendGetRequestToUrl(this.apiService.last)
      .pipe(takeUntil(this.destroy$)).subscribe((res: HttpResponse<any>) => {
        this.events = res.body.data.items;
        this.formatDates();
      })
  }
}
