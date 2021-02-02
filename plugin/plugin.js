"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const imageUrl = require('@sanity/image-url');
//= {_type: string} & SanityImageObject;
const defaults = {
    srcs: '320,640,900,1980',
    sizes: '100vw',
    classList: '',
    fit: 'crop',
};
class ResponsiveImage {
    constructor(options) {
        this.original = {
            uid: '',
            w: 0,
            h: 0,
            ext: '',
        };
        this.ImageBuilder = imageUrl(options.client);
    }
    originalSize(image) {
        var _a, _b;
        /**
         * A lot of assumptions in this code. Will probably break at some point
         */
        let regex = /(?<uid>[0-9a-fA-F]+)\-(?<w>[0-9]+)x(?<h>[0-9]+)\.(?<ext>[\w]{3,4})/;
        let imageIdentifier = '';
        try {
            if (typeof image.options.source === 'string') {
                let _url = new url_1.URL(image.options.source);
                const parts = ((_a = _url.pathname) === null || _a === void 0 ? void 0 : _a.split('/')) || [];
                imageIdentifier = parts[(parts === null || parts === void 0 ? void 0 : parts.length) - 1];
            }
            else if (typeof image.options.source === 'object') {
                const source = image.options.source;
                if (source._type === 'image') {
                    if (source.asset._type === 'reference') {
                        imageIdentifier = source.asset._ref;
                        regex = /(?<prefix>[\w]+)\-(?<uid>[0-9a-fA-F]+)\-(?<w>[0-9]+)x(?<h>[0-9]+)\-(?<ext>[\w]{3,4})/;
                    }
                }
            }
            const groups = (_b = imageIdentifier.match(regex)) === null || _b === void 0 ? void 0 : _b.groups;
            if (groups) {
                this.original.uid = groups['uid'];
                this.original.w = parseInt(groups['w']);
                this.original.h = parseInt(groups['h']);
                this.original.ext = groups['ext'];
            }
        }
        catch (err) {
            console.error(err);
            console.error('This had to happen at some point!');
        }
        return image;
    }
    imageFromSource(source) {
        return this.originalSize(this.ImageBuilder.image(source));
    }
    aspectRatio(image, ratio) {
        switch (true) {
            case ratio === '1/1':
                if (image.options.width) {
                    return image.height(image.options.width);
                }
                else if (this.original.w) {
                    return image.height(this.original.w);
                }
            default:
                return image;
        }
    }
    build(image, options) {
        let _image = image;
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
    responsivePicture(image, options = defaults) {
        let Image = this.imageFromSource(image);
        const sizeArray = options.srcs.split(',');
        const classList = options.classList;
        const sizes = options.sizes;
        const lastSize = sizeArray[sizeArray.length - 1];
        const alt = options.alt ? options.alt : '';
        let baseUrl = '';
        Image = this.build(Image, options);
        baseUrl = Image.url();
        const srcSetContent = sizeArray
            .map((size) => {
            let url;
            let _image = this.imageFromSource(image);
            _image = _image.width(parseInt(size));
            _image = this.build(_image, options);
            url = _image.auto('format').url();
            return `${url} ${size}w`;
        })
            .join(',');
        let html = `<img 
      src="${baseUrl}"
      ${classList ? 'class="' + classList + '"' : ''}
      srcset="${srcSetContent}"
      sizes="${sizes}"
      width="${lastSize.trim()}"`;
        if (alt && alt.length > 0) {
            html += `alt="${alt}">`;
        }
        else {
            html += '>';
        }
        return html;
    }
}
exports.default = {
    initArguments: {},
    configFunction: async (eleventyConfig, options) => {
        const R = new ResponsiveImage(options);
        eleventyConfig.addShortcode('responsiveImage', (image, options = defaults) => {
            return R.responsivePicture(image, { ...defaults, ...options });
        });
    },
};
