Webflow Product Grid (WIP)
==========================

Render products from Shopify as a product grid in Webflow.

1. [Custom code](#custom-code)
    - [CDN URLs](#cdn-urls)
    - [Events](#events)
    - [Ready state attributes](#ready-state-attributes)
2. [Designer](#designer)
3. [Examples](#examples)
    - [Paginating a product grid](#paginating-a-product-grid)
    - [Paginating a product slider](#paginating-a-product-slider)
4. [To do](#to-do)


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

The `init` method returns a promise which is resolved with the current page of
elements when all the data and all product images have been loaded. The `next`
method behaves the same way (in fact, `init` calls `next`), and can be used to
load the next page of results. It accepts an options object with the following
properties:

* `append` – boolean; default true; whether to append or replace contents
* `render` – boolean; default true; whether to render automatically to the DOM

For example, you may wish to set `render` to false and manually add each element
to a slider.


### CDN URLs

It is recommended that you append the commit hash to the CDN URLs above to lock
the assets and prevent future changes breaking your website, for example:

    https://cdn.jsdelivr.net/gh/lucidnz/webflow-product-grid@d4246e2b395c0b104bc69be5786f7261db24c934/dist/productGrid.css
    https://cdn.jsdelivr.net/gh/lucidnz/webflow-product-grid@d4246e2b395c0b104bc69be5786f7261db24c934/dist/productGrid.js


### Events

In addition to the promise returned from `init/next`, two events are dispatched
from the grid element.

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


Examples
--------

### Paginating a product grid

Load a new page when a load more button is clicked.

    function initGrid(element) {
      const productGrid = new ProductGrid(element);

      productGrid.init();

      const loadMoreButton = element.nextSibling;
      const loadingState = () => {
        loadMoreButton.disabled = true;
        loadMoreButton.textContent = 'Loading products';
      };
      const readyState = () => {
        if (productGrid.hasNextPage) {
          loadMoreButton.disabled = false;
          loadMoreButton.textContent = 'Load more';
        } else {
          loadMoreButton.textContent = 'No more products';
        }
      };
      loadingState();
      loadMoreButton.addEventListener('click', () => {
        loadingState();
        productGrid.next({});
      });
      productGrid.on('ProductGridLoadImages', () => {
        readyState();
      });
    }


### Paginating a product slider

Load a new page when the slider reaches the last slide. This example makes use
of [Glider.js][4], but the same principle should apply to other sliders.

    async function initSlider(element) {
      const productGrid = new ProductGrid(element);

      await productGrid.init();

      const glider = new Glider(element, {
        slidesToScroll: 1,
        slidesToShow: 5,
      });
      const isLastSlide = slide =>
        slide + 1 === glider.slides.length;
      element.addEventListener('glider-slide-visible', async ({detail: {slide}}) => {
        if (isLastSlide(slide)) {
          const items = await productGrid.next({render: false});

          items.forEach(glider.addItem);
        }
      });
    }

[4]: https://nickpiscitelli.github.io/Glider.js/


To do
-----

* Compile with Babel (and bundle ky dependency)
* Customisation (currently built for a specific store)
* Optional loading state CSS in dist
* Properly document all methods and properties
* Retain existing attributes like `class` on replaced `<img>`
