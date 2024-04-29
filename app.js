const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = 3000;


// Session configuration
app.use(session({
  secret: '88991', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

// Setup storage for images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images'),
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set EJS as templating engine
app.set('view engine', 'ejs');

let posts = [];

app.get('/post', (req, res) => {
    res.render('post');
});

app.post('/post', upload.single('image'), (req, res) => {
    const { title, body } = req.body;
    const image = 'images/' + req.file.filename;
    const newPost = {
        id: Date.now(),
        title,
        body,
        image,
    };

    posts.push(newPost);
    // Add post logic
    req.session.message = {
      type: 'success',
      text: 'Post created successfully!'
  };
    res.redirect('/');
});
// Delete post route
app.post('/delete/:id', (req, res) => {
    const postId = req.params.id;
    // Find the index of the post with the given ID in the posts array
    posts = posts.filter(post => post.id != postId);

    req.session.message = {
      type: 'success',
      text: 'Post deleted successfully!'
  };
    res.redirect('/');
});

// Edit post route - render edit form
app.get('/edit/:id', (req, res) => {
    const postId = Number(req.params.id);
    let post; // Declare post variable outside the loop

  for (let i = 0; i < posts.length; i++) {
    console.log(posts[i].id, postId)
    if (posts[i].id == postId) {
      post = posts[i];
      break; // Exit the loop once the post is found
    }
  }
    // const post = posts.find(post => post.id === postId); // Find the specific post
    if (post) {
      res.render('edit', { post: post }); // Pass the single post object
    } else {
      // Handle the case where no post is found with the given ID
      res.status(404).send('Post not found'); 
    }
  });

  app.post('/edit/:id', upload.single('image'), (req, res) => {
    const postId = Number(req.params.id);
    const { title, body } = req.body;
    const image = req.file ? 'images/' + req.file.filename : null; // Handle image path

    const post = posts.find(post => post.id === postId);

    if (post) {
        post.title = title;
        post.body = body;
        if (image) { // Update image only if a new file is uploaded
            post.image = image;
        }
    } 
    res.redirect('/');
});


app.get('/', (req, res) => {
    if(posts === undefined) {
        posts = [];
    }
    res.render('index', { posts: posts });
})

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));