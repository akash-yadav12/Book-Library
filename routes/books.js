const express = require('express')
const Book = require('../models/book')
const router = express.Router()


// All Books route
router.get('/', async (req,res)=>{
    res.send('All Books')
})

// New Book Route
router.get('/new', (req,res) =>{
    res.send('New Book')

})

// Create Book Route
router.post('/', async (req,res)=>{
    res.send('Create Books')
})


module.exports = router