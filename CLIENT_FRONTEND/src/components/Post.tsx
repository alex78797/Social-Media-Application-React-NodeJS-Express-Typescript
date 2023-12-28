import Container from "react-bootstrap/Container";
import { useAppSelector } from "../app/hooks";
import {
  useGetAllLikesQuery,
  useHandleLikeAndUnlikeMutation,
} from "../features/likes/likesApiSlice";
import { useDeletePostMutation } from "../features/posts/postsApiSlice";
import { useGetPostAuthorQuery } from "../features/users/usersApiSlice";
import { IPost } from "../types/types";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useState } from "react";
import Collapse from "react-bootstrap/Collapse";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import CommentSection from "./CommentSection";
import { formatDistance } from "date-fns/formatDistance";
import { useGetAllCommentsQuery } from "../features/comments/commentsApiSlice";
import { Link } from "react-router-dom";

/**
 *
 * @param param0
 * @returns A component, which displays a particular post
 */
function Post({ post }: { post: IPost }) {
  // use the 'useGetPostAuthorQuery' hook to get the user who made the post from the server
  const { data: postAuthor } = useGetPostAuthorQuery(post.post_id);

  // use the 'useGetAllLikesQuery' hook to get the likes on a particular post from the server
  const { data: likes } = useGetAllLikesQuery(post.post_id);

  // use the 'useGetAllCommentsQuery' hook to get the comments on a particular post from the server
  const { data: comments } = useGetAllCommentsQuery(post.post_id);

  // use the 'useHandleLikeAndUnlikeMutation' hook to add or remove a like on a particular post
  const [likeAndUnlike] = useHandleLikeAndUnlikeMutation();

  // use the 'useDeletePostMutation' hook to delete a particular post
  const [deletePost] = useDeletePostMutation();

  // get the user making the request from the global state
  const currentUser = useAppSelector((state) => state.auth.user);

  /**
   * When the user clicks the like button, it triggers this method
   * which makes a POST request to like a particular post, or unlike an already appreciated post.
   */
  async function handleLikeAndUnlike() {
    await likeAndUnlike({
      user_id: currentUser?.user_id as string,
      post_id: post.post_id,
    }).unwrap();
    setLiked(!liked);
  }

  // local state variables (accessible only by this component), changes in state variables causes this component (and maybe other components who depend on it) to re-render
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(false);

  /**
   * When the user clicks the like button, it triggers this method
   * which makes a DELETE request to delete a particular post.
   */
  async function handleDeletePost() {
    const post_id = post.post_id;
    await deletePost(post_id).unwrap();
  }

  return (
    <Container>
      <Card className="w-100 m-auto mb-5">
        {/* show the image if the post contains any image */}
        {post.img && post.img !== "" && (
          <Card.Img variant="top" src={"/userUploads/" + post.img} />
        )}
        <Card.Body>
          {/* when the username (post author) is clicked, go to ths users' profile page  */}
          <Link to={`profile/${postAuthor?.user_id}`}>
            <Card.Title>{postAuthor?.user_name}</Card.Title>
          </Link>

          {/* show the description if the post contains any description */}
          {post.post_description && post.post_description !== "" && (
            <Card.Text>{post.post_description}</Card.Text>
          )}

          {/* shows approximately when the post was created */}
          <p>
            {formatDistance(new Date(post.created_at), new Date(), {
              addSuffix: true,
            })}
          </p>
          <ButtonToolbar aria-label="Toolbar with button groups">
            {currentUser?.user_id === postAuthor?.user_id ? null : !liked ? (
              <Button
                variant="outline-secondary"
                className="me-3"
                onClick={handleLikeAndUnlike}
              >
                Like ({likes?.length})
              </Button>
            ) : (
              <Button
                variant="outline-info"
                className="me-3"
                onClick={handleLikeAndUnlike}
              >
                Liked ({likes?.length})
              </Button>
            )}
            <Button
              variant="outline-secondary"
              onClick={() => setOpen(!open)}
              aria-controls="example-collapse-text"
              aria-expanded={open}
              className="me-3"
            >
              Comments ({comments?.length})
            </Button>
            {currentUser && currentUser.user_id === post.user_id && (
              <ButtonGroup aria-label="Third group">
                <Button
                  variant="outline-danger"
                  className="me-3"
                  onClick={handleDeletePost}
                >
                  Delete Post
                </Button>
              </ButtonGroup>
            )}
          </ButtonToolbar>
          <Collapse in={open}>
            <div id="example-collapse-text" className="my-3">
              <CommentSection post={post} />
            </div>
          </Collapse>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Post;
