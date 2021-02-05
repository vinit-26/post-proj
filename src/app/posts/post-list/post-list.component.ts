import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  private postSubscription: Subscription;
  isAuthenticated = false;
  userId: string | null;
  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.isLoading = true;
    this.postSubscription = this.postsService.getPostUpdateListener().subscribe(
      (posts: Post[]) => {
        this.posts = posts;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
    this.isAuthenticated = this.authService.getIsAuth();
    this.authService.getAuthStatusListner().subscribe((isAuth) => {
      if (isAuth) {
        this.isAuthenticated = isAuth;
        this.userId = this.authService.getUserId();
      }
    });
    this.postsService.getPosts();
  }
  onDeletePost(postId: string): void {
    this.isLoading = true;
    this.postsService.deletePost(postId);
  }
  onPageChange(pageData: PageEvent): void {
    this.isLoading = true;
    this.postsService.getPosts();
  }
  ngOnDestroy(): void {
    if (this.postSubscription) {
      this.postSubscription.unsubscribe();
    }
  }
}
