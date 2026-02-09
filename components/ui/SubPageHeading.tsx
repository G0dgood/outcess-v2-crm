import React from 'react';

interface SubPageHeadingProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
}

export const SubPageHeading: React.FC<SubPageHeadingProps> = ({
    text,
    className = '',
    style,
}) => {
    return (
        <p className={`font-lato font-normal text-[10px] md:text-[12px] leading-[150%] text-[#6D7280] dark:text-gray-400 ${className}`} style={style}>
            {text}
        </p>
    );
};

export default SubPageHeading;
