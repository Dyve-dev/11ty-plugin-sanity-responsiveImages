# 11ty-plugin-sanity-responsiveImages

@11ty shortcode outpus reponsive &lt;img> tag with srcset attribute using the sanity.io CDN

## Install

```
npm install @dyve/11ty-plugin-sanity-responsiveimage
```

### Add the plugin to Eleventy

**.eleventy.js**

```js
// import the plugin
const responsiveImage = require('@dyve/11ty-plugin-sanity-responsiveimage');

module.exports = function (eleventyConfig) {
  // add the plugin to eleventy
  eleventyConfig.addPlugin(responsiveImage, { client: sanityClient });
};
```

## Configuration

This plugin requires an instance of `@sanity/client`.

For more information check the [official documentation](https://www.npmjs.com/package/@sanity/client)

### Plugin options

```js
{
  client: sanityClient; // your instance of @sanity/client
}
```

## How to use

In your 11ty templates use the shortCode `responsiveImage`.

With a SanityImageObject:

```
  {% responsiveImage metadata.hero.image, {srcs:"420,600", alt: metadata.hero.image_desc} %}
```

With a sanity CDN url:

```
{% responsiveImage "https://cdn.sanity.io/images/<sanity-project-id>/production/c763e4d43ffef64035de83214a2163ee123e75db-720x720.jpg", {srcs:"420,600,900,1024", aspectRatio: "1/1", alt:"some alternative text"} %}
```

### shortCode options

-**srcs**: `string`

```js
{
    // string: comma separated list of image width. Note: the last width will be used as `width` attribute on the <img> tag
    srcs: "420,600",
    // currently only "1/1" is implemented. Will respect 1/1 aspect ratio if image has different width and height. Height will be forced to width
    aspectRatio: "1/1",
    // defines the `alt` attribute on the <img> tag
    alt: "alternative text"
    // string: css class to add
    classList: "cls1 cls2"
    // element style
    style: "width: 50px;"
}
```

## Example

```
{% responsiveImage "https://cdn.sanity.io/images/XXX/production/f3533b119b9fe433461316680948eb8fbd53e848-960x640.jpg", {srcs:"420,600,900,1024", aspectRatio: "1/1", alt:"my description"} %}
```

generates

```html
<img
  src="https://cdn.sanity.io/images/XXX/production/f3533b119b9fe433461316680948eb8fbd53e848-960x640.jpg?fit=crop"
  srcset="
    https://cdn.sanity.io/images/XXX/production/f3533b119b9fe433461316680948eb8fbd53e848-960x640.jpg?rect=160,0,640,640&w=420&h=420&fit=crop&auto=format    420w,
    https://cdn.sanity.io/images/XXX/production/f3533b119b9fe433461316680948eb8fbd53e848-960x640.jpg?rect=160,0,640,640&w=600&h=600&fit=crop&auto=format    600w,
    https://cdn.sanity.io/images/XXX/production/f3533b119b9fe433461316680948eb8fbd53e848-960x640.jpg?rect=160,0,640,640&w=900&h=900&fit=crop&auto=format    900w,
    https://cdn.sanity.io/images/XXX/production/f3533b119b9fe433461316680948eb8fbd53e848-960x640.jpg?rect=160,0,640,640&w=1024&h=1024&fit=crop&auto=format 1024w
  "
  sizes="100vw"
  width="1024"
  alt="my description"
/>
```
