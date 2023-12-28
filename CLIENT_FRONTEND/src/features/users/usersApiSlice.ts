import { apiSlice } from "../../app/api/apiSlice";
import { IUser } from "../../types/types";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCommentAuthor: builder.query<IUser, string>({
      query: (comment_id) => "/users/findCommentAuthor/" + comment_id,
      // underscore _ added to please ts (ts complains that variables are unused)
      providesTags: (_result, _error, id) => [{ type: "users", id }],
    }),
    getPostAuthor: builder.query<IUser, string>({
      query: (post_id) => "/users/findPostAuthor/" + post_id,
      // underscore _ added to please ts (ts complains that variables are unused)
      providesTags: (_result, _error, id) => [{ type: "users", id }],
    }),
    getUser: builder.query<IUser, string>({
      query: (user_id) => "/users/findUser/" + user_id,
      // underscore _ added to please ts (ts complains that variables are unused)
      providesTags: (_result, _error, id) => [{ type: "users", id }],
    }),
    updateUser: builder.mutation<
      void,
      {
        user_name: string;
        city: string;
        website: string;
        profile_picture: string;
        cover_picture: string;
      }
    >({
      query: (body) => ({
        url: "/users",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["users"],
    }),
    resetPassword: builder.mutation<
      void,
      {
        old_password: string;
        new_password: string;
        new_password_confirm: string;
      }
    >({
      query: (body) => ({
        url: "/users/resetPassword",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["users"],
    }),
    deleteUser: builder.mutation<void, { password: string }>({
      query: (body) => ({
        url: "/users/deleteAccount",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

export const {
  useGetCommentAuthorQuery,
  useGetPostAuthorQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useResetPasswordMutation,
  useDeleteUserMutation,
} = usersApiSlice;
