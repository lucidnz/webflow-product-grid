Webflow Product Grid (WIP)
==========================

Take a collection from Shopify and render a product grid in Webflow. Add to your
Head Code section in Webflow the following:

    <link href="https://cdn.jsdelivr.net/gh/lucidnz/webflow-product-grid/dist/productGrid.css" rel="stylesheet" />

And to the Footer Code section:

    <script src="https://cdn.jsdelivr.net/npm/ky@0.19.0/umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/lucidnz/webflow-product-grid/dist/productGrid.js"></script>
    <script>
      for (const gridElement of document.querySelectorAll('[data-collection-handle]')) {
        const productGrid = new ProductGrid(gridElement, {
          myshopifyDomain: '...',
          storefrontAccessToken: '...',
        });

        productGrid.init();
      }
    </script>

In Webflow Designer, create a grid element with the following data attributes:

* `data-collection-handle`
* `data-per-page` (optional; default 20)
* `data-sort-key` (optional; default ID, see the GraphQL API for options)

The first child of the grid element is a template. All children will be replaced
when the live product data is pulled from the Storefront API. Under the template
there should be elements with each of these data attributes:

* `data-bind="product-external-link"` (on an `<a>` element)
* `data-bind="product-image"` (on an `<img>` element)
* `data-bind="product-title"`
* `data-bind="product-price"`


To do
-----

* Compile with Babel (and bundle ky dependency)
* Customisation (currently built for a specific store)
* Pagination
