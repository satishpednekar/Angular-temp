import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, forkJoin, zip } from 'rxjs';
import { concatMap, delay, map, startWith } from 'rxjs/operators';

interface User {
  id: number;
}

interface Post {
  id: number;
}

@Component({
  selector: 'my-app',
  template: ` 
    RXJS EXAMPLE. See Console
    <div *ngIf="data">
      <pre>First User email: {{data[0][0].email}}</pre>
      <pre>First Post title: {{data[1][0].title | json}}</pre>
    </div>
  `,
})
export class AppComponent {
  private state: { posts: any; albums: any; todos: any } = {
    posts: null,
    albums: null,
    todos: null,
  };

  data: [User[], Post[]];

  private stateSubject: BehaviorSubject<{
    posts: any;
    albums: any;
    todos: any;
  }> = new BehaviorSubject<{ posts: any; albums: any; todos: any }>(this.state);

  constructor(private http: HttpClient) {
    const posts$ = this.http.get<any>(
      'https://jsonplaceholder.typicode.com/posts'
    );
    const albums$ = this.http
      .get<any>('https://jsonplaceholder.typicode.com/albums')
      .pipe(delay(5000));
    const todos$ = this.http
      .get<any>('https://jsonplaceholder.typicode.com/todos')
      .pipe(delay(3000));

    let count = 0;

    combineLatest([posts$, albums$, todos$])
      .pipe(
        map(([posts, albums, todos]) => ({ posts, albums, todos })),
        startWith(this.state)
      )
      .subscribe((data) => {
        this.stateSubject.next(data);
      });

    this.stateSubject.subscribe((data) => {
      console.log('count::', count++);
      console.log('data::', data);
    });

    // 1st solution, looks like sequencing problem.

    // posts$
    //   .pipe(
    //     concatMap((posts) => {
    //       this.state.posts = posts;
    //       this.stateSubject.next(this.state);
    //       return albums$;
    //     }),
    //     concatMap((albums) => {
    //       this.state.albums = albums;
    //       this.stateSubject.next(this.state);
    //       return todos$;
    //     }),
    //     concatMap((todos) => {
    //       this.state.todos = todos;
    //       this.stateSubject.next(this.state);
    //       return this.stateSubject.asObservable();
    //     })
    //   )
    //   .subscribe(() => {
    //     // console.log('data subscribe');
    //   });

    // this.stateSubject.subscribe((data) => {
    //   console.log('count::', count++);
    //   console.log('data::', data);
    // });

    // forkJoin([users, posts]).subscribe((res) => {
    //   this.data = res;
    //   console.log('User and Post', res);
    // });
  }
}
