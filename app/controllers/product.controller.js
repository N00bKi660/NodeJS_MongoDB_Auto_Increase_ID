const db = require("../models");
// const multer = require('multer');
const xlsx = require('xlsx');
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
const Product = db.products;
// Create and Save a new Product
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  req.body.published ? req.body.published : false
  //  req.body._id = 'SP004';

  //tim product co id lon nhat
  Product.findOne({})
    .sort({ createdAt: -1 }) // -1 mean take the lastest product created
    .then(latestProduct => {
      //create first product
      if (!latestProduct) {
        req.body._id = 'SP01';
      }
      //create auto increment product id
      else {
        var temp = (latestProduct._id).substring(2, (latestProduct._id).length);
        var tempInt = parseInt(temp) + 1;
        var formattedNumber = ("0" + tempInt).slice(-3);
        req.body._id = "SP" + formattedNumber.toString();
      }
      const product = new Product(req.body);
      // res.send( product._id);
      // Save Product in the database
      product
        .save(product)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Product."
          });
        });
    })
};

// Retrieve all Products from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  Product.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Products."
      });
    });
};

// Find a single Product with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Product.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Product with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Product with id=" + id });
    });
};

// Update a Product by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Product.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Product with id=${id}. Maybe Product was not found!`
        });
      } else res.send({ message: "Product was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Product with id=" + id
      });
    });
};

// Delete a Product with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Product.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Product with id=${id}. Maybe Product was not found!`
        });
      } else {
        res.send({
          message: "Product was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Product with id=" + id
      });
    });
};

// Delete all Products from the database.
exports.deleteAll = (req, res) => {
  Product.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Products were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Products."
      });
    });
};

// Find all published Products
exports.findAllPublished = (req, res) => {
  Product.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Products."
      });
    });

};

exports.upload = (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file was uploaded' });
  }

  // Parse the XLSX file into a workbook object
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

  // Get the first sheet from the workbook
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert the worksheet data into an array of JSON objects
  const data = xlsx.utils.sheet_to_json(worksheet);

  // Save the data to the database
  Product.insertMany(data, (error, products) => {
    if (error) {
      res.status(500).send({ message: error });
    } else {
      res.send({ message: 'Data saved successfully', products });
    }
  });
};





/*
    */