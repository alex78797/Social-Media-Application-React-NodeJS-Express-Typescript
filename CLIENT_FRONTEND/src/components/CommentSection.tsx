import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import {
  useCreateCommentMutation,
  useGetAllCommentsQuery,
} from "../features/comments/commentsApiSlice";
import { useState } from "react";
import { IPost } from "../types/types";
import Button from "react-bootstrap/Button";
import Comment from "./Comment";

/**
 *
 * @param post
 * @returns A 'comment section', which displays all comments and allows a user to add a comment on a particular post.
 */
function CommentSection({ post }: { post: IPost }) {
  const [addComment] = useCreateCommentMutation();

  const { data: comments } = useGetAllCommentsQuery(post.post_id);

  const [comment_description, setCommentDescription] = useState("");

  /**
   * When the user clicks the Add Comment button, it triggers this method
   * which makes a POST request to add a comment on this particular post.
   * @param e
   */
  async function handleAddComment(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    // prevent page refresh when submitting form
    e.preventDefault();
    const post_id = post.post_id;
    await addComment({ post_id, comment_description }).unwrap();
    setCommentDescription("");
  }

  return (
    <>
      <Row>
        <Col sm={8}>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Control
                type="text"
                placeholder="Your Comment..."
                onChange={(e) => setCommentDescription(e.target.value)}
                value={comment_description}
              />
            </Form.Group>
          </Form>
        </Col>
        <Col sm={4}>
          <Button variant="primary" type="submit" onClick={handleAddComment}>
            Add Comment
          </Button>
        </Col>
      </Row>
      {comments &&
        comments.map((comment) => (
          <Comment key={comment.comment_id} comment={comment} />
        ))}
    </>
  );
}

export default CommentSection;
