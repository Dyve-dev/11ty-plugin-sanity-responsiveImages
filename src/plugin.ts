/**
 * Eleventy shortcode leveraging Sanity.io images CDN to return a responsive
 * image with srcset
 */
import { SanityImageObject } from '@sanity/image-url/lib/types/types';
import { shortCodeConfig } from './types';
const imageUrl = require('@sanity/image-url');

class ResponsiveImage extends Function {
  private options: shortCodeConfig;

  constructor(options: shortCodeConfig) {
    super();
    this.options = options;
    return new Proxy(this, {
      apply: (target, thisArg, args: Array<any>) => {
        const image: SanityImageObject = args[0];
        const srcs: string = args[1] || '320,420,640,900,1980';
        const sizes: string = args[2] || '100vw';
        const classList: string = args[3] || '';
        return this.responsivePicture(image, srcs, sizes, classList);
      },
    });
  }

  private urlFor(source: SanityImageObject) {
    return imageUrl(this.options.client).image(source);
  }

  responsivePicture(
    image: SanityImageObject,
    srcs: string = '320,640,900,1980',
    sizes: string = '100vw',
    classList: string = ''
  ) {
    const sizeArray = srcs.split(',');
    const firstSize = sizeArray[0];
    const lastSize = sizeArray[sizeArray.length - 1];
    const srcSetContent = sizeArray
      .map((size) => {
        const url = this.urlFor(image).width(parseInt(size)).auto('format').url();

        return `${url} ${size}w`;
      })
      .join(',');

    return `<img 
                    src="${this.urlFor(image).url()}"
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
    eleventyConfig.addShortcode('responsiveImage', R);
  },
};
