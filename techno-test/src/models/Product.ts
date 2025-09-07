export interface Product {
  id: number;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  minTime: number;
  maxTime: number;
  bggRating: number;
  url: string;
  thumbnail: string;
  thumbnail2: string;
  mainImage: string;
  salePrice: number;
  ourPrice?: number;
}
