import React from "react";
import { getTags } from "@/lib/actions/tag.actions";

const TagsPage = async () => {
  const { success, data, error } = await getTags({
    page: 1,
    pageSize: 10,
    query: "vue",
  });

  const { tags } = data || {};
  console.log("TAGS", JSON.stringify(tags, null, 2));
  return <div></div>;
};

export default TagsPage;
