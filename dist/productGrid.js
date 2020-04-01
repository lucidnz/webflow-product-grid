class ProductGrid {
  constructor(gridElement, storefrontConfig = window.storefrontConfig) {
    this.elements = {
      grid: gridElement,
      template: gridElement.children[0],
    };
    this.formatMoney = new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format;
    this.perPage = parseInt(gridElement.dataset.perPage || 20);
    this.query = gridElement.dataset.query;
    // https://shopify.dev/docs/storefront-api/reference/object/productsortkeys
    this.sortKey = gridElement.dataset.sortKey || 'ID';
    this.storefront = ky.extend({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/graphql',
        'X-Shopify-Storefront-Access-Token': storefrontConfig.storefrontAccessToken,
      },
      prefixUrl: `https://${storefrontConfig.myshopifyDomain}/api/2020-01`,
    });
  }

  async init() {
    const {data} = await this.storefront.post('graphql', {
      body: `
        query {
          products(first: ${this.perPage}, query: "${this.query}", sortKey: ${this.sortKey}) {
            edges {
              node {
                onlineStoreUrl
                title
                variants(first: 1) {
                  edges {
                    node {
                      compareAtPriceV2 {
                        amount
                      }
                      image {
                        altText
                        transformedSrc(
                          maxHeight: 512,
                          maxWidth: 512,
                          scale: ${devicePixelRatio > 1 ? 2 : 1},
                        )
                      }
                      priceV2 {
                        amount
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
    }).json();

    this.elements.grid.innerHTML = '';

    for (const edge of data.products.edges) {
      const gridItem = this.cloneTemplate(edge.node);

      this.elements.grid.appendChild(gridItem);
    }

    // TODO: Loading state styles before ready.
    // TODO: Only set this when the new images have loaded if possible.
    this.elements.grid.dataset.ready = '';
  }

  cloneTemplate(data) {
    const gridItem = this.elements.template.cloneNode(true);
    const gridItemBindings = this.findBindingElements(gridItem);

    gridItemBindings.externalLink.href = data.onlineStoreUrl;
    gridItemBindings.image.alt = data.variants.edges[0].node.image.altText;
    // We set the src to '' first to prevent the original src from displaying
    // while loading the new src.
    gridItemBindings.image.src = '';
    gridItemBindings.image.src = data.variants.edges[0].node.image.transformedSrc;
    gridItemBindings.title.textContent = data.title;
    const compareAtPrice = data.variants.edges[0].node.compareAtPriceV2;
    const price = data.variants.edges[0].node.priceV2;
    gridItemBindings.price.textContent = this.formatMoney(price.amount);
    if (compareAtPrice !== null) {
      gridItemBindings.compareAtPrice.textContent = this.formatMoney(compareAtPrice.amount);
    } else {
      gridItemBindings.compareAtPrice.textContent = '';
    }

    return gridItem;
  }

  findBindingElements(element) {
    return {
      externalLink: element.querySelector('[data-bind="product-external-link"]'),
      image: element.querySelector('[data-bind="product-image"]'),
      title: element.querySelector('[data-bind="product-title"]'),
      price: element.querySelector('[data-bind="product-price"]'),
      compareAtPrice: element.querySelector('[data-bind="product-compare-at-price"]'),
    };
  }
}
