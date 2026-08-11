import UserAvatar from "@/components/web/base/UserAvatar";
import ROUTES from "@/constants/routes";
import Link from "next/link";

const UserCard = ({ _id, name, image, username }: UserType) => {
  return (
    <div className="shadow-light100_darknone xs:w-[230px] w-full">
      <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8">
        <UserAvatar
          userId={_id}
          name={name}
          imageUrl={image}
          className="size-[100px] rounded-full object-cover"
          fallbackClassName="text-3xl tracking-widest"
        />

        <Link href={ROUTES.PROFILE(_id)}>
          <div className="mt-4 text-center">
            <h3 className="h3-bold text-dark200_light900 line-clamp-1">
              {name}
            </h3>
            <p className="body-regular text-dark500_light500 mt-2">
              {/*TODO: username */}
              @test_bartek
            </p>
          </div>
        </Link>
      </article>
    </div>
  );
};

export default UserCard;
