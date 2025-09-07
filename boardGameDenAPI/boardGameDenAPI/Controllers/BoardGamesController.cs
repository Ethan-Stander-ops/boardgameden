using boardGameDenAPI.Model;
using BoardGames.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace boardGameDenAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BoardGamesController : Controller
    {
        private readonly BoardGamesService _svc;

        public BoardGamesController(BoardGamesService svc)
        {
            _svc = svc;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult>> Get(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null)
        {
            var result = await _svc.GetPagedAsync(search, page, pageSize);
            return Ok(result);
        }
    }
}
