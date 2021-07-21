// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.belongsTo(Category, {
  foreginKey: 'category_id',
});

// Categories have many Products
Category.hasMany(Product, {
  foreginKey: 'category_id',
  onDelete: 'CASCADE'
});

// Products belongToMany Tags (through ProductTag)
Product.belongsToMany(Tag, {
   through: {
     model: ProductTag,
     uniqe: false
   }, as: 'product_tag'   });
// Tags belongToMany Products (through ProductTag)
Tag.belongToMany(Product, {
  through: {
    model: ProductTag,
    uniqe: false
  }, as: 'tag_product' });

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
