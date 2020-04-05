Webflow Product Grid (WIP)
==========================

Render products from Shopify as a product grid in Webflow.

1. [Custom code](#custom-code)
    - [CDN URLs](#cdn-urls)
    - [Events](#events)
    - [Ready state attributes](#ready-state-attributes)
2. [Designer](#designer)
3. [To do](#to-do)


Custom code
-----------

Add to your **Head Code** section:

    <link href="https://cdn.jsdelivr.net/gh/lucidnz/webflow-product-grid/dist/productGrid.css" rel="stylesheet" />

Add to your **Footer Code** section:

    <script src="https://cdn.jsdelivr.net/npm/ky@0.19.0/umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/lucidnz/webflow-product-grid/dist/productGrid.js"></script>
    <script>
      window.storefrontConfig = {
        myshopifyDomain: '...',
        storefrontAccessToken: '...',
      };
      for (const gridElement of document.querySelectorAll('[data-product-grid]')) {
        new ProductGrid(gridElement).init();
      }
    </script>

The `storefrontConfig` object can also be passed as a second argument to the
constructor for `ProductGrid`.

The `init` method returns a promise which is resolved when all the data and all
product images have been loaded.


### CDN URLs

It is recommended that you append the commit hash to the CDN URLs above to lock
the assets and prevent future changes breaking your website, for example:

    https://cdn.jsdelivr.net/gh/lucidnz/webflow-product-grid@d4246e2b395c0b104bc69be5786f7261db24c934/dist/productGrid.css
    https://cdn.jsdelivr.net/gh/lucidnz/webflow-product-grid@d4246e2b395c0b104bc69be5786f7261db24c934/dist/productGrid.js


### Events

In addition to the promise returned from `init`, two events are dispatched from
the grid element.

* `ProductGridLoad` – product content has loaded
* `ProductGridLoadImages` – product content and images have loaded

As a convenience, the `on` method is provided for `ProductGrid` objects, and
forwards to the underlying grid element:

    productGrid.on('ProductGridLoad', listener);


### Ready state attributes

Both the grid element, and each of its children have a `data-state` attribute
which has a value of either `loading` or `ready` depending on whether the
image/s have loaded. These attributes can be used to aid in styling a loading
state.


Designer
--------

Create a grid element with the following data attributes:

* `data-product-grid` – **required;** boolean; identifies a product grid
* `data-per-page` – optional; default 20
* `data-query` – **required;** see the [GraphQL API][1] and [Shopify API search syntax][2]
* `data-sort-key` – optional; default ID, see the [GraphQL API][3] for options

[1]: https://shopify.dev/docs/storefront-api/reference/queryroot#products-2020-01
[2]: https://shopify.dev/concepts/about-apis/search-syntax
[3]: https://shopify.dev/docs/storefront-api/reference/object/productsortkeys

The first child of the grid element is a template. All children will be replaced
when the live product data is pulled from the Storefront API. Under the template
there should be elements with any of these data attributes:

* `data-bind="product-external-link"` – on an `<a>` element
* `data-bind="product-image"` – on an `<img>` element
* `data-bind="product-title"`
* `data-bind="product-price"`
* `data-bind="product-compare-at-price"`

Each element is optional, and will only be used if present in the template.


To do
-----

* Compile with Babel (and bundle ky dependency)
* Customisation (currently built for a specific store)
* Optional loading state CSS in dist
* Pagination via `loadMore` method with options `{append: true|false}` and
  returning a promise like `init`
