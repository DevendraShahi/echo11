"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
  type Ref,
} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "./CornerButton.module.css";

type CornerButtonSize = "sm" | "md" | "lg" | "xl";
type CornerButtonTone = "cyan" | "white" | "muted";

type CornerButtonVars = CSSProperties & {
  "--corner-button-color"?: string;
};

const toneColors: Record<CornerButtonTone, string> = {
  cyan: "#00E5FF",
  white: "#F8FAFC",
  muted: "#8B949E",
};

export interface CornerButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  href?: string;
  target?: string;
  rel?: string;
  size?: CornerButtonSize;
  tone?: CornerButtonTone;
  color?: string;
  containerClassName?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

const CornerButton = forwardRef<HTMLElement, CornerButtonProps>(
  (
    {
      children,
      className,
      color,
      containerClassName,
      href,
      onClick,
      rel,
      size = "md",
      style,
      target,
      tone = "cyan",
      type = "button",
      ...props
    },
    ref
  ) => {
    const buttonStyle: CornerButtonVars = {
      "--corner-button-color": color ?? toneColors[tone],
      ...style,
    };

    const buttonClassName = cn(styles.cornerButton, styles[size], "group", className);
    const sharedProps = {
      className: buttonClassName,
      onClick,
      style: buttonStyle,
    };

    const content = href ? (
      href.startsWith("/") ? (
        <Link
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          rel={rel}
          target={target}
          {...sharedProps}
        >
          {children}
        </Link>
      ) : (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          rel={rel}
          target={target}
          {...sharedProps}
        >
          {children}
        </a>
      )
    ) : (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type={type}
        {...sharedProps}
        {...props}
      >
        {children}
      </button>
    );

    if (!containerClassName) {
      return content;
    }

    return <span className={containerClassName}>{content}</span>;
  }
);

CornerButton.displayName = "CornerButton";

export { CornerButton };
