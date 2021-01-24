const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
// const upload = multer({
//   dest: uploadPath,
//   fileFilter: (req, file, callback) => {
//     callback(null, imageMimeTypes.includes(file.mimetype))
//   }
// })

// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  saveCover(book,req.body.cover)
  try {
    const newBook = await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`)
  } catch {
    renderNewPage(res, book, true)
  }
})

// Show book
router.get('/:id', async(req,res)=>{
  
  try{
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('books/show',{book:book})
  }catch(e){
    console.error(e)
    res.redirect('/')
  }

})
// Edit Book
router.get('/:id/edit', async (req,res)=>{
  try{
    const book = await Book.findById(req.params.id)
    const author = await Author.find()
    res.render('books/edit',{book:book, authors:author})
  }catch(e){
    console.log(e)
    res.redirect('/books')
  }
})
// update Book
router.put('/:id',async(req,res)=>{
  try{
    const book = await Book.findById(req.params.id)
    // book.title = req.params.title
    // book.
    book.title =  req.body.title,
    book.author = req.body.author,
    book.publishDate = new Date(req.body.publishDate),
    book.pageCount = req.body.pageCount,
    book.description = req.body.description
    saveCover(book,req.body.cover)
    await book.save()
    res.redirect('/books')
  }catch(e){
    console.error(e)
    res.redirect('/')
  }
})
// delete Book
router.delete('/:id', async (req,res) =>{
  try{
    const book = await book.findById(req.params.id)
    await book.remove()
  }catch(e){
    console.error(e)
    res.redirect('/books')
  }
})

function saveCover(book,coverEncoded){
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if(cover != null && imageMimeTypes.includes(cover.type)){
    book.coverImage = new Buffer.from(cover.data,'base64')
    book.coverImageType = cover.type
  }
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) params.errorMessage = 'Error Creating Book'
    res.render('books/new', params)
  } catch {
    res.redirect('/books')
  }
}

module.exports = router