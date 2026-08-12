import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleRepository } from '../../../core/content/article-repository';
import { formatArticleDate } from '../../../core/content/format-article-date';
import { BlogSeo } from '../../../core/seo/blog-seo';

@Component({
  selector: 'app-article-list-page',
  imports: [RouterLink],
  templateUrl: './article-list-page.html',
  styleUrl: './article-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListPage implements OnInit {
  private readonly articles = inject(ArticleRepository);
  private readonly seo = inject(BlogSeo);

  protected readonly publishedArticles = this.articles.getPublished();
  protected readonly formatDate = formatArticleDate;

  ngOnInit(): void {
    this.seo.applyListPage();
  }
}
