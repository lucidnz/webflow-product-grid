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

    // State: Loading.
    this.elements.grid.dataset.state = 'loading';
    // Remove template/placeholder content.
    this.elements.grid.innerHTML = '';

    const eventLoad = new Event('ProductGridLoad');
    const eventLoadImages = new Event('ProductGridLoadImages');
    const loaded = [];
    const onLoad = event => {
      // State: Item ready.
      event.target.closest('[data-state]').dataset.state = 'ready';

      loaded.push(event.target);

      if (loaded.length === data.products.edges.length) {
        // State: Ready.
        this.elements.grid.dataset.state = 'ready';
        // Event: Content and images have loaded.
        this.elements.grid.dispatchEvent(eventLoadImages);
      }
    };
    // Promise is equivalent to 'ProductGridLoadImages' event.
    const promise = new Promise(resolve => this.on('ProductGridLoadImages', () => resolve()));

    for (const edge of data.products.edges) {
      const item = this.cloneTemplate(edge.node, onLoad);

      this.elements.grid.appendChild(item);
    }

    // Event: Content has loaded.
    this.elements.grid.dispatchEvent(eventLoad);

    return promise;
  }

  on(type, listener) {
    this.elements.grid.addEventListener(type, listener);
  }

  cloneTemplate(data, onLoad) {
    const item = this.elements.template.cloneNode(true);
    const itemBindings = this.findBindingElements(item);

    if (itemBindings.externalLink) {
      itemBindings.externalLink.href = data.onlineStoreUrl;
    }
    if (itemBindings.image) {
      const newImage = document.createElement('img');
      // Attach listeners before setting src to ensure they are called.
      newImage.addEventListener('error', onLoad); // treat as load
      newImage.addEventListener('load', onLoad);
      newImage.alt = data.variants.edges[0].node.image.altText;
      newImage.src = data.variants.edges[0].node.image.transformedSrc;
      itemBindings.image.replaceWith(newImage);
    }
    if (itemBindings.title) {
      itemBindings.title.textContent = data.title;
    }
    const compareAtPrice = data.variants.edges[0].node.compareAtPriceV2;
    const price = data.variants.edges[0].node.priceV2;
    if (itemBindings.price) {
      itemBindings.price.textContent = this.formatMoney(price.amount);
    }
    if (itemBindings.compareAtPrice) {
      if (compareAtPrice !== null) {
        itemBindings.compareAtPrice.textContent = this.formatMoney(compareAtPrice.amount);
      } else {
        itemBindings.compareAtPrice.textContent = '';
      }
    }

    // State: Item loading.
    item.dataset.state = 'loading';

    return item;
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
