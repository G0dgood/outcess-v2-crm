

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={`bg-accent animate-pulse rounded-[var(--radius)] ${className}`}
			{...props}
		/>
	)
}

export { Skeleton }