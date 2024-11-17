const express = require('express');
const { Client } = require('pg'); // PostgreSQL client
const app = express();
const port = 3000;

// Set up PostgreSQL connection
const client = new Client({
    host: 'localhost', 
    port: 5432, 
    user: 'postgres', 
    password: 'kunal@36',
    database: 'Blogsite' 
});

client.connect();

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Get all posts from the database
app.get('/', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM posts ORDER BY created_at DESC');
        const posts = result.rows;
        const selectedPostId = req.query.postId;
        const selectedPost = posts.find(p => p.id == selectedPostId);
        res.render('index', { posts: posts, selectedPost: selectedPost });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Show form to create a new post
app.get('/new-post', (req, res) => {
    res.render('new-post');
});

// Create a new post in the database
app.post('/new-post', async (req, res) => {
    const { title, content, author } = req.body;
    const createdAt = new Date().toLocaleString();
    try {
        const result = await client.query(
            'INSERT INTO posts (title, content, author, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, author, createdAt]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Show the edit form for a specific post
app.get('/edit/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const result = await client.query('SELECT * FROM posts WHERE id = $1', [postId]);
        const post = result.rows[0];
        if (post) {
            res.render('edit-post', { post: post });
        } else {
            res.status(404).send('Post not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Update an existing post in the database
app.post('/edit/:id', async (req, res) => {
    const postId = req.params.id;
    const { title, content, author } = req.body;
    try {
        await client.query(
            'UPDATE posts SET title = $1, content = $2, author = $3 WHERE id = $4',
            [title, content, author, postId]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Delete a post from the database
app.post('/delete/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        await client.query('DELETE FROM posts WHERE id = $1', [postId]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Blog app listening at http://localhost:${port}`);
});
