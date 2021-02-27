/**
 * Eleventy shortcode leveraging Sanity.io images CDN to return a responsive
 * image with srcset
 * Notes:
 * - Most browsers will infer the aspect ratio based on the width and height attributes
 */
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import urlBuilder from '@sanity/image-url/lib/types';
import { shortCodeConfig, Options } from './types';
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';
import { URL } from 'url';
const imageUrl: typeof urlBuilder = require('@sanity/image-url');

const SANITY_CDN_URL = 'https://cdn.sanity.io/';

const defaults: Options = {
  srcs: '320,640,900',
  sizes: '100vw',
  classList: '',
  fit: 'crop',
  lazy: true,
};
class ResponsiveImage {
  private ImageBuilder: ImageUrlBuilder;

  constructor(options: shortCodeConfig) {
    this.ImageBuilder = imageUrl(options.client);
  }

  /**
   * When the source is a string we need to make sure it is supported by
   * sanity's `ImageUrl`
   * @param source
   */
  private validateSource(source: SanityImageSource) {
    if (typeof source === 'string') {
      let _url;
      try {
        _url = new URL(source);
      } catch (err) {
        _url = new URL(
          source,
          (this.ImageBuilder.options?.baseUrl || SANITY_CDN_URL) +
            `/images/${this.ImageBuilder.options.projectId}/${this.ImageBuilder.options.dataset}/`
        );
      }
      return _url.toString();
    }
    return source;
  }
  private imageFromSource(source: SanityImageSource) {
    return this.ImageBuilder.image(this.validateSource(source));
  }

  private build(image: ImageUrlBuilder, options: Options) {
    let _image: ImageUrlBuilder = image;

    if (options.crop) {
      _image = _image.crop(options.crop);
    }
    if (options.fit) {
      _image = _image.fit(options.fit);
    }
    return _image;
  }

  responsivePicture(tag: string, image: SanityImageSource, options: Options = defaults) {
    const _options = { ...defaults, ...options };
    let assetUrl: string | null = '';
    let Image: ImageUrlBuilder = this.imageFromSource(image);
    Image = this.build(Image, _options);
    assetUrl = Image.url();
    const sizeArray = _options.srcs.split(',');
    const classList = _options.classList;
    const sizes = _options.sizes;
    const style = _options.style;
    const midSize = sizeArray[Math.floor(sizeArray.length / 2)];
    const width = _options.width ? _options.width : midSize.trim();
    const height = _options.height ? _options.height : width;
    const alt = _options.alt ? _options.alt : '';
    const media = _options.media ? _options.media : '';
    const type = _options.type ? _options.type : '';
    const lazy = _options.lazy;

    const srcSetContent = sizeArray
      .map((size) => {
        let url: string | null;
        let _image = this.imageFromSource(image);
        _image = _image.width(parseInt(size));
        _image = this.build(_image, _options);
        url = _image.auto('format').url();
        return `${url} ${size}w`;
      })
      .join(',');

    let html = `<${tag} 
      src="${assetUrl}"
      ${classList ? 'class="' + classList + '"' : ''}
      srcset="${srcSetContent}"
      sizes="${sizes}"
      width="${width}"
      height="${height}"
      ${media ? 'media="' + media + '"' : ''}
      ${type ? 'type="' + type + '"' : ''}
      ${style ? 'style="' + style + '"' : ''}
      ${alt && alt.length > 0 ? 'alt="' + alt + '"' : ''}
      ${lazy ? 'loading="lazy"' : ''}
      >`;

    return html;
  }
}

export default {
  initArguments: {},
  configFunction: async (eleventyConfig: any, options: shortCodeConfig) => {
    const R = new ResponsiveImage(options);
    eleventyConfig.addShortcode(
      'sanityImage',
      (image: SanityImageSource, options: Options = defaults) => {
        return R.responsivePicture('img', image, { ...defaults, ...options });
      }
    );
    eleventyConfig.addShortcode(
      'sanitySource',
      (image: SanityImageSource, options: Options = defaults) => {
        return R.responsivePicture('source', image, { ...defaults, ...options });
      }
    );
  },
};
