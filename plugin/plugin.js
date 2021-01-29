"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imageUrl = require('@sanity/image-url');
class ResponsiveImage extends Function {
    constructor(options) {
        super();
        this.options = options;
        return new Proxy(this, {
            apply: (target, thisArg, args) => {
                const image = args[0];
                const srcs = args[1] || '320,420,640,900,1980';
                const sizes = args[2] || '100vw';
                const classList = args[3] || '';
                return this.responsivePicture(image, srcs, sizes, classList);
            },
        });
    }
    urlFor(source) {
        return imageUrl(this.options.client).image(source);
    }
    responsivePicture(image, srcs = '320,640,900,1980', sizes = '100vw', classList = '') {
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
exports.default = {
    initArguments: {},
    configFunction: async (eleventyConfig, options) => {
        const R = new ResponsiveImage(options);
        eleventyConfig.addShortcode('responsiveImage', R);
    },
};
