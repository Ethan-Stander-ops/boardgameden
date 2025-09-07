import { Component } from '@angular/core';
import { Product } from 'src/models/Product';
import { BoardAPIService } from 'src/services/BoardService/BoardAPIService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'techno-test';

  productList: Product[] = [];
  untouchedList: Product[] = []; 

  page = 1;
  pageSize = 20;
  total = 0;
  filterText = '';

  private window = 2;

  constructor(public boardApiService: BoardAPIService) {}

  ngOnInit(): void {
    this.page = 1;
    this.paginate(); 
  }

  get maxPage(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get pageItems(): Array<{ kind: 'page'; value: number } | { kind: 'ellipsis'; dir: 'left' | 'right' }> {
    const total = this.maxPage;
    const cur = this.page;
    const win = this.window;

    const items: Array<{ kind: 'page'; value: number } | { kind: 'ellipsis'; dir: 'left' | 'right' }> = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) items.push({ kind: 'page', value: i });
      return items;
    }

    const left = Math.max(2, cur - win);
    const right = Math.min(total - 1, cur + win);

    items.push({ kind: 'page', value: 1 });

    if (left > 2) items.push({ kind: 'ellipsis', dir: 'left' });

    for (let i = left; i <= right; i++) items.push({ kind: 'page', value: i });

    if (right < total - 1) items.push({ kind: 'ellipsis', dir: 'right' });

    items.push({ kind: 'page', value: total });
    return items;
  }

  private paginate(): void {
    this.boardApiService
      .getBoardGames(this.page, this.pageSize, this.filterText)
      .subscribe({
        next: (res) => {
          this.total = res.total;
          this.productList = res.items || [];
          const maxPage = Math.max(1, Math.ceil(this.total / this.pageSize));
          if (this.page > maxPage) {
            this.page = maxPage;
            this.boardApiService.getBoardGames(this.page, this.pageSize, this.filterText).subscribe(r2 => {
              this.total = r2.total;
              this.productList = r2.items || [];
            });
          }
          console.log(this.productList);
        },
        error: (err) => console.error('Error fetching board games:', err)
      });
  }

  nextPage(): void {
    if (this.page < this.maxPage) {
      this.page++;
      this.paginate();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.paginate();
    }
  }

  goToPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.maxPage) {
      this.page = pageNum;
      this.paginate();
    }
  }

  firstPage(): void {
    if (this.page !== 1) { this.page = 1; this.paginate(); }
  }

  lastPage(): void {
    if (this.page !== this.maxPage) { this.page = this.maxPage; this.paginate(); }
  }

  jumpLeft(): void {
    const step = this.window * 2 + 1;
    this.goToPage(Math.max(1, this.page - step));
  }

  jumpRight(): void {
    const step = this.window * 2 + 1;
    this.goToPage(Math.min(this.maxPage, this.page + step));
  }

  setFilter(text: string): void {
    this.filterText = text;
    this.page = 1;
    this.paginate();
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
    this.paginate();
  }

  clearFilter(): void {
    this.filterText = '';
    this.page = 1;
    this.paginate();
  }


selected: Product | null = null;
activeImageIndex = 0;

private imagesOf(p: Product): string[] {
  const arr = [p.mainImage, p.thumbnail, p.thumbnail2].filter(Boolean) as string[];
  return Array.from(new Set(arr));
}

openQuickView(p: Product): void {
  this.selected = p;
  this.activeImageIndex = 0;
  document.body.style.overflow = 'hidden';
}

closeQuickView(): void {
  this.selected = null;
  this.activeImageIndex = 0;
  document.body.style.overflow = '';
}

prevImage(): void {
  if (!this.selected) return;
  const imgs = this.imagesOf(this.selected);
  this.activeImageIndex = (this.activeImageIndex - 1 + imgs.length) % imgs.length;
}

nextImage(): void {
  if (!this.selected) return;
  const imgs = this.imagesOf(this.selected);
  this.activeImageIndex = (this.activeImageIndex + 1) % imgs.length;
}

goToImage(i: number): void {
  this.activeImageIndex = i;
}

}
