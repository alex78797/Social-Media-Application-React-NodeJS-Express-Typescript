import { apiSlice } from "../../app/api/apiSlice";
import { IRelationship } from "../../types/types";

export const relationshipsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRelationship: builder.query<IRelationship, string>({
      query: (followed_user_id) =>
        "/relationships?followedUserId=" + followed_user_id,
      // underscore _ added to please ts (ts complains that variables are unused)
      providesTags: (_result, _error, id) => [{ type: "relationships", id }],
    }),
    getAllFollowedUsers: builder.query<IRelationship[], void>({
      query: () => "/relationships/all",
      providesTags: ["relationships"],
    }),

    createAndDeleteRelationship: builder.mutation<void, string>({
      query: (user_id) => ({
        url: "/relationships?userId=" + user_id,
        method: "POST",
      }),
      invalidatesTags: ["relationships", "posts"],
    }),
  }),
});

export const {
  useGetRelationshipQuery,
  useGetAllFollowedUsersQuery,
  useCreateAndDeleteRelationshipMutation,
} = relationshipsApiSlice;
