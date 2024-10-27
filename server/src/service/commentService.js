const Comment = require('../model/commentModel'); // Adjust the path as necessary

exports.createComment = async (req, res) => {
    const {uid}= req.user;
    const { code, content } = req.body; // Extract uid and content from request body

    if (!code || !content) {
        res.status(400).json({ message: 'code and content are required.' });
        return;
    }

    try {
        const newComment = new Comment({
            uid: uid,
            content,
            code: code, 
        });

        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
        return;
    } catch (error) {
        console.error('Error creating comment:', error.message);
        res.status(500).json({ message: 'Error creating comment.' });
        return;
    }
};


exports.findCommentByCode = async (req, res) => {
    const { code } = req.params; // Extract code from request parameters

    if (!code) {
        res.status(400).json({ message: 'No code provided.' });
        return;
    }

    try {
        const comments = await Comment.find({ code }); // Find comments by code
        if (comments.length === 0) {
            res.status(404).json({ message: 'No comments found for this code.' });
            return;
        }
        
        res.status(200).json(comments);
        return;
    } catch (error) {
        console.error('Error finding comments by code:', error.message);
        res.status(500).json({ message: 'Error finding comments.' });
        return;
    }
};


exports.updateCommentContent = async (req, res) => {
    const { uid } = req.user; // Extract uid from authenticated user
    const { id,content } = req.body; // Extract new content from request body

    if (!id || !content) {
        res.status(400).json({ message: 'Comment ID and new content are required.' });
        return;
    }

    try {
        const updatedComment = await Comment.findOneAndUpdate(
            { _id: id, uid: uid }, // Filter by ID and verify user ID
            { content }, // Update content
            { new: true } // Return the updated document
        );

        if (!updatedComment) {
            res.status(404).json({ message: 'Comment not found or you are not authorized to update this comment.' });
            return;
        }

        res.status(200).json(updatedComment); // Return the updated comment
        return;
    } catch (error) {
        console.error('Error updating comment:', error.message);
        res.status(500).json({ message: 'Error updating comment.' });
        return;
    }
};

exports.deleteCommentById = async (req, res) => {
    const { id } = req.params; 
    const { uid } = req.user; // Extract uid from authenticated user

    if (!id) {
        res.status(400).json({ message: 'No Comment ID provided.' });
        return;
    }

    try {
        const deletedComment = await Comment.findOneAndDelete({ _id: id, uid: uid }); // Verify user ID

        if (!deletedComment) {
            res.status(404).json({ message: 'Comment not found or you are not authorized to delete this comment.' });
            return;
        }

        res.status(200).json({ message: 'Comment deleted successfully.' });
        return;
    } catch (error) {
        console.error('Error deleting comment:', error.message);
        res.status(500).json({ message: 'Error deleting comment.' });
        return;
    }
};