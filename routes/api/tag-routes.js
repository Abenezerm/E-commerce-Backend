const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // finds all tags
  try{
    const tagData = await Tag.findAll({
      include: [{
        model: Product,
        through: ProductTag,
        as: 'tag_product'
      }]
    });
    res.status(200).json(tagData);
  }catch (err){
    res.status(500).json(err);
  }

});

router.get('/:id', (req, res) => {
  // finds a single tag by its `id`
  try{
    const tagData = await Tag.findByPk(res.params.id, {
      include: [{
        model: Product,
        through: ProductTag,
        as: 'tag_product'
      }]
    });

    if (!tagData){
      res.status(404).json({ msg: 'No tag with such id found!'});
      return;
    }
    res.status(200).json(tagData);
  }catch (err){
    res.status(500).json(err)
  }
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create(req.body).then((tag) => {
    if(req.body.productIds.length){
      const productTagIDArr = req.body.productIDs.map((product_id) =>{
        return {
          product_id,
          tad_id: tag.id,
        };
      });
      return ProductTag.bulkCreate(productTagIDArr);
    }
    res.status(200).json(tag);
  }).then((productTagIds) => res.status(200).json(productTagIds))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { tag_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ product_id }) => product_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.productIds
        .filter((product_id) => !productTagIds.includes(product_id))
        .map((product_id) => {
          return {
            product_id,
            tag_id: req.params.id,
          };
        });
      //figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ product_id }) => !req.body.tagIds.includes(product_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!tagData) {
      res.status(404).json({ msg: 'No product with such id found! ' });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
