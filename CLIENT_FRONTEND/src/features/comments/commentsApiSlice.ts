import { apiSlice } from "../../app/api/apiSlice";
import { IComment } from "../../types/types";

export const commentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllComments: builder.query<IComment[], string>({
      query: (post_id) => "/comments?postId=" + post_id,
      providesTags: ["comments"],
    }),
    createComment: builder.mutation<
      void,
      { comment_description: string; post_id: string }
    >({
      query: (body) => ({
        url: "/comments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["comments"],
    }),
    deleteComment: builder.mutation<void, string>({
      query: (commentId) => ({
        url: "/comments/" + commentId,
        method: "DELETE",
      }),
      invalidatesTags: ["comments"],
    }),
  }),
});

export const {
  useGetAllCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = commentsApiSlice;
