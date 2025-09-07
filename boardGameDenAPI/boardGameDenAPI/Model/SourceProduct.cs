namespace boardGameDenAPI.Model
{
    public class SourceProduct
    {
        public int ID { get; set; }
        public string Name { get; set; } = "";
        public int MinPlayers { get; set; }
        public int MaxPlayers { get; set; }
        public int MinTime { get; set; }
        public int MaxTime { get; set; }
        public decimal BGGRating { get; set; }
        public string URL { get; set; } = "";
        public string Thumbnail { get; set; } = "";
        public string Thumbnail2 { get; set; } = "";
        public string MainImage { get; set; } = "";
        public decimal SalePrice { get; set; }
    }
}
