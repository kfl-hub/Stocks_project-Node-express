
const JwtAuth = require('../middleware/auth/jwtAuth');
const express = require('express');
const router = express.Router();
const commentService = require('../service/commentService'); // Adjust the path as necessary

// Route to create a new comment
router.post('/',JwtAuth, commentService.createComment);

// Route to find comments by code
router.get('/:code', commentService.findCommentByCode);

// Route to update a comment's content by ID
router.put('/',JwtAuth, commentService.updateCommentContent); // Using PUT for update

// Route to delete a comment by ID
router.delete('/:id',JwtAuth, commentService.deleteCommentById); // Using DELETE for delete

module.exports = router;