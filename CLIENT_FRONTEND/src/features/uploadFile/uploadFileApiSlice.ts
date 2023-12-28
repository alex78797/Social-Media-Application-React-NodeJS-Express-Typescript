import { apiSlice } from "../../app/api/apiSlice";

export const uploadFileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<string, FormData>({
      query: (body) => ({
        url: "/upload",
        method: "POST",
        body,
      }),
      invalidatesTags: ["uploads"],
    }),
  }),
});

export const { useUploadFileMutation } = uploadFileApiSlice;
