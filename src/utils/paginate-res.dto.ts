export class PaginationResponse<T> {
  private page: number;
  private pageLimit: number;
  private totalCount: number;
  private data: T[];

  constructor({
    page,
    pageLimit = 10,
    totalCount,
    data,
  }: {
    page: number;
    pageLimit?;
    totalCount: number;
    data: T[];
  }) {
    this.page = page;
    this.pageLimit = pageLimit;
    this.totalCount = totalCount;
    this.data = data;
  }

  toResponse() {
    return {
      _metadata: {
        page: this.page,
        pageLimit: this.pageLimit,
        totalCount: this.totalCount,
        pageCount: Math.ceil(this.totalCount / this.pageLimit),
      },
      records: this.data,
    };
  }
}
