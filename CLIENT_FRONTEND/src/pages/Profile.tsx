import { Button, Card, Container, Row, Col, Image } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetUserQuery } from "../features/users/usersApiSlice";
import { useAppSelector } from "../app/hooks";
import {
  useCreateAndDeleteRelationshipMutation,
  useGetRelationshipQuery,
} from "../features/relationships/relationshipsApiSlice";
import NoProfilePic from "/img/No_image_available.svg.png";
import NoCoverPic from "/img/no-picture-available-icon-1.png";

/**
 *
 * @returns Component / page which displays the user's properties (profile picture, cover picture, city, website)
 */
function Profile() {
  const navigate = useNavigate();

  // get the id of the user from the url
  const user_id = useLocation().pathname.split("/")[2];

  // use the 'useGetRelationshipQuery'
  const { data: user, error: userError } = useGetUserQuery(user_id);

  // use the 'useGetRelationshipQuery'
  const { data: relationship, error: relationshipError } =
    useGetRelationshipQuery(user_id);

  // use the 'useCreateAndDeleteRelationshipMutation'
  const [handleCreateAndDeleteRelationship] =
    useCreateAndDeleteRelationshipMutation();

  // get the user making the request from the global store
  const currentUser = useAppSelector((state) => state.auth.user);

  /**
   * When the user clicks the button, it triggers this method
   * which makes a POST request to add or remove a relationship from the database.
   */
  async function handleFollowAndUnfollow() {
    await handleCreateAndDeleteRelationship(user_id);
  }

  /**
   * When the user clicks the button, it triggers this method
   * navigates the user to the edit page.
   */
  function handleGoToEditAccountPage() {
    navigate(`/edit`);
  }

  // show this container if an error occured while retreiving the user from the database
  if (userError) {
    return (
      <Container className="d-flex justify-content-center align-items-center">
        {/* @ts-ignore */}
        {userError.data.error}
      </Container>
    );
  }

  // show this container if an error occured while retreiving the relationship from the database
  if (relationshipError) {
    return (
      <Container className="d-flex justify-content-center align-items-center">
        {/* @ts-ignore */}
        {relationshipError.data.error}
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center">
      <Card>
        <div>
          {/* show the cover picture of the user or an alternative image if the user does not have any cover picture */}
          <Image
            src={
              user?.cover_picture
                ? "/userUploads/" + user?.cover_picture
                : NoCoverPic
            }
            fluid
            width="100%"
          />
        </div>

        {/* overlap the cover picutre with the profile picture, center the profile picture horizontally */}
        <div className="position-relative text-center">
          <div
            className="position-absolute"
            style={{
              top: "-40px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {/* show the profile picture of the user or an alternative image if the user does not have any profile picture*/}
            <Image
              src={
                user?.profile_picture
                  ? "/userUploads/" + user?.profile_picture
                  : NoProfilePic
              }
              style={{ height: "80px", width: "80px", marginTop: "2px" }}
              roundedCircle
              fluid
            />
          </div>
        </div>

        <div className="mt-5 text-center">
          <h4 className="mb-3">{user?.user_name}</h4>

          {/* show the users' city and website (if it has any)  */}
          <Container>
            <Row>
              {user?.city && (
                <Col>
                  <div>
                    <h6 className="mb-0 fw-bold">City</h6>
                    <p>{user?.city}</p>
                  </div>
                </Col>
              )}

              {user?.website && (
                <Col>
                  <div>
                    <h6 className="mb-0 fw-bold">Website</h6>
                    <p>{user?.website} </p>
                  </div>
                </Col>
              )}
            </Row>
          </Container>

          {currentUser?.user_id === user_id ? (
            // show 'edit account' button if the id of the user from the url is the id of the user making the request
            <Button
              className="rounded mb-4"
              onClick={handleGoToEditAccountPage}
            >
              Edit Account
            </Button>
          ) : (
            // show 'follow' button if the id of the user from the url is the id of a different user
            <Button className="rounded mb-4" onClick={handleFollowAndUnfollow}>
              {/*  show 'follow' text if the user is not already followed, else show different text */}
              {relationship?.follower_user_id ===
              (currentUser?.user_id as string)
                ? "Following. Click to Unfollow"
                : "Follow"}
            </Button>
          )}
        </div>
      </Card>
    </Container>
  );
}

export default Profile;
