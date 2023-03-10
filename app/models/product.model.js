module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      _id: String,
      title: String,
      description: String,
      published: Boolean
    },
    { timestamps: true, _id: false }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Product = mongoose.model("product", schema);
  return Product;
};
