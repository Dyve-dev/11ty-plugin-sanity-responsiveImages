/**
 * Eleventy shortcode leveraging Sanity.io images CDN to return a responsive
 * image with srcset
 */
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import urlBuilder from '@sanity/image-url/lib/types';
import { shortCodeConfig, Options } from './types';
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';
import url from 'url';
const imageUrl: typeof urlBuilder = require('@sanity/image-url');

const defaults: Options = {
  srcs: '320,640,900,1980',
  sizes: '100vw',
  classList: '',
  fit: 'crop',
};
class ResponsiveImage {
  private ImageBuilder: ImageUrlBuilder;
  private original = {
    uid: '',
    w: 0,
    h: 0,
    ext: '',
  };

  constructor(options: shortCodeConfig) {
    this.ImageBuilder = imageUrl(options.client);
  }

  private originalSize(image: ImageUrlBuilder) {
    const regex = /(?<uid>[0-9a-fA-F]+)\-(?<w>[0-9]+)x(?<h>[0-9]+)\.(?<ext>[\w]{3,4})/;
    let URL = url.parse(image.options.source?.toString() || '');
    const parts = URL.path?.split('/') || [];
    const imageIdentifier = parts[parts?.length - 1];
    const groups = imageIdentifier.match(regex)?.groups;
    if (groups) {
      this.original.uid = groups['uid'];
      this.original.w = parseInt(groups['w']);
      this.original.h = parseInt(groups['h']);
      this.original.ext = groups['ext'];
    }

    return image;
  }
  private imageFromSource(source: SanityImageSource) {
    return this.originalSize(this.ImageBuilder.image(source));
  }

  private aspectRatio(image: ImageUrlBuilder, ratio: Options['aspectRatio']) {
    switch (true) {
      case ratio === '1/1':
        if (image.options.width) {
          return image.height(image.options.width);
        } else if (this.original.w) {
          return image.height(this.original.w);
        }
      default:
        return image;
    }
  }

  private build(image: ImageUrlBuilder, options: Options) {
    let _image: ImageUrlBuilder = image;
    if (options.aspectRatio && _image.options.width) {
      _image = this.aspectRatio(_image, options.aspectRatio);
    }
    if (options.crop) {
      _image = _image.crop(options.crop);
    }
    if (options.fit) {
      _image = _image.fit(options.fit);
    }
    return _image;
  }

  responsivePicture(image: SanityImageSource, options: Options = defaults) {
    let Image: ImageUrlBuilder = this.imageFromSource(image);
    const sizeArray = options.srcs.split(',');
    const classList = options.classList;
    const sizes = options.sizes;
    const lastSize = sizeArray[sizeArray.length - 1];
    let baseUrl: string | null = '';
    Image = this.build(Image, options);

    baseUrl = Image.url();
    const srcSetContent = sizeArray
      .map((size) => {
        let url: string | null;
        let _image = this.imageFromSource(image);
        _image = _image.width(parseInt(size));
        _image = this.build(_image, options);
        url = _image.auto('format').url();
        return `${url} ${size}w`;
      })
      .join(',');

    return `<img 
                    src="${baseUrl}"
                    ${classList ? 'class="' + classList + '"' : ''}
                    srcset="${srcSetContent}"
                    sizes="${sizes}"
                    width="${lastSize.trim()}">`;
  }
}

export default {
  initArguments: {},
  configFunction: async (eleventyConfig: any, options: shortCodeConfig) => {
    const R = new ResponsiveImage(options);
    eleventyConfig.addShortcode(
      'responsiveImage',
      (image: SanityImageSource, options: Options = defaults) => {
        return R.responsivePicture(image, { ...defaults, ...options });
      }
    );
  },
};
