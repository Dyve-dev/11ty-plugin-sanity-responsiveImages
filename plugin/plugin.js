"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const imageUrl = require('@sanity/image-url');
const SANITY_CDN_URL = 'https://cdn.sanity.io/';
const defaults = {
    srcs: '320,640,900',
    sizes: '100vw',
    classList: '',
    fit: 'crop',
    lazy: true,
};
class ResponsiveImage {
    constructor(options) {
        this.aspectRatio = 1;
        this.ImageBuilder = imageUrl(options.client);
    }
    /**
     * When the source is a string we need to make sure it is supported by
     * sanity's `ImageUrl`
     * @param source
     */
    validateSource(source) {
        var _a;
        if (typeof source === 'string') {
            let _url;
            try {
                _url = new url_1.URL(source);
            }
            catch (err) {
                _url = new url_1.URL(source, (((_a = this.ImageBuilder.options) === null || _a === void 0 ? void 0 : _a.baseUrl) || SANITY_CDN_URL) +
                    `/images/${this.ImageBuilder.options.projectId}/${this.ImageBuilder.options.dataset}/`);
            }
            return _url.toString();
        }
        return source;
    }
    imageFromSource(source) {
        return this.ImageBuilder.image(this.validateSource(source));
    }
    build(image, options) {
        let _image = image;
        if (options.crop) {
            _image = _image.crop(options.crop);
        }
        if (options.fit) {
            _image = _image.fit(options.fit);
        }
        return _image;
    }
    responsivePicture(tag, image, options = defaults) {
        const _options = { ...defaults, ...options };
        let assetUrl = '';
        let Image = this.imageFromSource(image);
        Image = this.build(Image, _options);
        assetUrl = Image.url();
        const sizeArray = _options.srcs.split(',');
        const classList = _options.classList;
        const sizes = _options.sizes;
        const style = _options.style;
        const midSize = sizeArray[Math.floor(sizeArray.length / 2)];
        const width = _options.width ? _options.width : midSize.trim();
        const height = _options.height ? _options.height : width;
        if (_options.width && _options.height) {
            this.aspectRatio = _options.width / _options.height;
        }
        const alt = _options.alt ? _options.alt : '';
        const media = _options.media ? _options.media : '';
        const type = _options.type ? _options.type : '';
        const lazy = _options.lazy;
        const srcSetContent = sizeArray
            .map((size) => {
            let url;
            let _image = this.imageFromSource(image);
            _image = _image.width(parseInt(size));
            _image = _image.height(Math.floor(parseInt(size) / this.aspectRatio));
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
exports.default = {
    initArguments: {},
    configFunction: async (eleventyConfig, options) => {
        const R = new ResponsiveImage(options);
        eleventyConfig.addShortcode('sanityImage', (image, options = defaults) => {
            return R.responsivePicture('img', image, { ...defaults, ...options });
        });
        eleventyConfig.addShortcode('sanitySource', (image, options = defaults) => {
            return R.responsivePicture('source', image, { ...defaults, ...options });
        });
    },
};
