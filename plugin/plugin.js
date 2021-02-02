"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const imageUrl = require('@sanity/image-url');
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
        var _a, _b, _c;
        const regex = /(?<uid>[0-9a-fA-F]+)\-(?<w>[0-9]+)x(?<h>[0-9]+)\.(?<ext>[\w]{3,4})/;
        let _url = new url_1.URL(((_a = image.options.source) === null || _a === void 0 ? void 0 : _a.toString()) || '');
        const parts = ((_b = _url.pathname) === null || _b === void 0 ? void 0 : _b.split('/')) || [];
        const imageIdentifier = parts[(parts === null || parts === void 0 ? void 0 : parts.length) - 1];
        const groups = (_c = imageIdentifier.match(regex)) === null || _c === void 0 ? void 0 : _c.groups;
        if (groups) {
            this.original.uid = groups['uid'];
            this.original.w = parseInt(groups['w']);
            this.original.h = parseInt(groups['h']);
            this.original.ext = groups['ext'];
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
