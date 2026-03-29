import type { MouseEventHandler } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";


type EmptyStateProps = {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
  iconName: string;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
};

export function EmptyState({
  title,
  description,
  href,
  linkLabel,
  onClick,
  iconName

}: EmptyStateProps) {
  const router = useRouter();
  const action = onClick && href && linkLabel ? (
    <Button
      variant="link"
			onClick={(e) => {
				onClick(e as React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>);
				router.push(href);
			}}
      className="mt-4"
    >
      <div className="flex items-center justify-between gap-1 border-b-[1.5px] border-tecnova-blue text-tecnova-blue font-work-sans font-normal text-[12px] leading-5 tracking-[-0.02em]">
        <span>{linkLabel}</span>
        <span>→</span>
      </div>
    </Button>
  ) : onClick && linkLabel ? (
    <Button
			onClick={(e) => onClick(e as React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>)}
      className="mt-8"
      size="md"
    >
      {linkLabel}
    </Button>
  ) : href && linkLabel ? (
    <Button
      onClick={() => router.push(href)}
      className="mt-8"
      size="md"
    >
      {linkLabel}
    </Button>
  ) : null;

  return (
    <section className="flex flex-col items-center justify-center text-center min-h-[50vh] w-full">

      <Icon name={iconName} size={"8xl"} />
      <p 
        className="mt-8 font-sans font-normal text-[18px] md:text-[20px] leading-[42px] text-center tracking-[-0.03em]"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </p>
      <p 
        className="mt-2 font-sans font-normal text-[10px] md:text-[12px] leading-[24px] text-center tracking-[-0.03em] w-[300px] md:w-[350px] whitespace-nowrap"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>
      {action}
    </section>
  );
}

