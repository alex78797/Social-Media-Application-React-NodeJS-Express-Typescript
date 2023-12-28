import React, { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useAddPostMutation } from "../features/posts/postsApiSlice";
import { useUploadFileMutation } from "../features/uploadFile/uploadFileApiSlice";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

/**
 *
 * @returns A page, where a user can add a post
 */
function AddPost() {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [post_description, setPostDescription] = useState("");

  const [addPost, { error: addPostError }] = useAddPostMutation();

  const [sendFile, { error: sendFileError }] = useUploadFileMutation();

  const currentUser = useAppSelector((state) => state.auth.user);

  /**
   * Makes a POST request to upload a file to the server.
   * @param file
   * @returns
   */
  async function uploadFile(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      // const res = await fetch("http://localhost:3000/api/upload", {
      //   method: "POST",
      //   body: formData,
      //   headers: { authorization: "Bearer" + " " + accessToken },
      // });
      // return res.json();
      const res = await sendFile(formData).unwrap();
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * When a user clicks the add post button, it triggers this method
   * which makes a POST request to add a post description, or a file or both to the server.
   * @param e
   */
  async function handleUploadPost(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    const imgURL = file ? ((await uploadFile(file)) as string) : "";
    await addPost({ post_description, img: imgURL }).unwrap();
    navigate("/");
  }

  return (
    <Container className="my-5">
      <h1>Upload a post</h1>
      <Form>
        {/* form for uploading text to the server */}
        <Form.Group className="mb-3 my-3" controlId="formBasicEmail">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            name="user_name"
            value={post_description}
            placeholder={`What is on your mind ${currentUser?.user_name} ?`}
            onChange={(e) => setPostDescription(e.target.value)}
          />
        </Form.Group>

        {/* form for uploading files to the server */}
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Picture</Form.Label>
          <Form.Control
            type="file"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFile(e.target.files![0])
            }
          />
        </Form.Group>

        {/* show this paragraph if an error occured while adding the post */}
        {addPostError && (
          <p style={{ color: "red" }}>
            {/* @ts-ignore */}
            {addPostError.data.error}
          </p>
        )}

        {sendFileError && (
          <p style={{ color: "red" }}>
            {/* @ts-ignore */}
            {sendFileError.data.error}
          </p>
        )}

        {/* the button to add a post */}
        <Button variant="primary" type="submit" onClick={handleUploadPost}>
          Add post
        </Button>
      </Form>
    </Container>
  );
}

export default AddPost;
