export const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;
export function imageType(bytes: Uint8Array) {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if ([137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)) return 'image/png';
  const text = new TextDecoder().decode(bytes.slice(0,12));
  if (text.startsWith('RIFF') && text.slice(8)==='WEBP') return 'image/webp';
  return null;
}
export function validThumbnail(bytes: Uint8Array) {
  return bytes.length > 0 && bytes.length <= MAX_THUMBNAIL_BYTES && imageType(bytes) !== null;
}
export function homepageMediaType(bytes: Uint8Array) {
  const image = imageType(bytes);
  if (image) return image;
  if (new TextDecoder().decode(bytes.slice(4,8)) === 'ftyp') return 'video/mp4';
  if ([26,69,223,163].every((n,i)=>bytes[i]===n)) return 'video/webm';
  return null;
}