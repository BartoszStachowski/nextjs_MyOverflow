import React from "react";
import { getUsers } from "@/lib/actions/users.action";
import LocalSearch from "@/components/web/search/LocalSearch";
import ROUTES from "@/constants/routes";
import DataRenderer from "@/components/web/base/DataRenderer";
import { EMPTY_USERS } from "@/constants/states";
import UserCard from "@/components/web/cards/UserCard";
import CommonFilter from "@/components/web/filters/CommonFilter";
import { UserFilters } from "@/constants/filters";
import Pagination from "@/components/web/base/Pagination";

const CommunityPage = async ({ searchParams }: RouteParams) => {
  const { page = 1, pageSize = 10, query, filter } = await searchParams;

  const { success, data, error } = await getUsers({
    page: Number(page),
    pageSize: Number(pageSize),
    query,
    filter,
  });

  const { users, isNext } = data || {};

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">All users</h1>

      <div className="justibe-between smitems-center mt-11 flex gap-5 max-sm:flex-col">
        <LocalSearch
          route={ROUTES.COMMUNITY}
          imgSrc="/icons/search.svg"
          placeholder="Search users..."
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={UserFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px] w-full"
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

      <Pagination isNext={isNext || false} page={page} />
    </div>
  );
};

export default CommunityPage;
