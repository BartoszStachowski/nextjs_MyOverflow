import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  imgUrl: string;
  alt: string;
  value: number | string;
  title?: string;
  textStyles: string;
  href?: string;
  imgStyles?: string;
  titleStyles?: string;
}

const Metric = ({
  imgUrl,
  alt,
  value,
  title,
  href,
  textStyles,
  imgStyles,
  titleStyles,
}: Props) => {
  const metricContent = (
    <>
      <Image
        src={imgUrl}
        alt={alt}
        width={16}
        height={16}
        className={`rounded-full object-contain ${imgStyles}`}
      />

      <p className={`${textStyles} flex items-center gap-1`}>{value}</p>
      {title && (
        <span className={cn(`small-regular line-clamp-1`, titleStyles)}>
          {title}
        </span>
      )}
    </>
  );

  return href ? (
    <Link href={href} className="flex-center gap-1">
      {metricContent}
    </Link>
  ) : (
    <div className="flex-center gap-1">{metricContent}</div>
  );
};

export default Metric;
