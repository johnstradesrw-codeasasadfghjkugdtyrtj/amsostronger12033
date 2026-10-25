import {describe,it,expect} from 'vitest';
import {MAX_THUMBNAIL_BYTES,validThumbnail,homepageMediaType} from '@/lib/media-rules';
describe('media upload rules',()=>{
  it('accepts a thumbnail at the 5 MB boundary',()=>{
    const bytes=new Uint8Array(5*1024*1024);bytes.set([255,216,255]);
    expect(MAX_THUMBNAIL_BYTES).toBe(5*1024*1024);
    expect(validThumbnail(bytes)).toBe(true);
  });
  it('rejects a thumbnail over 5 MB',()=>{
    const bytes=new Uint8Array(5*1024*1024+1);bytes.set([255,216,255]);expect(validThumbnail(bytes)).toBe(false);
  });
  it('rejects a renamed non-image',()=>expect(validThumbnail(new Uint8Array([77,90,0,0]))).toBe(false));
  it('recognizes MP4 homepage media',()=>expect(homepageMediaType(new Uint8Array([0,0,0,16,102,116,121,112]))).toBe('video/mp4'));
});