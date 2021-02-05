import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { Post, ResponseData } from './post.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];
  private postUpdated = new Subject<Post[]>();
  private baseUrl = environment.apiURL;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastrService
  ) {}

  getPost(id: string): Observable<ResponseData> {
    return this.http.get<ResponseData>(this.baseUrl + `/post/${id}`);
  }
  getPosts(): void {
    this.http
      .get<ResponseData>(this.baseUrl + '/posts')
      .pipe(
        map((data: ResponseData) => {
          const resData: Post[] = data.data.map((post: Post) => {
            return {
              title: post.title,
              content: post.content,
              id: post.id,
              imagePath: post.imagePath,
              creator: post.creator,
            };
          });
          return resData;
        })
      )
      .subscribe(
        (post: Post[]) => {
          this.posts = post;
          this.postUpdated.next([...this.posts]);
        },
        (error) => {
          this.postUpdated.next([]);
          console.log(error);
        }
      );
  }
  getPostUpdateListener(): Observable<Post[]> {
    return this.postUpdated.asObservable();
  }
  addPost(post: Post, image: File): void {
    const postData = new FormData();
    postData.append('title', post.title);
    postData.append('content', post.content);
    postData.append('image', image, post.title);
    this.http.post<ResponseData>(this.baseUrl + '/post', postData).subscribe(
      (response: ResponseData) => {
        const createdPost: Post = response.data[0];
        this.posts.push(createdPost);
        this.postUpdated.next([...this.posts]);
        this.toast.success('Post Created', 'Success');
        this.router.navigate(['/post/list']);
      },
      (error) => {
        this.router.navigate(['/post/list']);
      }
    );
  }
  updatePost(post: Post, image: File | string): void {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', post.id);
      postData.append('title', post.title);
      postData.append('content', post.content);
      postData.append('image', image, post.title);
    } else {
      postData = {
        id: post.id,
        title: post.title,
        content: post.content,
        imagePath: image,
      };
    }
    this.http.put(this.baseUrl + `/post/${post.id}`, postData).subscribe(
      (response: any) => {
        this.toast.success('Post Updated', 'Success');
        this.router.navigate(['/post/list']);
      },
      (error) => {
        this.router.navigate(['/post/list']);
      }
    );
  }
  deletePost(postId: string): void {
    this.http.delete<ResponseData>(this.baseUrl + `/post/${postId}`).subscribe(
      (result: ResponseData) => {
        this.posts = this.posts.filter((post: Post) => post.id !== result.id);
        this.toast.success('Post Deleted', 'Success');
        this.postUpdated.next([...this.posts]);
      },
      (error) => {
        this.postUpdated.next([...this.posts]);
        this.router.navigate(['/post/list']);
      }
    );
  }
}
