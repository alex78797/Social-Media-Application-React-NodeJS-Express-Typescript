import { apiSlice } from "../../app/api/apiSlice";
import { ILike } from "../../types/types";

export const likesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllLikes: builder.query<ILike[], string>({
      query: (post_id) => "/likes?postId=" + post_id,
      providesTags: ["likes"],
    }),
    handleLikeAndUnlike: builder.mutation<
      void,
      { user_id: string; post_id: string }
    >({
      query: (body) => ({
        url: `/likes?postId=${body.post_id}&userId=${body.user_id}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["likes"],
    }),
  }),
});

export const { useGetAllLikesQuery, useHandleLikeAndUnlikeMutation } =
  likesApiSlice;
