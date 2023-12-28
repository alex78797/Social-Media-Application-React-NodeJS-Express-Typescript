import { NextFunction, Response } from "express";
import { UserRequest } from "../userRequestTypes/userRequest.types";
import {
  createPostDB,
  deletePostDB,
  getAllUsersAndFollowedUsersPostsDB,
} from "../services/posts.service";
import { sanitizeUserInput } from "../utils/sanitizeUserInput";
import { Post } from "../models/post.models";
import validator from "validator";

/**
 * @description returns all the current users's posts and the posts and stories of the users, that the current user (the user making the request) is following
 * @route GET /api/posts/
 * @access private user has to log in to access the route
 */
export async function getAllUsersAndFollowedUsersPosts(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId: string = req.query.userId as string;
    if (!validator.isUUID(userId)) {
      return res.status(400).json({ error: "Invalid id." });
    }
    const userPosts = await getAllUsersAndFollowedUsersPostsDB(userId);
    return res.status(200).json(userPosts);
  } catch (error) {
    next(error);
  }
}

/**
 * @description Creates a new post with the user's input
 * @route POST /api/posts/
 * @access private user has to log in to access the route
 */
export async function createPost(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userInput = sanitizeUserInput(req.body) as Post;
    const description: string = userInput.post_description;
    const img: string = userInput.img;
    if (!description && !img) {
      return res.sendStatus(204);
    }
    await createPostDB(description, img, req.user_id);
    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

/**
 * @description Deletes a post made by a particular user
 * @route DELETE /api/posts/
 * @access private user has to log in to access the route
 */
export async function deletePost(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const postId = req.params.postId;
    if (!validator.isUUID(postId)) {
      return res.status(400).json({ error: "Invalid id." });
    }
    await deletePostDB(postId, req.user_id);
    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}
