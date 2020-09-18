import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";

import { throwError } from 'rxjs';
import { retry, tap, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private SERVER_URL = "https://timelyapp.time.ly/api/calendars/4243455";

  public first: string = "";
  public prev: string = "";
  public next: string = "";
  public last: string = "";

  public data: any = {};

  public taxonomies: any = {};


  constructor(private httpClient: HttpClient) { }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  public sendGetRequestToUrl(url: string, categoryID: string = '', tagID: string = '', startDate: string = '') {

    let params = (categoryID != '' || tagID != '' || startDate != '') ? '&' : '';

    if (!!categoryID) params += `categories=${categoryID}&`;
    if (!!tagID) params += `tags=${tagID}&`;
    if (!!startDate) params += `start_date=${startDate}`;

    url += params;

    return this.httpClient.get(url, { observe: "response" }).pipe(retry(3),
      catchError(this.handleError), tap(res => {
        this.data = res.body;
        this.first = this.SERVER_URL + `/events?page=1&per_page=10` + params;
        this.last = this.SERVER_URL + `/events?page=${Math.floor(this.data.data.total / 10) + 1}&per_page=10` + params;
        this.prev = this.SERVER_URL + `/events?page=${(this.data.data.from / 10)}&per_page=10` + params;
        if (this.data.data.from < ((this.data.data.total / 10) * 10) - 10) {
          this.next = this.SERVER_URL + `/events?page=${((this.data.data.from / 10) + 2)}&per_page=10` + params;
        } else {
          this.next = this.last + params;
        }
      }));
  }

  public getEvents() {
    // Add safe, URL encoded page and per_page parameters 

    return this.httpClient.get(this.SERVER_URL + '/events', { params: new HttpParams({ fromString: "page=1&per_page=10" }), observe: "response" }).pipe(retry(3), catchError(this.handleError), tap(res => {
      this.data = res.body;
      this.first = this.SERVER_URL + '/events?page=1&per_page=10';
      this.prev = this.first;
      this.next = this.SERVER_URL + '/events?page=2&per_page=10';
      this.last = this.SERVER_URL + `/events?page=${Math.floor(this.data.data.total / 10) + 1}&per_page=10`;
    }));
  }

  public getTaxonomies() {

    return this.httpClient.get(this.SERVER_URL + '/taxonomies', { observe: "response" }).pipe(retry(3),
      catchError(this.handleError));
  }
};