"use client"

import * as React from "react"


function Separator({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={`bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px ${className}`}
			{...props}
		/>
	)
}

export { Separator }