import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
    getTweets
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

// Debug route to check JWT middleware
router.get('/debug', verifyJWT, (req, res) => {
    console.log('User in request:', req.user);
    res.json({ user: req.user });
});

router.use(verifyJWT);

router.route("/").get(getTweets).post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router