import React from "react";
import { getUsers } from "@/lib/actions/users.action";
import LocalSearch from "@/components/web/search/LocalSearch";
import ROUTES from "@/constants/routes";
import DataRenderer from "@/components/web/base/DataRenderer";
import { EMPTY_USERS } from "@/constants/states";
import UserCard from "@/components/web/cards/UserCard";

const CommunityPage = async ({ searchParams }: RouteParams) => {
  const { page = 1, pageSize = 10, query, filter } = await searchParams;

  const { success, data, error } = await getUsers({
    page: Number(page),
    pageSize: Number(pageSize),
    query,
    filter,
  });

  const { users } = data || {};

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">All users</h1>

      <div className="mt-11">
        <LocalSearch
          route={ROUTES.COMMUNITY}
          imgSrc="/icons/search.svg"
          placeholder="Search users..."
          otherClasses="flex-1"
        />
      </div>

      <DataRenderer
        success={success}
        empty={EMPTY_USERS}
        data={users}
        error={error}
        render={(users) => (
          <div className="mt-12 flex flex-wrap gap-5">
            {users.map((user) => (
              <UserCard key={user._id} {...user} />
            ))}
          </div>
        )}
      />
    </div>
  );
};

export default CommunityPage;
