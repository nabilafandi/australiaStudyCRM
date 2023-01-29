const express = require("express");
const mongoose = require("mongoose");
const { Customer, Comment } = require('./models/customers')


const router = express();
//middleware
router.use(express.json({ limit: '1mb' }));
router.use(express.static('./Public'))

//configure mongoose
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://nabilafandi:australiastudy@australiastudy.9x33xoy.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to MongoDB");
    }
  }
);
// Start server
const port = 5000
router.listen(port, () => {
  console.log(`Server started http://localhost:${port}`);
})


//experimental customer post and get
router.post("/customers/all", async (req, res) => {
  try {
    const customersWithComments = req.body.map(async (customer) => {
      const comments = await Promise.all(customer.comments.map(async (comment) => {
        return await Comment.create(comment);
      }));
      return { ...customer, comments };
    });
    const customers = await Customer.insertMany(await Promise.all(customersWithComments));
    res.json({ message: "Customers and comments created successfully.", customers });
  } catch (err) {
    res.status(500).json({ message: "Error creating customers and comments.", error: err });
  }
});
router.get("/customers/all", async (req, res) => {
  try {
    const customers = await Customer.find().populate("comments");
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Error getting customers.", error: err });
  }
});


// // Create a new customer
router.post("/customers", async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json({ message: "Customer created successfully." });
  } catch (err) {
    res.status(400).json({ message: "Error creating customer.", error: err });
  }
});

// Get all customers
router.get("/customers", async (req, res) => {
  try {
    let customers;
    customers = await Customer.find({});
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching customers.", error: err });
  }
});


// Get a single customer by ID
router.get("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('comments');
    if (!customer) {
      res.status(404).json({ message: "Customer not found." });
    } else {
      res.json(customer);
    }
  } catch (err) {
    res.status(500).json({ message: "Error fetching customer.", error: err });
  }
});

// Update a customer by ID
router.put("/customers/:id", async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCustomer) {
      res.status(404).json({ message: "Customer not found." });
    } else {
      res.json({ message: "Customer updated successfully.", customer: updatedCustomer });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating customer.", error: err });
  }
});

// Delete a customer by ID
router.delete("/customers/:id", async (req, res) => {
  try {
    const deletedCustomer = await Customer.findById(req.params.id);
    if (!deletedCustomer) {
      res.status(404).json({ message: "Customer not found." });
    } else {
      await Comment.deleteMany({ _id: { $in: deletedCustomer.comments } });
      await deletedCustomer.remove();
      res.json({ message: "Customer and related comments deleted successfully.", customer: deletedCustomer });
    }
  } catch (err) {
    res.status(500).json({ message: "Error deleting customer and related comments.", error: err });
  }
});


//get comments
router.get('/customers/:id/comments', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('comments')
    const comments = customer.comments
    res.json(comments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

//post comments
router.post('/customers/:customerId/comments', async (req, res) => {
  try {
    const comment = new Comment({
      body: req.body.body,
      time: req.body.time
    })
    const savedComment = await comment.save()
    const customer = await Customer.findById(req.params.customerId)
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" })
    }
    customer.comments.push(savedComment._id)
    await customer.save()
    res.status(201).json(savedComment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})
//delete comments
router.delete('/customers/:customerId/comments/:commentId', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId)
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" })
    }
    const commentIndex = customer.comments.indexOf(req.params.commentId)
    if (commentIndex === -1) {
      return res.status(404).json({ error: "Comment not found" })
    }
    customer.comments.splice(commentIndex, 1)
    await customer.save()
    await Comment.findByIdAndDelete(req.params.commentId)
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})
//edit comments
router.patch('/customers/:customerId/comments/:commentId', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId)
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" })
    }
    const commentIndex = customer.comments.indexOf(req.params.commentId)
    if (commentIndex === -1) {
      return res.status(404).json({ error: "Comment not found" })
    }
    const comment = await Comment.findByIdAndUpdate(req.params.commentId, {
      body: req.body.body,
      time: req.body.time
    }, { new: true })
    res.status(200).json(comment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})