
using BoardGames.Api.Services;

namespace boardGameDenAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            var cfgSection = builder.Configuration.GetSection("BoardGameUrls");
            var allowed = cfgSection.GetSection("AllowedOrigins").Get<string[]>();

            builder.Services.AddCors(opts =>
            {
                opts.AddPolicy("app", policy =>
                    policy.WithOrigins(allowed)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                );
            });

            builder.Services.AddControllers();
            builder.Services.AddMemoryCache();
            builder.Services.AddSingleton<BoardGamesService>();

            var app = builder.Build();

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.UseCors("app"); 

            app.Run();
        }
    }
}
