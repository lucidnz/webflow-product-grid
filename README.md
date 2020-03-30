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


To do
-----

* Compile with Babel (and bundle ky dependency)
* Customisation (currently built for a specific store)
* Pagination
