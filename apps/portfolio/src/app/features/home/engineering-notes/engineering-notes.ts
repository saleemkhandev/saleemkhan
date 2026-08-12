import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  BLOG_INDEX_PATH,
  FEATURED_ARTICLES,
  blogArticlePath,
  formatFeaturedArticleDate,
} from '../../../core/constants/featured-articles';

@Component({
  selector: 'app-engineering-notes',
  templateUrl: './engineering-notes.html',
  styleUrl: './engineering-notes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngineeringNotes {
  protected readonly articles = FEATURED_ARTICLES;
  protected readonly blogIndexPath = BLOG_INDEX_PATH;
  protected readonly articlePath = blogArticlePath;
  protected readonly formatDate = formatFeaturedArticleDate;
}
