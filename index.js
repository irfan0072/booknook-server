const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'booknook_secure_jwt_secret_key_2024';

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Unauthorized access. Token required.' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access. Invalid or expired token.' });
    }
    req.user = decoded;
    next();
  });
};

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/booknook_db";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Seed data if collection is empty
const seedBooks = [
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    description: "A gripping tale of racial injustice and the destruction of innocence in the American South, viewed through the eyes of young Scout Finch.",
    userName: "Library Admin",
    userEmail: "admin@booknook.com",
    totalCopies: 5,
    availableCopies: 5,
    createdAt: new Date("2024-01-10T10:00:00Z")
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=800&q=80",
    description: "An iconic scientific masterpiece that explores the profound mysteries of the universe, black holes, the Big Bang, and the nature of time.",
    userName: "Library Admin",
    userEmail: "admin@booknook.com",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date("2024-01-15T11:00:00Z")
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    category: "History",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    description: "An exhilarating exploration of how an unremarkable ape became the ruler of planet Earth, bridging biology, anthropology, and economics.",
    userName: "Library Admin",
    userEmail: "admin@booknook.com",
    totalCopies: 6,
    availableCopies: 6,
    createdAt: new Date("2024-02-01T09:30:00Z")
  },
  {
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    category: "Kids",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
    description: "A poetic and philosophical tale of a young prince who visits various planets in space, addressing themes of loneliness, friendship, love, and loss.",
    userName: "Library Admin",
    userEmail: "admin@booknook.com",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date("2024-02-12T14:20:00Z")
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    category: "Others",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    description: "A tour of the mind explaining the two systems that drive the way we think: System 1 (fast, intuitive) and System 2 (slow, deliberate).",
    userName: "Library Admin",
    userEmail: "admin@booknook.com",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date("2024-02-18T16:00:00Z")
  },
  {
    title: "Cosmos",
    author: "Carl Sagan",
    category: "Science",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    description: "The classic voyage of scientific discovery through fifteen billion years of cosmic evolution and the human quest to understand our place in the universe.",
    userName: "Library Admin",
    userEmail: "admin@booknook.com",
    totalCopies: 5,
    availableCopies: 5,
    createdAt: new Date("2024-03-01T08:15:00Z")
  },
  {
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    category: "History",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80",
    description: "A groundbreaking examination of the geographical and environmental factors that shaped the modern world and civilizational development.",
    userName: "Library Admin",
    userEmail: "admin@booknook.com",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date("2024-03-10T12:00:00Z")
  },
  {
    title: "Charlotte's Web",
    author: "E.B. White",
    category: "Kids",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80",
    description: "The timeless and tender story of an affectionate pig named Wilbur and his remarkable friendship with a clever spider named Charlotte.",
    userName: "Library Admin",
    userEmail: "admin@booknook.com",
    totalCopies: 2,
    availableCopies: 2,
    createdAt: new Date("2024-03-15T15:30:00Z")
  }
];

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server!");

    const db = client.db(process.env.DB_NAME || "booknook_db");
    const booksCollection = db.collection("books");
    const borrowsCollection = db.collection("borrows");

    // Seed initial data if books collection is empty
    const count = await booksCollection.countDocuments();
    if (count === 0) {
      await booksCollection.insertMany(seedBooks);
      console.log("Seeded initial books data into MongoDB!");
    }

    // Root Health Route
    app.get('/', (req, res) => {
      res.send({ status: 'success', message: 'BookNook Server is running smoothly!' });
    });

    // JWT Generation Route
    app.post('/jwt', (req, res) => {
      const user = req.body;
      if (!user || !user.email) {
        return res.status(400).send({ message: 'User email is required to issue token.' });
      }
      const token = jwt.sign(user, jwtSecret, { expiresIn: '7d' });
      res.send({ success: true, token });
    });

    // 1. GET /books — get all books (public)
    // Supports query params: limit, sort, category, search, email
    app.get('/books', async (req, res) => {
      try {
        const { limit, sort, category, search, email } = req.query;
        let query = {};

        if (email) {
          query.userEmail = email;
        }

        if (category && category !== 'All') {
          query.category = category;
        }

        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } }
          ];
        }

        let cursor = booksCollection.find(query);

        // Sort newest first
        if (sort === 'newest' || limit) {
          cursor = cursor.sort({ createdAt: -1 });
        } else {
          cursor = cursor.sort({ createdAt: -1 });
        }

        if (limit) {
          cursor = cursor.limit(parseInt(limit, 10));
        }

        const books = await cursor.toArray();
        res.send(books);
      } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).send({ message: "Failed to fetch books", error: error.message });
      }
    });

    // 2. GET /books/:id — get one book
    app.get('/books/:id', async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid book ID format." });
        }
        const query = { _id: new ObjectId(id) };
        const book = await booksCollection.findOne(query);
        if (!book) {
          return res.status(404).send({ message: "Book not found." });
        }
        res.send(book);
      } catch (error) {
        console.error("Error fetching book details:", error);
        res.status(500).send({ message: "Failed to fetch book details", error: error.message });
      }
    });

    // 3. POST /books — add a book (protected)
    app.post('/books', verifyToken, async (req, res) => {
      try {
        const book = req.body;
        const totalCopies = parseInt(book.totalCopies, 10) || 1;
        const newBook = {
          title: book.title,
          author: book.author,
          category: book.category,
          image: book.image,
          description: book.description,
          userName: req.user.name || book.userName,
          userEmail: req.user.email || book.userEmail,
          totalCopies: totalCopies,
          availableCopies: totalCopies,
          createdAt: new Date()
        };

        const result = await booksCollection.insertOne(newBook);
        res.status(201).send({
          success: true,
          message: "Book added successfully!",
          insertedId: result.insertedId
        });
      } catch (error) {
        console.error("Error adding book:", error);
        res.status(500).send({ message: "Failed to add book", error: error.message });
      }
    });

    // 4. PATCH /books/:id — update a book (protected)
    app.patch('/books/:id', verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid book ID format." });
        }

        const filter = { _id: new ObjectId(id) };
        const existingBook = await booksCollection.findOne(filter);
        if (!existingBook) {
          return res.status(404).send({ message: "Book not found." });
        }

        // Authorization check: only owner can edit
        if (existingBook.userEmail !== req.user.email) {
          return res.status(403).send({ message: "You are not authorized to update this book." });
        }

        const updateData = req.body;
        const totalCopies = updateData.totalCopies ? parseInt(updateData.totalCopies, 10) : existingBook.totalCopies;
        
        // Adjust available copies based on change in total copies
        const copyDifference = totalCopies - (existingBook.totalCopies || 1);
        const newAvailableCopies = Math.max(0, (existingBook.availableCopies || 0) + copyDifference);

        const updatedDoc = {
          $set: {
            title: updateData.title || existingBook.title,
            author: updateData.author || existingBook.author,
            category: updateData.category || existingBook.category,
            image: updateData.image || existingBook.image,
            description: updateData.description || existingBook.description,
            totalCopies: totalCopies,
            availableCopies: newAvailableCopies,
            updatedAt: new Date()
          }
        };

        const result = await booksCollection.updateOne(filter, updatedDoc);
        res.send({
          success: true,
          message: "Book updated successfully!",
          modifiedCount: result.modifiedCount
        });
      } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).send({ message: "Failed to update book", error: error.message });
      }
    });

    // 5. DELETE /books/:id — delete a book (protected)
    app.delete('/books/:id', verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid book ID format." });
        }

        const filter = { _id: new ObjectId(id) };
        const existingBook = await booksCollection.findOne(filter);
        if (!existingBook) {
          return res.status(404).send({ message: "Book not found." });
        }

        // Authorization check: only owner can delete
        if (existingBook.userEmail !== req.user.email) {
          return res.status(403).send({ message: "You are not authorized to delete this book." });
        }

        const result = await booksCollection.deleteOne(filter);
        res.send({
          success: true,
          message: "Book deleted successfully!",
          deletedCount: result.deletedCount
        });
      } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).send({ message: "Failed to delete book", error: error.message });
      }
    });

    // 6. POST /borrows — borrow a book (protected)
    // Challenge 1: No Double Borrow
    // Challenge 2: decrease availableCopies by 1 using $inc
    app.post('/borrows', verifyToken, async (req, res) => {
      try {
        const { bookId, bookTitle, bookImage, returnDate } = req.body;
        const userEmail = req.user.email;
        const userName = req.user.name || req.body.userName;

        if (!bookId || !ObjectId.isValid(bookId)) {
          return res.status(400).send({ message: "Valid Book ID is required." });
        }

        // Check if book exists and has available copies
        const book = await booksCollection.findOne({ _id: new ObjectId(bookId) });
        if (!book) {
          return res.status(404).send({ message: "Book not found." });
        }

        if (book.availableCopies <= 0) {
          return res.status(400).send({ message: "Sorry, this book is currently out of stock!" });
        }

        // Challenge: No Double Borrow check
        const alreadyBorrowed = await borrowsCollection.findOne({
          bookId: bookId,
          userEmail: userEmail,
          status: 'borrowed'
        });

        if (alreadyBorrowed) {
          return res.status(400).send({
            message: "You have already borrowed this book and have not returned it yet!"
          });
        }

        // Decrement availableCopies using $inc
        await booksCollection.updateOne(
          { _id: new ObjectId(bookId) },
          { $inc: { availableCopies: -1 } }
        );

        // Record borrow in borrows collection
        const borrowDoc = {
          bookId: bookId,
          bookTitle: bookTitle || book.title,
          bookImage: bookImage || book.image,
          userEmail: userEmail,
          userName: userName,
          borrowDate: new Date().toISOString().split('T')[0],
          returnDate: returnDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'borrowed',
          createdAt: new Date()
        };

        const result = await borrowsCollection.insertOne(borrowDoc);

        res.status(201).send({
          success: true,
          message: "Book borrowed successfully!",
          insertedId: result.insertedId
        });
      } catch (error) {
        console.error("Error borrowing book:", error);
        res.status(500).send({ message: "Failed to borrow book", error: error.message });
      }
    });

    // 7. GET /borrows — get the borrows of the logged in user (protected)
    app.get('/borrows', verifyToken, async (req, res) => {
      try {
        const userEmail = req.user.email;
        const query = { userEmail: userEmail, status: 'borrowed' };
        const borrows = await borrowsCollection.find(query).sort({ createdAt: -1 }).toArray();
        res.send(borrows);
      } catch (error) {
        console.error("Error fetching user borrows:", error);
        res.status(500).send({ message: "Failed to fetch borrows", error: error.message });
      }
    });

    // 8. DELETE /borrows/:id — return a book (protected)
    // Challenge: increase availableCopies by 1 using $inc
    app.delete('/borrows/:id', verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid borrow ID format." });
        }

        const borrow = await borrowsCollection.findOne({ _id: new ObjectId(id) });
        if (!borrow) {
          return res.status(404).send({ message: "Borrow record not found." });
        }

        // Authorization check: only borrower can return
        if (borrow.userEmail !== req.user.email) {
          return res.status(403).send({ message: "You are not authorized to return this book." });
        }

        // Increment availableCopies in books collection
        if (borrow.bookId && ObjectId.isValid(borrow.bookId)) {
          await booksCollection.updateOne(
            { _id: new ObjectId(borrow.bookId) },
            { $inc: { availableCopies: 1 } }
          );
        }

        // Delete or update status of borrow record
        const result = await borrowsCollection.deleteOne({ _id: new ObjectId(id) });

        res.send({
          success: true,
          message: "Book returned successfully!",
          deletedCount: result.deletedCount
        });
      } catch (error) {
        console.error("Error returning book:", error);
        res.status(500).send({ message: "Failed to return book", error: error.message });
      }
    });

  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`BookNook server running on port: ${port}`);
});
