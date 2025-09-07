namespace boardGameDenAPI.Model
{
    public class PagedResult
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
        public List<Product> Items { get; set; } = new();
    }
}
