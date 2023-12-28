import { apiSlice } from "../../app/api/apiSlice";
import { IPost } from "../../types/types";

export const postsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPosts: builder.query<IPost[], string>({
      query: (user_id) => "/posts?userId=" + user_id,
      providesTags: ["posts"],
    }),
    addPost: builder.mutation<
      void,
      { post_description: string; img: string }
    >({
      query: (body) => ({
        url: "/posts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["posts"],
    }),
    updatePost: builder.mutation<IPost, IPost>({
      query: (body) => ({
        url: "/posts",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["posts"],
    }),
    deletePost: builder.mutation<IPost, string>({
      query: (postId) => ({
        url: "/posts/" + postId,
        method: "DELETE",
        postId,
      }),
      invalidatesTags: ["posts"],
    }),
  }),
});

export const {
  useGetAllPostsQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postsApiSlice;
