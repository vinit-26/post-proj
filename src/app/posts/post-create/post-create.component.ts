import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from '../mime-type.validator';
import { Post, ResponseData } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  mode = 'create';
  post: Post;
  isLoading = false;
  postId: string | null;
  form: FormGroup;
  imagePreview: string;

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        if (this.postId) {
          this.isLoading = true;
          this.postsService.getPost(this.postId).subscribe(
            (response: ResponseData) => {
              this.isLoading = false;
              this.post = response.data[0];
              this.form.setValue({
                title: this.post.title,
                content: this.post.content,
                image: this.post.imagePath,
              });
            },
            (error) => {
              this.isLoading = false;
              this.form.setValue({
                title: null,
                content: null,
                image: null,
              });
            }
          );
        }
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event): void {
    const fileList = (event.target as HTMLInputElement).files;
    if (fileList) {
      const file = fileList[0];
      this.form.patchValue({
        image: file,
      });
      this.form.get('image')?.updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSavePost(): void {
    const post: Post = {
      title: this.form.value.title,
      content: this.form.value.content,
    };
    if (post.title === '' || post.content === '') {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(post, this.form.value.image);
    } else {
      if (this.postId) {
        post.id = this.postId;
        this.postsService.updatePost(post, this.form.value.image);
      }
    }
    this.form.reset();
  }
}
