// favorites.js
import { ls } from './helpers.js';
const KEY = 'favorites';

export function getFavorites(){ return ls.get(KEY, []); }
export function setFavorites(arr){ ls.set(KEY, arr); }
export function isFavorite(url){ return getFavorites().some(x=>x.url===url); }
export function removeFavorite(url){ setFavorites(getFavorites().filter(x=>x.url!==url)); }
export function addFavorite(item){
  const cur = getFavorites();
  if (!cur.some(x=>x.url===item.url)) setFavorites([...cur, item]);
}
export function toggleFavorite(item){
  isFavorite(item.url) ? removeFavorite(item.url) : addFavorite(item);
}
