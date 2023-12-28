import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import { useAppSelector } from "../app/hooks";
import { useGetAllPostsQuery } from "../features/posts/postsApiSlice";
import Post from "../components/Post";

/**
 *
 * @returns Component which represents the home page and displays all the posts.
 */
function Home() {
  // get the user making the request from the global state
  const currentUser = useAppSelector((state) => state.auth.user);

  // use the'useGetAllPostsQuery' hook the retreive all the posts from the database.
  const {
    data: posts,
    error,
    isLoading,
  } = useGetAllPostsQuery(currentUser?.user_id!);

  if (error) {
    return (
      <Container>
        <p style={{ color: "red" }} className="my-3">
          {/*  @ts-ignore */}
          {error.data.error}
        </p>
      </Container>
    );
  }

  if (isLoading || !posts) {
    return (
      <Container className="d-flex min-vh-100 justify-content-center align-items-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container>
      {posts.map((post) => (
        <Post key={post.post_id} post={post} />
      ))}
    </Container>
  );
}

export default Home;
