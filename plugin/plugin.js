"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
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
        let URL = url_1.default.parse(((_a = image.options.source) === null || _a === void 0 ? void 0 : _a.toString()) || '');
        const parts = ((_b = URL.path) === null || _b === void 0 ? void 0 : _b.split('/')) || [];
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
    responsivePicture(image, options = defaults) {
        let Image = this.imageFromSource(image);
        const sizeArray = options.srcs.split(',');
        const classList = options.classList;
        const sizes = options.sizes;
        const lastSize = sizeArray[sizeArray.length - 1];
        let baseUrl = '';
        switch (true) {
            case Boolean(options.aspectRatio) === true:
                switch (true) {
                    case options.aspectRatio === '1/1':
                        if (this.original.w) {
                            Image = Image.height(this.original.w);
                        }
                        break;
                }
            case Boolean(options.crop) === true:
                //@ts-ignore
                Image = Image.crop(options.crop);
                break;
            default:
                break;
        }
        baseUrl = Image.fit(options.fit).url();
        const srcSetContent = sizeArray
            .map((size) => {
            let url;
            let _image = this.imageFromSource(image);
            switch (true) {
                case Boolean(options.aspectRatio) === true:
                    switch (true) {
                        case options.aspectRatio === '1/1':
                            if (this.original.w) {
                                _image = _image.height(this.original.w);
                            }
                            break;
                        default:
                            break;
                    }
                case Boolean(options.crop) === true:
                    _image = _image
                        //@ts-ignore
                        .crop(options.crop);
                default:
                    _image = _image.width(parseInt(size));
            }
            url = _image.fit(options.fit).auto('format').url();
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
exports.default = {
    initArguments: {},
    configFunction: async (eleventyConfig, options) => {
        const R = new ResponsiveImage(options);
        eleventyConfig.addShortcode('responsiveImage', (image, options = defaults) => {
            return R.responsivePicture(image, { ...defaults, ...options });
        });
    },
};
