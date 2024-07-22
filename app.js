const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let posts = [];

app.get('/', (req, res) => {
    const selectedPostId = req.query.postId;
    const selectedPost = posts.find(p => p.id == selectedPostId);
    res.render('index', { posts: posts, selectedPost: selectedPost });
});

app.get('/new-post', (req, res) => {
    res.render('new-post');
});

app.post('/new-post', (req, res) => {
    const post = {
        id: Date.now(),
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        createdAt: new Date().toLocaleString()
    };
    posts.push(post);
    res.redirect('/');
});

app.get('/edit/:id', (req, res) => {
    const post = posts.find(p => p.id == req.params.id);
    if (post) {
        res.render('edit-post', { post: post });
    } else {
        res.status(404).send('Post not found');
    }
});

app.post('/edit/:id', (req, res) => {
    const post = posts.find(p => p.id == req.params.id);
    if (post) {
        post.title = req.body.title;
        post.content = req.body.content;
        post.author = req.body.author;
        res.redirect('/');
    } else {
        res.status(404).send('Post not found');
    }
});

app.post('/delete/:id', (req, res) => {
    posts = posts.filter(p => p.id != req.params.id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Blog app listening at http://localhost:${port}`);
});
