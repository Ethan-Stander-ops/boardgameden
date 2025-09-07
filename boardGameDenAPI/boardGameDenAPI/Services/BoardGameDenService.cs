using System.Text.Json;
using boardGameDenAPI.Model;            
using Microsoft.Extensions.Caching.Memory;

namespace BoardGames.Api.Services;

public class BoardGamesService
{
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _config;

    private const string CacheKey = "boardgames_cache_v1";

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public BoardGamesService(IMemoryCache cache, IConfiguration config)
    {
        _cache = cache;
        _config = config;
    }

    public async Task<PagedResult> GetPagedAsync(string? search, int page, int pageSize)
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 200);

        var all = await LoadAllAsync();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            all = all.Where(p => (p.Name ?? string.Empty).ToLowerInvariant().Contains(term)).ToList();
        }

        var total = all.Count;

        var maxPage = Math.Max(1, (int)Math.Ceiling(total / (double)pageSize));
        if (page > maxPage) page = maxPage;

        var skip = (page - 1) * pageSize;
        var items = (total == 0) ? new List<Product>() : all.Skip(skip).Take(pageSize).ToList();

        return new PagedResult
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = items
        };
    }

    private async Task<List<Product>> LoadAllAsync()
    {
        if (_cache.TryGetValue(CacheKey, out List<Product>? cached) && cached != null)
            return cached;

        try
        {
            const string BASE = "https://myboardgamelibrary.com";

            using var http = new HttpClient();
            var resp = await http.GetAsync("https://myboardgamelibrary.com/boardgames.json");
            resp.EnsureSuccessStatusCode();

            var json = await resp.Content.ReadAsStringAsync();
            var payload = JsonSerializer.Deserialize<SourcePayLoad>(json, JsonOpts) ?? new SourcePayLoad();

            static string Abs(string? u)
            {
                if (string.IsNullOrWhiteSpace(u)) return "";
                var b = BASE.TrimEnd('/');
                var p = u.Trim();
                if (p.StartsWith("http", StringComparison.OrdinalIgnoreCase)) return p;
                return $"{b}/{p.TrimStart('/')}";
            }

            var list = new List<Product>(payload.Sheet1.Count);
            foreach (var s in payload.Sheet1)
            {
                var our = Math.Round(s.SalePrice * 1.10m, 2, MidpointRounding.AwayFromZero);
                list.Add(new Product
                {
                    ID = s.ID,
                    Name = s.Name ?? string.Empty,
                    MinPlayers = s.MinPlayers,
                    MaxPlayers = s.MaxPlayers,
                    MinTime = s.MinTime,
                    MaxTime = s.MaxTime,
                    BGGRating = s.BGGRating,
                    URL = Abs(s.URL),
                    Thumbnail = Abs(s.Thumbnail),
                    Thumbnail2 = Abs(s.Thumbnail2),
                    MainImage = Abs(s.MainImage),
                    SalePrice = s.SalePrice,
                    OurPrice = our
                });
            }

            _cache.Set(CacheKey, list, TimeSpan.FromMinutes(5));
            return list;
        }
        catch
        {
            return new List<Product>();
        }
    }
}
