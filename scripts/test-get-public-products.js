const { getPublicProducts } = require('../src/lib/commerce/products');

async function main() {
  const res = await getPublicProducts({ limit: 100 });
  console.log('Success:', res.success);
  console.log('Total returned:', res.products ? res.products.length : 'none');
  console.log('Pagination:', res.pagination);
  if (res.products && res.products.length > 0) {
    console.log('Sample product:', res.products[0]);
  } else {
    console.log('Error / Empty:', res);
  }
}

main().catch(console.error);
